// external modules
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// internal modules
const { createUser, getUserByEmail, updatePasswordByEmail } = require("../models/userModel");

dotenv.config();

// register a new user
exports.register = async (req, res, next) => {
  try {
    const { 
      full_name, 
      email, 
      password, 
      phone = "NO PHONE", 
      designation = "NO DESIGNATION", 
      department 
    } = req.body;
    // check if required fields are provided
    if (
      !full_name ||
      !email ||
      !password ||
      !department
    ) {
      return res.status(400).json({ message: "full_name, email, password, and department are required" });
    }
    // check if user already exists
    const user = await getUserByEmail(email);
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    // hash password
    const passwordHash = await bcrypt.hash(
      password,
      process.env.BCRYPT_SALT_ROUNDS || 7
    );
    // create the new user - role is ALWAYS set to 'USER' server-side
    const newUser = await createUser(
      full_name,
      email,
      passwordHash,
      phone,
      designation,
      department
    );
    // return the new user
    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
};
// login a user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // check if all fields are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // check is token is already present
    const cookieName = process.env.COOKIE_NAME;
    const existingToken = req.cookies && req.cookies[cookieName];
    // if token is present, check if it is valid
    if (existingToken) {
      try {
        // decode the token
        const decoded = jwt.verify(existingToken, process.env.JWT_SECRET);
        // If token is valid and matches the email being logged in, user is already logged in
        if (decoded.email === email) {
          return res.status(200).json({
            message: "Already logged in",
            user: {
              user_id: decoded.user_id,
              public_id: decoded.public_id,
              email: decoded.email,
              role: decoded.role,
            },
          });
        }
      } catch (err) {
        // Token is invalid/expired, proceed with normal login
      }
    }
    // check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // create a payload for the token - include department_id for ASSET_MANAGER restrictions
    const payload = { 
      user_id: user.user_id, 
      public_id: user.public_id, 
      email: user.email, 
      role: user.role_name, // Use role_name from database
      department_id: user.department_id // Include for department-based access control
    };
    // sign the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    // set the cookie


    const isProd = process.env.NODE_ENV === "production";
    res.cookie(process.env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 86400000,
    });
    // return the user
    res.json({
      message: "Login successful",
      user: {
        user_id: user.public_id,
        full_name: user.name, // Use name field from database
        email: user.email,
        role: user.role_name, // Use role_name from database
      },
    });
  } catch (err) {
    next(err);
  }
};
// logout a user
exports.logout = (req, res) => {
  // clear the cookie
  res.clearCookie(process.env.COOKIE_NAME, { path: "/" });
  // return the message
  res.json({ message: "Logout successful" });
};

// Forgot password - generates reset token and returns it directly
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { email: user.email, type: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Reset token generated successfully",
      resetToken: resetToken,
    });
  } catch (err) {
    next(err);
  }
};

// Reset password - validates token and updates password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    // Validate password strength (optional - add your requirements)
    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Verify and decode the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is for password reset
      if (decoded.type !== "password_reset") {
        return res.status(400).json({ message: "Invalid reset token" });
      }
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Reset token has expired" });
      }
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // Check if user still exists
    const user = await getUserByEmail(decoded.email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(
      new_password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );

    // Update password
    await updatePasswordByEmail(decoded.email, passwordHash);

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    next(err);
  }
};





