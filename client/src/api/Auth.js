import useAxios from "../hooks/useAxios";
    const Axios=useAxios();
export  const saveUser=async user=>{
    // console.log(user?.email)
    const Axios=useAxios();
    const createUser={
        email:user?.email,
        role:"guest",
        status:"verified"
    }
    const {data} = await Axios.put(`/users/${user?.email}`,createUser);
    return data;
}

export const Tokengen=async email=>{
    const token = await Axios.post("/jwt",email);
    return token;
}


export const TokenRemove=async ()=>{
    const Cleartoken = await Axios.get("/logout");
    return Cleartoken;
}