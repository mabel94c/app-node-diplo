function validate(schema,target='body'){
    return (req,res,next)=>{
        const data = req[target];
        //paso 1> verificar q tenga datos.
        if(!data || Object.keys(data).length==0){
            return res.status(400).json({ message: 'no tiene data'});
        }
        //paso 2 validar contra el schema con opciones
        const {error, value} = schema.validate(data,{
            abortEarly: false,
            stripUnknown: true //eliminar campos no definidos        
        })
//paso 3 si hay errores de validacion devolver 400
        if(error){
            return res.status(400).json({
                message: `Error de validacion en ${target}`,
                errores: error.details.map(err=> err.message)
            })
        }

        //paso 4 reemplazar el objeto original
        req[target]=value;

        next();

    }
}

export default validate;