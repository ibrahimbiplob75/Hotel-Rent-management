import { differenceInCalendarDays, format } from "date-fns";
import PropTypes from "prop-types";
import { useState } from "react";
import DeleteModal from "../../Modal/DeleteModal";
import useAxios from "../../../hooks/useAxios";
import { useMutation } from "@tanstack/react-query";




const BookingDataRow = ({ booking, refetch }) => {
  const Axios = useAxios();
  const [isCancel, setIsCancel] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => {
    setIsOpen(false);
  };

  const [dateRange, setdateRange] = useState([
    {
      startDate: new Date(booking?.from),
      endDate: new Date(),
    },
  ]);

  const cancelDay = parseInt(
    differenceInCalendarDays(new Date(booking.from), new Date())
  );

  // if(cancelDay<2){
  //   setIsCancel(false);
  // }
  

  // console.log(booking,cancelDay)

  //   delete
  const { mutateAsync } = useMutation({
    mutationFn: async (id) => {
      const { data } = await Axios.delete(`/booking/${id}`);
      return data;
    },
    onSuccess: async (data) => {
      console.log(data);
      refetch();
      toast.success("Booking Canceled");
      //   Change Room booked status back to false
      await Axios.patch(`/bookings/status/${booking?.room_id}`, {
        status: false,
      });
    },
  });

  //  Handle Delete
  const handleDelete = async (id) => {
    //console.log(id);
    try {
      await mutateAsync(id);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <tr>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="block relative">
              <img
                alt="profile"
                src={booking?.image}
                className="mx-auto object-cover rounded h-10 w-15 "
              />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-gray-900 whitespace-no-wrap">{booking?.title}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="block relative">
              <img
                alt="profile"
                src={booking?.host?.image}
                className="mx-auto object-cover rounded h-10 w-15 "
              />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-gray-900 whitespace-no-wrap">
              {booking?.guest?.name}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">
          ${booking?.totalPrice}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">
          {format(new Date(booking?.from), "P")}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">
          {format(new Date(booking?.to), "P")}
        </p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <button
          onClick={() => setIsOpen(true)}
          className="relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-red-200 opacity-50 rounded-full"
          ></span>
          {cancelDay < 2 ? (
            <button disabled className="relative">Can not Cancel Now</button>
          ) : (
            <span className="relative">Cancel</span>
          )}
        </button>
        {/* Delete Modal */}
        <DeleteModal
          handleDelete={handleDelete}
          closeModal={closeModal}
          isOpen={isOpen}
          id={booking?._id}
        />
      </td>
    </tr>
  );
};

BookingDataRow.propTypes = {
  booking: PropTypes.object,
  refetch: PropTypes.func,
};

export default BookingDataRow;
