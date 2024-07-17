import React from 'react';
import Calender from '../../Shared/Calender';
import Button from '../../Button/Button';

const RoomReservation = ({room}) => {
    return (
      <div className="rounded-xl border-[1px] bg-white border-neutral-200 overflow-hidden">
        <div className="flex items-center gap-1 p-4">
          <p className="text-2xl font-semibold">${room?.price}</p>
          <p className="font-light text-neutral-600 mb-2">night</p>
          <hr />
        </div>
        <div className="flex justify-center">
          <Calender></Calender>
        </div>
        <div>
          <Button label={"Reservation"}></Button>
        </div>
        <hr />
        <div className="p-4 flex items-center justify-between font-semibold text-lg">
          <div>Total</div>
          <div>${room.price*3}</div>
        </div>
      </div>
    );
};

export default RoomReservation;