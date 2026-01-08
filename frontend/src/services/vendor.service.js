import API from "../api/api";

export async function getAllVendor(){
    return await API.get(`/vendors/`);
}
