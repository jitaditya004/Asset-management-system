//helps in clean and readable routes then before
const {ROLES} = require("../config/roles");

exports.authorize = (permission) =>(req,res,next)=>{
  const user=req.user;

  if(!user || !user.role){
    return res.status(401).json({message:"Unauthorized"});
  }

  const allowedPermissions=ROLES[user.role] || [];
  if(!allowedPermissions.includes(permission)){
    return res.status(403).json({message:"Forbidden"});
  }

  next();
};