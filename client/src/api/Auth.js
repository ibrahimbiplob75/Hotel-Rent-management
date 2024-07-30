import useAxios from "../hooks/useAxios";
const Axios=useAxios();

export  const saveUser=async user=>{
    
    const createUser={
        email:user?.email,
        role:"guest",
        status:"verified"
    }
    const {data} = await Axios.put(`/users/${user?.email}`,createUser);
    return data;
}

export const allUsers=async ()=>{
    const {data}=await Axios.get("/users");
    return data;
}

export const userRole=async ({email,role})=>{
    const updateUser={
        email,
        role,
        status:"verified"
    }
    const {data} = await Axios.put(`/users/update/${email}`,updateUser);
    return data;
}

export  const roledUser=async user=>{
    
    const createUser={
        email:user?.email,
        role:"guest",
        status:"Requested"
    }
    const {data} = await Axios.put(`/users/roled/${user?.email}`,createUser);
    return data;
}

export const Tokengen=async email=>{
    const token = await Axios.post("/jwt",{email});
    return token;
}


export const TokenRemove=async ()=>{
    const Cleartoken = await Axios.get("/logout");
    return Cleartoken;
}