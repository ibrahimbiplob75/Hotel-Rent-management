import { useEffect, useState } from "react";
import Container from "../Shared/Container";
import { useParams } from "react-router-dom";
import Loader from "../Shared/Loader";
import { Helmet } from "react-helmet-async";
import Heading from "./SingleRoom/Heading";
import EmptyState from "../Shared/EmptyState";
import RoomInfo from "./SingleRoom/RoomInfo";
import RoomReservation from "./SingleRoom/RoomReservation";


const RoomDetails = () => {
    const [room,setRoom]=useState({});
    const [loader,setLoader]=useState(true);
    const {id}=useParams();
    

    useEffect(()=>{
        setLoader(true);
        fetch("../../../public/rooms.json").then(res=>res.json()).then(data=>{

           const filter= data.find(room=>room?._id===id);
           setRoom(filter);
           setLoader(false)
        }) 
    },[id]);
    if(loader){
        return <Loader></Loader>
    }
    return (
      <Container>
        <Helmet>
          <title>Stay Vista |{room?.title}</title>
        </Helmet>
        {room && (
          <div className="max-w-screen-lg mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6">
              <div>
                <Heading title={room.title} subtitle={room.location} />
                <div className="w-full md:h-[70vh] overflow-hidden rounded-xl">
                  <img
                    className="object-cover w-full"
                    src={room.image}
                    alt="header image"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
              {/* Room Info */}
             <RoomInfo room={room}></RoomInfo>

              <div className="md:col-span-3 order-first md:order-last mb-10">
                {/* RoomReservation calender*/}
                <RoomReservation room={room} />
              </div>
            </div>
          </div>
        )}
      </Container>
    );
};

export default RoomDetails;