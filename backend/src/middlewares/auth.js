// external modules
const jwt = require("jsonwebtoken");
require("dotenv").config();

// authenticate a user
exports.authenticate = (req, res, next) => {
  //next();
  //get the cookie name
  const cookieName = process.env.COOKIE_NAME;
  // get the token from the cookies
  const token = req.cookies[cookieName];
  // if no token is found, return an error
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  // try to verify the token
  try {
    // verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // set the user in the request
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again."
      });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};
