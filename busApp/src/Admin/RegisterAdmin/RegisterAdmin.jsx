import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { SERVER_URL , axiosConfig} from "../../Constants/config";
import LoginAdmin from "../LoginAdmin/LoginAdmin.jsx";
import {
  UserSVG,
  PasswordSVG,
  HidePasswordSVG,
  BusNumberPlate,
  ContactSVG,
  BusNumberSVG,
  toastPayload,
} from "../../Context/Assets";
import { PageContext } from "../../Context/PageContext";
import { ToastContainer, Zoom, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import main from "../../assets/main.jpg";

function RegisterAdmin() {
  let navigate = useNavigate();
 
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [toggle, setToggle] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const { page, setPage } = useContext(PageContext);
  const [fileDetails, setFileDetails] = useState("");

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

  async function submitDetails() {
    if (
      name !== "" &&
      contact !== "" &&
      password !== ""
    ) {
      setIsLoading(true);
      //checking for password length
      if(password.length < 6)
      {
        toast.error("Password should be atleast of 6 ",toastPayload)
        setIsLoading(false)
        return ;
      }

      //checking for contact number
      let regex1=/^(?:\+91)?[0-9]{10}$/
      if(!regex1.test(contact))
      {
        toast.error("Invalid Contact Number",toastPayload)
        setIsLoading(false)
        return ;
      }

      regex1=/^[A-Za-z\s']+$/
      if(!regex1.test(name))
      {
        toast.error("Invalid Name",toastPayload)
        setIsLoading(false)
        return ;
      }

      let payload = {
        userName:name,
        contactNumber: contact,
        password,
      };
      console.log(payload);
      const response = await axios.post(
        `${SERVER_URL}/api/v1/admin/registerAdmin`,
        payload,
        axiosConfig
      );

      console.log(response)
      setIsLoading(false);
      if (response.data.success === true) {
        toast.success("Registered Successfully", toastPayload);
        setPage("Sign In");
      } else {
        toast.error("Driver Already Registered !!", toastPayload);
      }
    } else {
      return toast.error("Missing Fields Information", toastPayload);
    }
  }

  return (
    <div className="flex h-[100vh] w-[100vw] overflow-hidden font-comic-neue">
      <div className="bg-[#F5FDFF] h-[100vh] w-[35%] flex flex-col items-center">
        <div className="flex flex-col mt-[6vh]">
          <div className="flex space-x-20">
            <button
              className={` text-2xl ${
                page === "Sign In" ? "text-[#BAA2A2]" : "text-black"
              }`}
              onClick={changePage}
            >
              Register
            </button>
            <button
              className={`text-2xl ${
                page === "Register" ? "text-[#BAA2A2]" : "text-black"
              }`}
              onClick={changePage}
            >
              Sign In
            </button>
          </div>
          <div>
            <div
              className={`shadow-xl rounded-lg line bg-[#E01A27] h-[5px] w-[35%] transition-transform ${
                page === "Register" ? "translate-x-0" : "translate-x-[160px]"
              }`}
            ></div>
          </div>
        </div>
        {page === "Register" ? (
          <div className="mt-[4vh]">
            <div className="flex flex-col items-center space-y-[2vh] h-full ">
            

              <div className="flex bg-white border border-black w-[290px] h-[50px] justify-between items-center rounded-lg p-2 shadow-xl relative group">
                <input
                  type="text"
                  id="name"
                  value={name}
                  className="placeholder-black focus:outline-none"
                  onChange={(e) => setName(e.target.value)}
                />
                {name == "" ? (
                  <label
                    htmlFor="name"
                    className="ml-[8px] transform transition-all absolute top-0 left-0 h-full flex items-center pl-2 text-lg group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-[2px] peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0"
                  >
                    Name
                  </label>
                ) : (
                  <label htmlFor="name" className="hidden">
                    Name
                  </label>
                )}
                <UserSVG />
              </div>

              <div className="flex bg-white border border-black w-[290px] h-[50px] justify-between items-center rounded-lg p-2 shadow-xl relative group">
                <input
                  type="text"
                  id="contact"
                  value={contact}
                  className="placeholder-black focus:outline-none"
                  onChange={(e) => setContact(e.target.value)}
                />
                {contact == "" ? (
                  <label
                    htmlFor="contact"
                    className="ml-[8px] transform transition-all absolute top-0 left-0 h-full flex items-center pl-2 text-lg group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-[2px] peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0"
                  >
                    Contact Number
                  </label>
                ) : (
                  <label htmlFor="name" className="hidden">
                    Contact Number
                  </label>
                )}
                <ContactSVG />
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
                    className="ml-[8px] transform transition-all absolute top-0 left-0 h-full flex items-center pl-2 text-lg group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-[2px] peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0"
                  >
                    Password
                  </label>
                ) : (
                  <label htmlFor="name" className="hidden">
                    Password
                  </label>
                )}
                <button onClick={viewPassword} className="">
                  {toggle === "password" ? (
                    <PasswordSVG />
                  ) : (
                    <HidePasswordSVG />
                  )}
                </button>
              </div>

              <div className="flex flex-col items-center space-y-5 absolute bottom-6    ">
                <h1 className="text-[15px]">
                  Have an account already ?{" "}
                  <button onClick={changePage} className="text-[#E93F4B]">
                    Sign In
                  </button>
                </h1>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-b-4 border-l-3 border-r-3 border-yellow-500 mx-auto"></div>
                ) : (
                  <button
                    className="px-2 py-1 w-[200px] rounded-full font-bold  text-white bg-[#E93F4B] hover:text-gray-300 text-[20px]"
                    onClick={submitDetails}
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <LoginAdmin />
        )}
      </div>
      <div>
        <img src={main} alt="photo" className="h-[100vh] w-[100vw]" />
      </div>
      <ToastContainer transition={Zoom} />
    </div>
  );
}

export default RegisterAdmin;
