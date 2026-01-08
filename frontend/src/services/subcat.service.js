import API from "../api/api";

export async function getAllSubCat(){
    return await API.get(`/subcategories/`);
}

export async function getSubCatByCategory(categoryId){
    return await API.get(`subcategories/by-category/${categoryId}`);
}