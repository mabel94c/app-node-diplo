import 'dotenv/config';
import app from "./app.js";
import logger from './logs/logger.js';
import config from './config/env.js'
import { sequelize } from './database/database.js';

async function main() {
    await sequelize.sync({force:false}); //para persistir el cambio
 
    const port=config.PORT;
    app.listen(port);
    //app.listen(process.env.PORT); 
    console.log('Server running on http://localhost:'+port);
    //logger.error('This error');
    logger.info('corriendo en '+port);
}

main();


