import API from "../api/api";


const fetchMe = async () => {
    try {
        const res = await API.get("/user/me");
        return res.data.user;
    }catch(err){
        console.error(err);
    }
}

export {fetchMe};