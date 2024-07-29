import React, { useState } from 'react';
import Calender from '../../Shared/Calender';
import Button from '../../Shared/Button/Button';
import { differenceInCalendarDays } from 'date-fns'
 import BookingModal from "../../Modal/BookingModal"
import useAuth from '../../../hooks/useAuth';

const RoomReservation = ({room,refetch}) => {
  const {user}=useAuth();
  let [isOpen, setIsOpen] = useState(false);

  const [dateRange, setdateRange] = useState([
    {
      startDate: new Date(room?.from),
      endDate: new Date(room?.to),
      ket: "selection",
    },
  ]);
  const totalPrice =
    parseInt(differenceInCalendarDays(new Date(room.to), new Date(room.from))) *
    room?.price;

   const closeModal = () => {
     setIsOpen(false);
   };

   const [bookingInfo, setBookingInfo] = useState({
     guest: {
       name: user?.displayName,
       email:user?.email,

     },
     host: {
       name: room?.host?.name,
       email:room?.host.email,
       image:room?.host.image,
     },
     from: new Date(room?.from),
     to: new Date(room?.to),
     title: room?.title,
     location: room?.location,
     room_id: room?._id,
     totalPrice:totalPrice,
     image:room?.image
   });
  


  
    return (
      <div className="rounded-xl border-[1px] bg-white border-neutral-200 overflow-hidden">
        <div className="flex items-center gap-1 p-4">
          <p className="text-2xl font-semibold">${room?.price}</p>
          <p className="font-light text-neutral-600 mb-2">night</p>
          <hr />
        </div>
        <div className="flex justify-center">
          <Calender dateRange={dateRange}></Calender>
        </div>
        <div onClick={() => setIsOpen(true)}>
          <Button label={"Reservation"}></Button>
        </div>
        <hr />
        <div className="p-4 flex items-center justify-between font-semibold text-lg">
          <div>Total</div>
          <div>${totalPrice}</div>
        </div>

        <BookingModal
          closeModal={closeModal}
          isOpen={isOpen}
          bookingInfo={bookingInfo}
          refetch={refetch}
        ></BookingModal>
      </div>
    );
};

export default RoomReservation;