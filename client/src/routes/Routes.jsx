import { createBrowserRouter } from 'react-router-dom'
import Main from '../layouts/Main'
import Home from '../pages/Home/Home'
import ErrorPage from '../pages/ErrorPage'
import Login from '../pages/Login/Login'
import SignUp from '../pages/SignUp/SignUp'
import RoomDetails from '../components/Rooms/RoomDetails'
import PrivateRoute from '../PrivateRoute/PrivateRoute'
import { GetRoom } from '../api/room'
import DashboardLayout from '../layouts/DashboardLayout'
import AddRoom from '../pages/Dashboard/Host/AddRoom'
import MyListings from '../pages/Dashboard/Host/MyListing'
import HostRoute from '../PrivateRoute/HostRoute'
import Profile from '../pages/Dashboard/Common/Profile'
import MyBookings from '../pages/Dashboard/Guest/MyBookings'
import ManageBookings from '../pages/Dashboard/Host/ManageBookings'
import ManageUsers from '../pages/Dashboard/Admin/ManageUsers'
import AdminMenu from '../components/Dashboard/Sidebar/Menu/AdminMenu'
import AdminRoute from '../PrivateRoute/AdminRoute'
import AdminStatistics from '../pages/Dashboard/Admin/AdminStatistics'
import HostStatistics from '../pages/Dashboard/Host/HostStatistics'
import GuestStatistics from '../pages/Dashboard/Guest/GuestStatistics'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/room/:id",
        element: (
          <PrivateRoute>
            <RoomDetails />
          </PrivateRoute>
        ),
        loader: ({ params }) => GetRoom(params.id),
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout></DashboardLayout>
      </PrivateRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "add-room",
        element: (
          <PrivateRoute>
            <HostRoute>
              <AddRoom></AddRoom>
            </HostRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "my-listings",
        element: (
          <PrivateRoute>
            <HostRoute>
              <MyListings></MyListings>
            </HostRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "my-profile",
        element: (
          <PrivateRoute>
            <Profile></Profile>
          </PrivateRoute>
        ),
      },
      {
        path: "my-bookings",
        element: (
          <PrivateRoute>
            <MyBookings></MyBookings>
          </PrivateRoute>
        ),
      },
      {
        path: "manage-bookings",
        element: (
          <PrivateRoute>
            <HostRoute>
              <ManageBookings></ManageBookings>
            </HostRoute>
          </PrivateRoute>
        ),
      },

      {
        path: "manage-users",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <ManageUsers></ManageUsers>
            </AdminRoute>
          </PrivateRoute>
        ),
      },

      {
        path: "admin-statis",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <AdminStatistics></AdminStatistics>
            </AdminRoute>
          </PrivateRoute>
        ),
      },

      {
        path: "host-statis",
        element: (
          <PrivateRoute>
            <HostRoute>
              <HostStatistics></HostStatistics>
            </HostRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "guest-statis",
        element: (
          <PrivateRoute>
              <GuestStatistics></GuestStatistics>
          </PrivateRoute>
        ),
      },
    ],
  },
]);
