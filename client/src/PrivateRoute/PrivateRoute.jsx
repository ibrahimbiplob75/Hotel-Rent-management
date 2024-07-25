import Loader from "../components/Shared/Loader";
import useAuth from "../hooks/useAuth";
import {Navigate, useLocation} from "react-router-dom"

const PrivateRoute = ({children}) => {
    const location=useLocation();
    const {user,loading}=useAuth();
    if(loading){
        <Loader></Loader>
    }
    if(user){
        return children
    }
    <Navigate to={"/login"} state={{from:location}}></Navigate>

};

export default PrivateRoute;