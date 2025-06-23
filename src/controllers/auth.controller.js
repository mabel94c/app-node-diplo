import { User } from '../models/user.js';
import { comparar } from '../common/bcrypt.js';
import jwt from 'jsonwebtoken'; 
import config from '../config/env.js';

async function login(req,res){
try {
    console.log('req.body:', req.body);
    
    const {username, password} = req.body;
    const user = await User.findOne({
        where: {
            username
        }
    });
    if (!user) {
        return res.status(403).json({message: 'User not found'});
    }

    const isMatch = await comparar(password, user.password);
    if (!isMatch) {
        return res.status(403).json({message: 'Usuario invalido'});
    }
    const token = jwt.sign(
        { userId: user.id  }, config.JWT_SECRET,
        { expiresIn: eval(config.JWT_EXPIRES_SECONDS) }
    );

    res.json({token});
    
} catch (error) {
    
}
}
export default {login};