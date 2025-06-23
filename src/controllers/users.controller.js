import { User } from "../models/user.js";
import { Task } from "../models/task.js";
import logger from "../logs/logger.js";
import { Status } from "../constants/index.js";
import { encriptar } from '../common/bcrypt.js'; 
import { Op } from 'sequelize';

async function getUsers(req,res,next ){
    try{
        const users = await User.findAll({
            attributes: ['id','username','password','status'],
            order: [['id','DESC']],
            where: {
                status:'ACTIVE'
            }
        });
 
        res.json(users);
    }catch(error){
        next(error);
        //logger.error(error.message);
        //res.status(500).json({message:error.message});
    }
}

async function createUser(req,res,next) {
    console.log('Entro al controlador');
    console.log(req.body);
    
    
    const {username,password} = req.body;
    try {
        const user = await User.create({
            username,
            password
        })
        res.json(user);
    } catch (error) {
        next(error);
        //logger.error(error.message);
        //res.status(500).json({message:error.message});
    }
}

async function getUser(req,res,next) {
const {id} = req.params;
    try {
        const user = await User.findOne({ 
            attributes  : ['username','status'],
            where: {
                id,
                status: Status.ACTIVE
            },
        });
        if(!user) {
            res.status(404).json({message: 'User not found'});
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
}

async function updateUser(req,res,next) {
    const {id} = req.params;
    const {username,password} = req.body;
    try {
        if(!username || !password) {
            return res.status(404).json({message: 'User not found'});
        }
        const passwordEncriptado= await encriptar(password);
        const user = await User.update({
        username ,
        password :passwordEncriptado}, {
            where: {
                id 
            }
        });
        res.json(user); 
    } catch (error) {
        next(error);
    }
}

async function deleteUser(req,res,next) {
    const {id} = req.params;
    try {
        await User.destroy({
            where: {
                id
            }
        });
         
        res.status(204).json({message: 'User deleted successfully'});
    } catch (error) {
        next(error);
    }
}

async function activateInactivate(req, res, next) {
    const { id } = req.params;
    const { status } = req.body; 
    try {
         if (!status ){
            return res.status(400).json({ message: 'Status is required' }); 
         }

         const user = await User.findByPk(id);
            if (!user) {    
                res.status(404).json({ message: 'User not found' });
            }
        if (user.status== status){
            res.status(409).json({ message: `User is already ${status}` });
        }    

        user.status= status;
        await user.save();
        res.json(user)
    } catch (error) {
        next(error);
    }           
}

async function getTasks(req, res, next) {
    const { id } = req.params;
    try {
        const user = await User.findOne({              
            attributes: ['username'] ,
            include: [{
                model: Task,
                attributes: ['name',  'done'],
                where: {
                    done:false
                }
            }],
            where: {
                id
            }
        });
       res.json(user);
    } catch (error) {
        next(error);
    }
}



async function getUsersPagination(req, res, next) {
    try {
        // Obtener parámetros de consulta con valores por defecto
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const orderBy = req.query.orderBy || 'id';
        const orderDir = req.query.orderDir || 'DESC';
        console.log('page: '+page);
        console.log('limit: '+limit);
        console.log('search: '+search);
        console.log('orderBy: '+orderBy);
        console.log('orderDir: '+orderDir);


        // Validar valores de limit
        const validLimits = [5, 10, 15, 20];
        const finalLimit = validLimits.includes(limit) ? limit : 10;

        // Validar orderBy
        const validOrderBy = ['id', 'username', 'status'];
        const finalOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'id';

        // Validar orderDir
        const finalOrderDir = orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Configurar opciones de consulta
        const options = {
            attributes: ['id', 'username', 'status'],
            where: {
                status: Status.ACTIVE
            },
            order: [[finalOrderBy, finalOrderDir]],
            offset: (page - 1) * finalLimit,
            limit: finalLimit
        };

        // Agregar búsqueda si existe
        if (search) {
            options.where.username = {
                [Op.iLike]: `%${search}%`
            };
        }

        // Obtener datos y total de registros
        const { count, rows } = await User.findAndCountAll(options);

        // Calcular total de páginas
        const pages = Math.ceil(count / finalLimit);

        // Construir respuesta
        const response = {
            total: count,
            page: page,
            pages: pages,
            data: rows
        };

        res.json(response);
    } catch (error) {
        next(error);
    }
}

export default{
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    activateInactivate, 
    getTasks,
    getUsersPagination
};