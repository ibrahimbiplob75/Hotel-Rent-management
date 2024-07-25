import { useEffect, useState } from "react";
import Card from "./Card";
import Container from "../Shared/Container";
import { useSearchParams } from "react-router-dom";
import Empty from "../Shared/EmptyMessage/Empty";
import { GetRooms } from "../../api/room";



const Rooms = () => {
    
    const [rooms,setRooms]=useState([]);
    const [params, setParams] = useSearchParams();
    const category = params.get("category");
    // console.log(category)
    // console.log("cat",category)
    useEffect(()=>{
        GetRooms().then(data=>{
          if(category){
           const filter= data.filter(room=>room.category===category);
           setRooms(filter);
          }
          else{
            setRooms(data);
          }
    })
    },[category])
    
    return (
      <Container>
        {rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            {rooms.map((room) => (
              <Card key={room._id} room={room}></Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
            <Empty
              center={"text-center"}
              title={`${category} rooms are not availiable`}
              subtitle={"Find another Category"}
            ></Empty>
          </div>
        )}
      </Container>
    );
};

export default Rooms;