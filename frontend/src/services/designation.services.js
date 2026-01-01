import API from "../api/api";

export async function getAllDesig(){
    return await API.get(`/designations/`);
}
