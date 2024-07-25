import useAxios from "../hooks/useAxios"

const Axios=useAxios();

export const GetRooms=async()=>{
    const {data}=await Axios.get("/room");
    return data;
    
}
export const GetRoom=async id=>{
    const {data}=await Axios.get(`/room/${id}`);
    return data; 
}