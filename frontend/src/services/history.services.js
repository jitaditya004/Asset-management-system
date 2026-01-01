import API from "../api/api";

export async function getAssetHistory(public_id){
    return await API.get(`/history/${public_id}`);
}

export async function upadateStatAndHis(publicId,body){
    return await API.post(`/history/${publicId}`,body);
}
