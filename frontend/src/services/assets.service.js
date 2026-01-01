import API from "../api/api";

export async function getAssetsByPubId(publicId){
    return await API.get(`/assets/${publicId}`);
}

export async function deleteAssetsByPubId(assetId){
    return await API.delete(`/assets/${assetId}`);
}