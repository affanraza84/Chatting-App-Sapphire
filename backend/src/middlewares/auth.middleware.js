import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Token missing' 
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        if(decoded){
            const user = await User.findById(decoded.userId);
            if(!user){
                return res.status(401).json({ 
                    success: false,
                    message: 'Not authorized - User not found' 
                });
            }
            user.password = undefined;
            console.log(user);
            req.user = user;
            next();
        }
        else{
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized - Token Invalid' 
            });
        }
    } catch(error){
        console.log(error);
        return res.status(401).json({ 
            success: false,
            message: 'Not authorized' 
        });
    }
}