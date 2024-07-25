import { GetRooms } from "../../api/room";
import Categories from "../../components/Category/Categories";
import Rooms from "../../components/Rooms/Rooms"



const Home = () => {
  const rooms=GetRooms();
  console.log("rooms",rooms)
  return (
    <div>
      <Categories></Categories>
      <Rooms></Rooms>
    </div>
  );
}

export default Home
