import useAxios from "../hooks/useAxios"

const Axios=useAxios();
export const getClientSecret=async (price)=>{
    const {data}=await Axios.post('/create-payment-intent',price)
    return data;
}

export const saveBookingInfo=async paymentInfo=>{
    const {data}=await Axios.post("/bookings",paymentInfo);
    return data;
}

export const updateBooked=async( id ,status)=>{
    const {data}=await Axios.patch(`/bookings/status/${id}`,{status})
    return data;
}

//my bookings data
export const MyBooked=async(email)=>{
    const {data}=await Axios.get(`bookings/${email}`);
    return data;
}

//host manage bookings data
export const managedBooked=async( email)=>{
    const {data}=await Axios.get(`/bookings/host/${email}`);
    return data;
}
