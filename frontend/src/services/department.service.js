import API from "../api/api";

export async function getAllDept(){
    return await API.get(`/departments/`);
}
