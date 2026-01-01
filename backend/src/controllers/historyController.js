const model = require("../models/historyModel");

exports.listStatusHistory=async(req,res,next)=>{
    try{
        const result=await model.getStatusHistory(req.params.publicId);
        res.json(result);
    }catch(err){
        next(err);
    }
}

exports.updateStatus = async (req, res,next) => {
    try{await model.updateAssetStatus({
      publicId: req.params.publicId,
      newStatus: req.body.newStatus,
      reason: req.body.reason,
      userId: req.user.user_id,
    });
    
    res.json({ message: "Asset status updated" });}
    catch(err){
      next(err);
    }
};