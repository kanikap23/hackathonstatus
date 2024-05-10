import { useState, useEffect, useCallback, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { SocketContext } from "../../Context/SocketContext.jsx";
import { axiosConfig } from "../../Constants/config.js";
import { SERVER_URL, PYTHON_SERVER_URL } from "../../Constants/config.js";
import {
  BusNumberSVG,
  HidePasswordSVG,
  PasswordSVG,
  toastPayload,
  ContactSVG,
} from "../../Context/Assets.jsx";
import { PageContext } from "../../Context/PageContext.jsx";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./LoginAdmin.css";
function LoginAdmin() {
  let navigate = useNavigate();
  const [contactNumber, setcontactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [toggle, setToggle] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  let { socket, busId, setBusId } = useContext(SocketContext);
  const { page, setPage } = useContext(PageContext);

  const handleUserMedia = () => setTimeout(() => setWebCamLoader(false), 1000);

  function changePage(e) {
    if (e.target.innerText === "Register") setPage("Register");
    else setPage("Sign In");
  }
  const viewPassword = useCallback(
    function () {
      if (toggle === "password") setToggle("text");
      else setToggle("password");
    },
    [toggle]
  );

  async function loginDriver() {
    setIsLoading(true);

    if (contactNumber === "" || password === "") {
      setIsLoading(false);
      return toast.error("Fill all fields");
    }

    if (contactNumber !== "" && password !== "") {
      if (password.length < 6) {
        toast.error("Password should be atleast of 6 ", toastPayload);
        setIsLoading(false);
        return;
      }
      let regex1 = /^(?:\+91)?[0-9]{10}$/;
      if (!regex1.test(contactNumber)) {
        toast.error("Invalid Contact Number", toastPayload);
        setIsLoading(false);
        return;
      }
      let payload = {
        contactNumber,
        password,
      };

      console.log("response maar re bass");
      const response = await axios.post(
        `${SERVER_URL}/api/v1/admin/loginAdmin`,
        payload,
        axiosConfig
      );

      console.log("response received from python", response);

      setIsLoading(false);
      if (response.data.success === true) {
        // navigate("/driver/login")
        console.log("sign in before");
        toast.success("Sign In Successful", toastPayload);
        console.log("sign in after");
        //localStorage.setItem("id", response.data.bus);
        //setBusId(response.data.bus);
        navigate("/app/adminDashboard");
      } else {
        toast.error("Admin not found", toastPayload);
        console.log("Either Password is wrong or you have not registered");
      }
    }
  }
  return (
    <>
      <div className="flex flex-col mt-5 h-[100vh] rounded-lg items-center justify-center my-12">
        <div className="rounded-lg flex flex-col space-y-[4vh]">
          <div className="flex bg-white border border-black w-[290px] h-[50px] justify-between items-center rounded-lg self-center shadow-xl relative group">
            <input
              type="text"
              id="busNumber"
              className="placeholder-black focus:outline-none px-4 w-full"
              value={contactNumber}
              onChange={(e) => setcontactNumber(e.target.value)}
            />
            {contactNumber == "" ? (
              <label
                htmlFor="busNumber"
                className="ml-[8px] transform transition-all absolute top-0 left-0 h-full flex items-center pl-2 text-lg group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-[2px] peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0"
              >
                Contact Number
              </label>
            ) : (
              <label htmlFor="busNumber" className="hidden">
                Contact Number
              </label>
            )}
            <div className="p-2">
              <ContactSVG />
            </div>
          </div>

          <div className="flex bg-white border border-black w-[290px] h-[50px] justify-between items-center rounded-lg p-2 shadow-xl relative group">
            <input
              type={toggle}
              id="password"
              value={password}
              className="placeholder-black focus:outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
            {password == "" ? (
              <label
                htmlFor="password"
                class="ml-[8px] transform transition-all absolute top-0 left-0 h-full flex items-center pl-2 text-lg group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-[2px] peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0"
              >
                Password
              </label>
            ) : (
              <label for="busNumber" className="hidden">
                Password
              </label>
            )}
            <button onClick={viewPassword} className="">
              {toggle === "password" ? <PasswordSVG /> : <HidePasswordSVG />}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center mt-12">
            <h1 className="text-[#717171] text-[15px] mt-10">
              Don't have an account ?{" "}
              <button onClick={changePage} className="text-[#E93F4B]">
                Register
              </button>
            </h1>
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-b-4 border-l-3 border-r-3 border-yellow-500 mx-auto"></div>
            ) : (
              <button
                className="px-10 py-2 w-[200px] rounded-full font-bold  text-white bg-[#E93F4B] hover:text-gray-300 text-[20px]"
                onClick={loginDriver}
              >
                Log in
              </button>
            )}
          </div>
        </div>
        <ToastContainer transition={Zoom} />
      </div>
    </>
  );
}

export default LoginAdmin;

//Bus Loader ka aada yha se sabko milega
export function BusLoader() {
  return (
    <div className="loader-wrapper">
      <div className="truck-wrapper">
        <div className="truck">
          <div className="truck-container"></div>
          <div className="glases"></div>
          <div className="bonet"></div>

          <div className="base"></div>

          <div className="base-aux"></div>
          <div className="wheel-back"></div>
          <div className="wheel-front"></div>

          <div className="smoke"></div>
        </div>
      </div>
    </div>
  );
}
