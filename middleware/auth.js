const auth = (req,res,next)=>{
    console.log("middleWare 1");
    next();
}

exports.auth = auth;