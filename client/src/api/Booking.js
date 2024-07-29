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
    const {data}=await Axios.patch(`/bookings/status/${id}`,status)
}