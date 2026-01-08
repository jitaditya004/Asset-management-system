import API from "../api/api";

export async function getAllCat(){
    return await API.get(`/categories/`);
}
