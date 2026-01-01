module.exports=canUploadAsset=(user, assetDeptId)=> {
  if (!user || !user.role) return false;  
  if (user.role === "ADMIN") return true;

  if (
    user.role === "ASSET_MANAGER" &&
    user.department_id === assetDeptId
  ) return true;

  return false;
}

