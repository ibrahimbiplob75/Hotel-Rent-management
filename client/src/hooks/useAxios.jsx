import axios from "axios";
import { TokenRemove } from "../api/Auth";


const instance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

const useAxios = () => {

  // Response interceptor for handling errors
  instance.interceptors.response.use(
    function (response) {
      return response;
    },
    async function (error) {
      console.log("Error Track in interceptor", error.response);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        await TokenRemove();
        window.location.replace("/login");
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useAxios;
