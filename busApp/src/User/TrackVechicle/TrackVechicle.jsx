import React, { useState, useEffect, useContext, useDeferredValue } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
  MarkerF,
  TrafficLayer,
  useLoadScript,
} from "@react-google-maps/api";
import { SocketContext } from "../../Context/SocketContext";
import "./TrackVechicle.css";
import { MAPS_KEY } from "../../Constants/keys.js";
import {
  adminAddress,
  axiosConfig,
  SERVER_URL,
} from "../../Constants/config.js";
import {io} from "socket.io-client"
import { ToastContainer, Zoom, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastPayload } from "../../Context/Assets";
import stopAudio from "./stop.mp4";
import { unmountComponentAtNode } from "react-dom";

const socket1=io("http://192.168.137.63:8080")

const MemoizedDirectionsRenderer = React.memo(({ directions }) => (
  <DirectionsRenderer options={{ directions: directions }} />
));

const MemoizedDirectionsService = React.memo(
  ({ directionsOptions, setDirectionsResponse }) => (
    <DirectionsService
      options={directionsOptions}
      callback={(response) => {
        if (response !== null) {
          if (response.status === "OK") {
            setDirectionsResponse(response);
          } else {
            console.log("response: ", response);
          }
        }
      }}
    />
  )
);

function PanicButton({ busDetails }) {
  console.log("panic button ", busDetails);
  const { id } = useParams();
  let [latitude, setLatitude] = useState(0);
  let [longitude, setLongitude] = useState(0);
  let emergencyaudio = new Audio(stopAudio);
  const { socket } = useContext(SocketContext);
  const [placeName, setPlaceName] = useState();
  const [panicDetails, setPanicDetails] = useState({
    alertBusNumber: "",
    alertLatitude: "",
    alertLongitude: "",
    alertBusRoute: "",
    alertSignal: false,
  });
  const [audio, setAudio] = useState(null);

  //listening for coordinates
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    });
  }, [latitude, longitude]);

  //listening for PANIC ALARM
  useEffect(() => {
    socket.on("sendAlarm", (payload) => {
      console.log("alert payload ", payload);

      axios
        .get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${payload.latitude}&lon=${payload.longitude}&apiKey=9ada7ada2093459b907a5a079ecf9718`
        )
        .then((response) => {
          console.log("response fetched", response);
          setPlaceName([
            response.data.features[0].properties.address_line1,
            response.data.features[0].properties.address_line2,
          ]);
          console.log(
            "response.data.features[0].properties",
            response.data.features[0].properties.address_line1,
            response.data.features[0].properties.address_line2
          );
        });
      //api.geoapify.com/v1/geocode/reverse?lat=51.21709661403662&lon=6.7782883744862374&apiKey=9ada7ada2093459b907a5a079ecf9718", requestOptions

      toast.warn("An Emergency Occured", {
        autoClose: 1000,
        position: "top-center",
        theme: "dark",
      });
      setPanicDetails({
        ...panicDetails,
        alertBusNumber: `${payload.busNumber}`,
        alertLatitude: `${payload.latitude}`,
        alertLongitude: `${payload.longitude}`,
        alertBusRoute: `${payload.busRoute}`,
        alertSignal: true,
      });

      emergencyaudio.play();
      setAudio(emergencyaudio);
    });
  }, []);

  //sending the EVENT
  function panic() {
    console.log("pressed");
    let payload = {
      busNumber: busDetails.busNumber,
      busRoute: busDetails.route.routeName,
      latitude,
      longitude,
    };
    console.log(payload);
    socket.emit("panicAlarm", payload);

    const sosPayload = {
      recipientAddress: adminAddress,
      subject: "SOS",
      message: `Emergency on BusNumber ${busDetails.busNumber} on route: ${busDetails.route.routeName}
            Driver Name: ${busDetails.driver.name},
            Driver Contact: ${busDetails.driver.contactInfo},
            Live Location: http://localhost:5173/bus-real#/user/trackVehicle/6507b12bb75297ebd9110f8b
            `,
    };

    axios
      .post(
        `https://sos-message.azurewebsites.net/api/sos-mail?code=_kVVzKkAx9GlalN6MWe7l9QGTMsRH9MKckEB5_ysjPzgAzFucyZDmg==`,
        sosPayload
      )
      .then((response) => console.log(response));
  }

  return (
    <>
      <div className="mt-10 flex flex-col items-center mb-[30px]">
        <button
          className="w-[100px] h-[100px] bg-red-600 border-2 border-red-700 rounded-full text-white text-[20px] focus:outline-none absolute overflow-hidden transform transition-transform duration-100 hover:-translate-y-0.5 active:translate-y-0.5 active:bg-red-700 active:scale-95 shadow-custom2 right-16 bottom-24"
          onClick={panic}
        >
          PANIC!
          {/* TODO: */}
          {/* <div className="absolute inset-0 flex items-center justify-center bg-opacity-0 bg-white hover:bg-opacity-30 transition-opacity duration-100 opacity-0 active:opacity-100">
            PANIC!
          </div> */}
        </button>
        <div className="flex flex-col items-center justify-center">
          {/* FIXME: */}
          {/* Changes */}
          {panicDetails.alertSignal === true ? (
            <div className="w-[350px] aspect-auto  bg-red-600 text-white absolute p-4 left-[45%] rounded-xl alert-blink">
              {console.log("panicDetails", panicDetails)}
              <h1>Bus Number :- {panicDetails.alertBusNumber}</h1>
              <h1>Bus Route :- {panicDetails.alertBusRoute}</h1>
              {placeName && (
                <div className="">
                  <div className="flex ">
                    <h1>Curr. Location:-</h1>
                    <h1 className="ml-2">{placeName[0]}</h1>
                  </div>
                  <div>
                    <h1>{placeName[1]}</h1>
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (audio) {
                      console.log(audio);
                      audio.pause();
                      setAudio(null);
                    }
                    setPanicDetails({ ...panicDetails, alertSignal: false });
                  }}
                  className="bg-black text-white p-[0.4rem] rounded-xl mt-2 "
                >
                  Ignore Notification
                </button>
              </div>
            </div>
          ) : (
            <h1></h1>
          )}
          <ToastContainer />
        </div>
      </div>
    </>
  );
}

function Map() {
  const { socket } = useContext(SocketContext);
  const { id } = useParams();
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [directionsOptions, setDirectionsOptions] = useState();
  const [progress, setProgress] = useState();

  useEffect(() => {
    socket.on(`busLocation-${id}`, (payload) => {
      setLatitude(payload.latitude);
      setLongitude(payload.longitude);
      setProgress(payload.progress);
      console.log(payload);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const route = await axios.get(
        `${SERVER_URL}/api/v1/activeBus/${id}`,
        axiosConfig
      );
      const waypoints = [];
      route.data.bus.route.stations.map((station) => {
        waypoints.push({
          location: `${station.position[0]} ${station.position[1]}`,
          stopover: true,
        });
      });

      const directionsOptions = {
        destination: waypoints[waypoints.length - 1].location,
        origin: waypoints[0].location,
        waypoints: waypoints,
        travelMode: "DRIVING",
      };
      setDirectionsOptions(directionsOptions);
    })();
  }, []);

  return (
    <>
      <GoogleMap
        zoom={10}
        center={{ lat: latitude, lng: longitude }}
        mapContainerClassName="container shadow-custom"
      >
        {directionsOptions && (
          <MemoizedDirectionsService
            directionsOptions={directionsOptions}
            setDirectionsResponse={setDirectionsResponse}
          />
        )}
        {directionsResponse && (
          <>
            <TrafficLayer />
            <MemoizedDirectionsRenderer directions={directionsResponse} />
          </>
        )}
        <MarkerF position={{ lat: latitude, lng: longitude }} />
      </GoogleMap>
      <ul className="">
        <ul
          className={
            "absolute left-[8%] top-[50%] border-l-[6px] border-red-600 flex flex-col gap-[15px]"
          }
        >
          {progress &&
            progress.map((p) => {
              return (
                <li className={"ml-[-11px] flex flex-row items-center gap-2"}>
                  <div
                    className={
                      p.reached
                        ? "w-4 h-4 bg-[#38B3F9] rounded-full"
                        : "w-4 h-4 bg-red-600 rounded-full"
                    }
                  ></div>
                  <p
                    className={p.reached ? "text-[#38B3F9]" : "text-red-700"}
                  >{`${p.distance} ${p.eta}`}</p>
                </li>
              );
            })}
        </ul>
      </ul>
    </>
  );
}

function Card({
  busNumber,
  busNumberPlate,
  contactInfo,
  route,
  age,
  name,
  busStatus,
}) {
  const { id } = useParams();
  return (
    <>
      <div className="flex flex-col items-center justify-between mb-[30px]">
        <div className="rounded-[20px] bg-[#E93F4B] w-[32vw] text-white pt-4 pb-4 pl-6 pr-6 space-y-2 shadow-custom  absolute left bottom-16">
          <h1>Bus Number :{busNumber}</h1>
          <h1>Bus Number Plate : {busNumberPlate}</h1>
          <h1>Driver Name : {name}</h1>
          <h2 className="">Driver Contact Information : {contactInfo}</h2>
          <div className="flex">
            Bus Status : &nbsp;{" "}
            {busStatus === "active" ? (
              <h1 className="w-[20px] h-[20px] rounded-full animate-pulse bg-green-600"></h1>
            ) : (
              <h1 className="w-[20px] h-[20px]rounded-full animate-pulse bg-red-600"></h1>
            )}
          </div>
        </div>
      </div>
      <div className="text-[#9A9A9A]  absolute bottom-2 left-1/2 -translate-x-1/2">
        Enjoying your ride?{" "}
        <Link to={`/user/feedback/${id}`} className="text-red-600">
          Provide feedback
        </Link>
      </div>
    </>
  );
}

export function TrackVechicle() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: MAPS_KEY,
  });
  const { socket } = useContext(SocketContext);
  const { id } = useParams();
  const [dataReceived, setDataReceived] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [passenger, setPassenger] = useState(0);
  const pc=useDeferredValue(passenger)
  async function getActiveBusDetails() {
    const response = await axios.get(
      `${SERVER_URL}/api/v1/activeBus/${id}`,
      axiosConfig
    );
    console.log("axios ");
    console.log(response.data.bus);
    // console.log(response.data.buses)
    setDataReceived(response.data.bus);
    setLoading(false);
  }

  useEffect(() => {
    socket1.on("message", (payload) => {
      setPassenger(payload.data);
    });
  }, [passenger]);

  useEffect(() => {
    console.log(`busLocation-${id}`);
    getActiveBusDetails();
  }, []);

  if (!isLoaded) return <h1>Loading...</h1>;
  else {
    return (
      <div className="w-[100vw] h-screen flex flex-col items-center font-lexend">
        <div className="mt-[40px]">
          <Map />
        </div>
        <h1 className="relative top-[30px] right-[60px] text-[#9A9A9A] text-[20px]">
          PASSENGER COUNT : <span className="text-[black]">{pc}/60</span>
        </h1>
        <div className="flex h-[90vh] justify-between items-center w-[60%]">
          {isLoading ? (
            <h1> Loading... </h1>
          ) : (
            <Card
              key={dataReceived._id}
              busNumber={dataReceived.busNumber}
              busNumberPlate={dataReceived.busNumberPlate}
              contactInfo={dataReceived.driver.contactInfo}
              route={dataReceived.route}
              age={dataReceived.driver.age}
              name={dataReceived.driver.name}
              busStatus={dataReceived.busStatus}
              objectId={dataReceived._id}
            />
          )}
          <PanicButton className={""} busDetails={dataReceived} />
        </div>
      </div>
    );
  }
}
