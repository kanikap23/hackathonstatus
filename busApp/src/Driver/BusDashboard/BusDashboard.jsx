import React, { useState, useEffect, useContext, useRef } from "react";
import { SocketContext } from "../../Context/SocketContext";
import { Link } from "react-router-dom";
import { request_url } from "../../constant/constants";
import axios from "axios";
import Shimmer from "../../Shimmer/Shimmer";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toastPayload } from "../../Context/Assets";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { MAPS_KEY } from "../../Constants/keys.js";
import "./BusDashboard.css";
import {
  MemoizedDirectionsRenderer,
  MemoizedDirectionsService,
} from "../SendLocation/SendLocation.jsx";

import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { useMap, Marker, Popup } from "react-leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

//Socket
import io from "socket.io-client";
const socket = io("http://localhost:10000");

L.Marker.prototype.options.icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
});

function BusDashboard() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [busNumberPlate, setBusNumberPlate] = useState("");
  const [busStatus, setBusStatus] = useState("");
  const [busRoute, setBusRoute] = useState();
  const [imageUrl, setImageUrl] = useState("");
  const [routeName, setRouteName] = useState();

  const [isLoading, setIsLoading] = useState(true);
  const busId = localStorage.getItem("id");
  // const { socket, busId, setBusId } = useContext(SocketContext);
  console.log("busId", busId);

  async function getDetails() {
    const response = await axios.get(request_url + `activeBus/${busId}`);
    const Data = response.data.bus;
    console.log("response", Data);
    setName(Data.driver.name);
    setContact(Data.driver.contactInfo);
    setBusNumber(Data.busNumber);
    setBusNumberPlate(Data.busNumberPlate);
    setBusStatus(Data.busStatus);
    setIsLoading(false);
    setImageUrl(response.data.bus.photo.secure_url);
    setBusRoute(Data.route);
    setRouteName(Data.route.routeName);
  }

  useEffect(() => {
    toast.success("Welcome to Dashboard", toastPayload);
    getDetails();
  }, []);

  return (
    <div
      className={"absolute top-0 left-0 bg-white w-full h-full overflow-hidden"}
    >
      <div className=" z-50 fixed w-full top-0 left-0 bg-[#E80202] h-[60px] flex items-center justify-center space-x-80 text-white text-3xl">
        <Link to="/driver/dashboard">
          <span className={"font-bold"}>Home</span>
        </Link>
        <Link to={`/driver/sendLocation/${busId}`}>Monitor Location</Link>
        <Link to={`/driver/setStatus/${busId}`}>Update Status</Link>
      </div>
      <div className={"h-[60px]"}></div>
      <div className="mt-5 w-full h-[calc(100%-60px)] z-50">
        {isLoading === true ? (
          <Shimmer></Shimmer>
        ) : (
          <div className="w-full h-full">
            <div className="pt-28 fixed left-0 top-0 h-full bg-[#A8151F] text-white w-[520px] flex flex-col pl-20">
              <h1 className={"text-[22px]"}>Driver Name</h1>
              <h1 className={"mt-[-10px] mb-[20px] font-bold text-[40px]"}>
                {name}
              </h1>
              <h1 className={"text-[22px]"}>Bus Number</h1>
              <h1 className={"mt-[-10px] mb-[20px] font-bold text-[40px]"}>
                {busNumber}
              </h1>
              <h1 className={"text-[22px]"}>Registration Number</h1>
              <h1 className={"mt-[-10px] mb-[20px] font-bold text-[40px]"}>
                {busNumberPlate}
              </h1>
              <h1 className={"text-[22px]"}>Contact Number</h1>
              <h1 className={"mt-[-10px] mb-[20px] font-bold text-[40px]"}>
                {contact}
              </h1>
              <h1 className={"text-[22px]"}>Your Route</h1>
              <h1 className={"mt-[-10px] mb-[20px] font-bold text-[40px]"}>
                {routeName}
              </h1>
              <div className="flex  items-center"></div>
            </div>
            <div className={"w-full flex flex-row h-full"}>
              <div className={"w-[520px] h-full"}></div>
              <div
                className={"flex flex-col w-[calc(100%-520px)] items-center"}
              >
                <div className="h-full w-full">
                  <LeafletMap busRoute={busRoute} busNumber={busNumber} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <ToastContainer transition={Zoom} /> */}
    </div>
  );
}

function LeafletMap({ busRoute, busNumber }) {
  console.log("inside leafleft ", busRoute);
  //For Static
  const [position, setPosition] = useState();
  //For Dynamic
  // const [position, setPosition] = useState([30.3275, 78.0325]);
  useEffect(() => {
    function success(position) {
      setPosition([position.coords.latitude, position.coords.longitude]);
    }
    function error() {
      alert("There is a error in getting location");
    }
    navigator.geolocation.getCurrentPosition(success, error);
  }, []);

  //TODO: for reflecting changes
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Simulate position change
  //     const deltaX = (Math.random() - 0.5) * 0.001;
  //     const deltaY = (Math.random() - 0.5) * 0.001;
  //     const newX = position[0] + deltaX;
  //     const newY = position[1] + deltaY;

  //     // POSITION UPDATE KIYA
  //     setPosition([newX, newY]);
  //   }, 2000);

  //   return () => clearInterval(interval);
  // }, [position]);

  if (busRoute)
    return (
      <MapContainer center={position} zoom={13} style={{ height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {busRoute && position && (
          <Routing
            busRoute={busRoute}
            position={position}
            busNumber={busNumber}
          />
        )}
      </MapContainer>
    );
  else {
    return (
      <div className="h-full w-full">
        <Shimmer>
          <p>Loading...</p>
        </Shimmer>
      </div>
    );
  }
}

L.Marker.prototype.options.icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
});

function Routing({ busRoute, position, busNumber }) {
  const map = useMap();
  console.log(position);

  useEffect(() => {
    socket.on("connection", () => {
      console.log("Connected to the server.");
      return () => {
        socket.off("connection");
      };
    });
  }, []);

  useEffect(() => {
    if (!map || !busRoute) return;

    const waypoints = busRoute.stations.map((el, i) =>
      L.latLng(el.position[0], el.position[1])
    );

    console.log("waypoints ", waypoints);

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      showAlternatives: true,
      altLineOptions: {
        styles: [
          {
            color: "black",
            opacity: 0.15,
            weight: 9,
          },
          {
            color: "red",
            opacity: 0.5,
            weight: 6,
          },
          {
            color: "green",
            opacity: 0.75,
            weight: 4,
          },
        ],
      },
    }).addTo(map);

    // Emit waypoints data to server
    socket.emit("bus", {
      waypoints: waypoints,
      busNumber,
    });
    console.log(waypoints);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, busRoute, position]);

  return null;
}

// waypoints: [L.latLng(57.74, 11.94), L.latLng(57.6792, 11.949)],
// waypoints: [
//   L.latLng(position[0], position[1]),
//   L.latLng(position[0], position[1]),
//   L.latLng(position[0], position[1]),
// ],

export default BusDashboard;
