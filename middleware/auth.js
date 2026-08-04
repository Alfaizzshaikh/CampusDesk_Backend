const jwt = require('jsonwebtoken');


const auth = (req,res,next)=>{
console.log("Middleware Hit");
    const AuthHead = req.headers.authorization;
    if(!AuthHead){
        
        return res.status(401).send("Token not found");
        
    }

    const token = AuthHead.split(" ")[1];
    const decoded = jwt.verify(token , process.env.JWT_SECRET);
    req.user = decoded;
    next();
}

exports.auth = auth;