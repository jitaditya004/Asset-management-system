// role based authorization
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: "Access denied: No user role" });
  }
  const userRole = req.user.role.toUpperCase();
  const allowedRoles = roles.length 
    ? roles.map(r => r.toUpperCase()) 
    : ["USER"];
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: "Access denied: Insufficient role" });
  }
  next();
}