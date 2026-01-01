// internal modules
const { getAllUsers,getUserByEmail, getUserByPublicId, updateUserById, deleteUserById, promoteToAssetManager } = require("../models/userModel");

// Verify current session - returns user info if logged in
exports.me = async (req, res, next) => {
  try {
    // This endpoint requires authenticate middleware, so req.user is already set
    // Fetch full user details from database to get full_name
    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role_name,
        public_id: user.public_id,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.userId; // Should be the internal user_id, not public_id
    const updateFields = req.body;

    // Optionally, restrict who can update user details, depending on your requirements

    // Only allow permitted fields to update; checked in model as well
    const updatedUser = await updateUserById(userId, updateFields);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

exports.promoteToAssetManager = async (req, res, next) => {
  try {
    const { userId } = req.params; // This should be public_id from frontend

    // Prevent self-promotion
    if (req.user.public_id === userId) {
      return res.status(403).json({ 
        message: "You cannot promote yourself to ASSET_MANAGER" 
      });
    }

    // Get user by public_id to get internal user_id
    const targetUser = await getUserByPublicId(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already ASSET_MANAGER
    if (targetUser.role_name === "ASSET_MANAGER") {
      return res.status(400).json({ 
        message: "User is already an ASSET_MANAGER" 
      });
    }

    // Promote user
    const promotedUser = await promoteToAssetManager(targetUser.user_id);

    res.json({
      message: "User promoted to ASSET_MANAGER successfully",
      user: {
        user_id: promotedUser.public_id,
        name: promotedUser.name,
        email: promotedUser.email,
        department: promotedUser.department_name,
        role: promotedUser.role_name,
      },
    });
  } catch (err) {
    // Handle database constraint violation (one ASSET_MANAGER per department)
    if (err.message && err.message.includes("already has an ASSET_MANAGER")) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Optionally, restrict who can delete user accounts

    const deletedUser = await deleteUserById(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (err) {
    next(err);
  }
};

exports.getAllUser = async (req,res,next)=>{
  try{
    const result=await getAllUsers();

    res.json(result.rows);
  }catch(err){
    next(err);
  }
};