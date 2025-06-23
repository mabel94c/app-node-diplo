 import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export function authenticateToken(req, res, next) {
    const authHander =  req.headers['authorization'] || req.headers['Authorization'];
    const token = authHander && authHander.split(' ')[1];
    if(token==null)return res.sendStatus(401);

    jwt.verify(token, config.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};