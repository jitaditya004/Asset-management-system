import API from "../api/api";

export async function getAttachUrls (docId){
    return await API.get(`/assets/${docId}/attachments/url`);
}

export async function deleteDoc(docId){
    return await API.delete(`/assets/${docId}/attachments`);
}