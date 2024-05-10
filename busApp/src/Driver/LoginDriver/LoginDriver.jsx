import { useState, useEffect, useCallback, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { SocketContext } from "../../Context/SocketContext";
import { SERVER_URL, PYTHON_SERVER_URL } from "../../Constants/config.js";
import {
  BusNumberSVG,
  HidePasswordSVG,
  PasswordSVG,
  toastPayload,
  ContactSVG,
} from "../../Context/Assets";
import { PageContext } from "../../Context/PageContext";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Webcam from "react-webcam";
import "./LoginDriver.css";
function LoginDriver() {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState("");
  const [toggleImg, setToggleImg] = useState("Take Photo");
  let navigate = useNavigate();
  const [contactNumber, setcontactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [toggle, setToggle] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [webCamLoader, setWebCamLoader] = useState(true);
  let { socket, busId, setBusId } = useContext(SocketContext);
  const { page, setPage } = useContext(PageContext);

  const handleUserMedia = () => setTimeout(() => setWebCamLoader(false), 1_000);

  function capturePhoto() {
    if (toggleImg === "Take Photo") {
      const imgASCII = webcamRef.current.getScreenshot();
      setImageSrc(imgASCII);
      setToggleImg("Take Again");
    } else {
      setToggleImg("Take Photo");
      setImageSrc("");
    }
  }

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

    if (contactNumber === "" || imageSrc === "") {
      setIsLoading(false);
      return toast.error("Fill all fields");
    }

    if (contactNumber !== "" && imageSrc !== "") {
      if (contactNumber.length !== 10) {
        setIsLoading(false);
        return toast.error("Check Typed Contact Number");
      } else {
        let payload = {
          contactNo: contactNumber,
          image: imageSrc,
        };

        const response = await axios.post(
          `${PYTHON_SERVER_URL}/save-image`,
          payload
        );

        console.log("response received from python", response);

        setIsLoading(false);
        if (response.data.result === "True") {
          // navigate("/driver/login")
          console.log("sign in before");
          toast.success("Sign In Successful", toastPayload);
          console.log("sign in after");
          localStorage.setItem("id", response.data.bus);
          setBusId(response.data.bus);
          navigate("/driver/dashboard");
        } else {
          toast.error("Driver not found", toastPayload);
          console.log("Either Password is wrong or you have not registered");
        }
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

          {/* <div className="flex bg-white border border-black w-[290px] h-[50px] justify-between items-center rounded-lg p-2 shadow-xl relative group">
                //     <input type={toggle} id="password" value={password}  className="placeholder-black focus:outline-none" onChange={(e)=>setPassword(e.target.value)}/>
                //     {password==""?(
                // <label for="password" class="ml-[8px] transform transition-all absolute top-0 left-0 h-full flex items-center pl-2 text-lg group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-[2px] peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0">Password</label>):(<label for="busNumber" className="hidden">Password</label>)}
                //     <button onClick={viewPassword} className="">{toggle === "password"? <PasswordSVG />:<HidePasswordSVG />}</button>
                </div> */}

          <div className="flex-col items-center justify-between w-[300px] ml-[10%] ">
            <div className=" h-[100%] w-[80%] flex relative">
              {imageSrc === "" && toggleImg === "Take Photo" ? (
                <>
                  {webCamLoader && <BusLoader />}
                  <Webcam
                    ref={webcamRef}
                    style={{ opacity: webCamLoader ? 0 : 1 }}
                    screenshotFormat="image/jpeg"
                    onUserMedia={handleUserMedia}
                  />
                </>
              ) : (
                <img src={imageSrc} className=" aspect-auto h-42 mb-4" />
              )}
            </div>
            {!webCamLoader && (
              <div className="mb-4">
                <button
                  className=" w-32 h-7 ml-14 justify-between items-center bg-red-500 text-white rounded-xl cursor-pointer mb-4"
                  onClick={capturePhoto}
                >
                  {toggleImg}
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center mt-12">
            {/* <h1 className="text-[#717171] text-[15px] mt-10">
              Don't have an account ?{" "}
              <button onClick={changePage} className="text-[#E93F4B]">
                Register
              </button>
            </h1> */}
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-b-4 border-l-3 border-r-3 border-yellow-500 mx-auto my-6"></div>
            ) : (
              <button
                className="px-10 py-2 w-[200px] rounded-full font-bold  text-white bg-[#E93F4B] hover:text-gray-300 text-[20px] mb-6 relative top-8"
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

export default LoginDriver;

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
