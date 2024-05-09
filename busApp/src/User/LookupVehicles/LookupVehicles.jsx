import { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { axiosConfig, SERVER_URL } from "../../Constants/config.js";
import "./LookupVechicles.css";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import person from "../../assets/person.png";
import { Icon } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

const personIcon = new Icon({
  iconUrl: person,
  iconSize: [40, 40],
});

import io from "socket.io-client";
const socket = io("http://localhost:10000");

function LoadMap() {
  const [position, setPosition] = useState();
  useEffect(() => {
    function success(position) {
      setPosition([position.coords.latitude, position.coords.longitude]);
    }
    function error() {
      alert("There is a error in getting location");
    }
    navigator.geolocation.getCurrentPosition(success, error);
  }, [position]);
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {position && (
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={personIcon}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
}

function Card({ busNumber, route, active, objectId, eta, rating, click }) {
  const setRoute = useContext(RouteContext).setRoute;
  return (
    <div
      onClick={() => {
        click(busNumber);
        setRoute(route);
      }}
      className="ml-2 rounded-2xl bg-[#E93F4B] w-[400px] h-[190px] text-white p-4"
    >
      <h1 className={"font-bold text-2xl"}>
        ETA:{" "}
        {eta
          ? eta.progress
            ? eta.progress[eta.progress.length - 1].eta
            : "N/A"
          : "N/A"}
      </h1>
      <div className={""}>
        <div className={"flex flex-row gap-[5px] items-center"}>
          <div className="w-3 h-3 bg-[#38B3F9] rounded-full "></div>
          <p className={"p-0 m-0"}>
            {route.stations[route.stations.length - 1].stationName}
          </p>
        </div>
        <div className=" mt-[-5px] mb-[-5px] left-[5px] border-l-2 border-black h-[35px] max-w-fit"></div>
        <div className={"flex flex-row gap-[5px] items-center"}>
          <div className="w-3 h-3 bg-[#38B3F9] rounded-full "></div>
          <p className={"p-0 m-0"}>{route.stations[0].stationName}</p>
        </div>
      </div>
      <div className={"relative top-[-35px]"}>
        <h1 className={"font-bold ml-[75%]"}>Bus: {busNumber}</h1>
        <div className={"ml-[75%]"}>
          <p className={"text-yellow-300 text-xl"}>
            {Array(Number(Math.round(rating)))
              .fill("*")
              .map((e, i) => (
                <span key={i}>*</span>
              ))}
            {Array(Number(5 - Math.round(rating)))
              .fill("*")
              .map((e, i) => (
                <span key={i} className={"text-white"}>
                  *
                </span>
              ))}
            <span className={"text-white text-[13px]"}></span>
          </p>
        </div>
        <Link to={`/user/trackVehicle/${objectId}`}>
          <button
            className={
              "w-[98%] border-[1px] drop-shadow-md border-black bg-[#38B3F9] h-[35px] text-black rounded-2xl"
            }
          >
            View Bus &#x2192;
          </button>
        </Link>
      </div>
    </div>
  );
}

const RouteContext = createContext();

export function LookupVehicles() {
  const [dataReceived, setDataReceived] = useState([]);
  const [preserveData, setPreserveData] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [busRoutes, setBusRoutes] = useState([]);
  const [route, setRoute] = useState();
  const [busNumberSelected, setBusNumberSelected] = useState(0);
  //waypoints
  const [waypoints, setWaypoints] = useState();

  function searchLocation() {
    if (!busRoutes) return;
    let filteredRoutes = busRoutes.filter((route) => {
      return route.stations.some((station) => {
        return station.stationName === search;
      });
    });

    let filteredResult = dataReceived.filter((ele) =>
      filteredRoutes.some((route) => {
        return route._id === ele.route._id;
      })
    );
    setDataReceived(filteredResult);
  }

  function getActiveBusDetails() {
    axios
      .get(`${SERVER_URL}/api/v1/activeBus`, axiosConfig)
      .then((response) => {
        console.log("response.data.buses", response.data.buses);
        setDataReceived(response.data.buses);
        setPreserveData(response.data.buses);
        setLoading(false);
      });
  }

  useEffect(() => {
    (async () => {
      const routes = await axios.get(
        `${SERVER_URL}/api/v1/busRoutes`,
        axiosConfig
      );
      setBusRoutes(routes.data.routes);
    })();
    getActiveBusDetails();
  }, []);

  useEffect(() => {
    //TODO: for changes in bus coordinate fake
    // socket.on(`bus-${busNumberSelected}`, (data) => {
    //   console.log("data", data, "busNumberSelected", busNumberSelected);
    //   setWaypoints(data);
    // });
    // return () => {
    //   socket.off(`bus-${busNumberSelected}`);
    // };
    let selectRoute = [],
      waypoints = [];
    if (busNumberSelected) {
      selectRoute = dataReceived.filter(
        (el) => el.busNumber == busNumberSelected
      )[0].route.stations;
      console.log("selectRoute", selectRoute || true);
      if (selectRoute.length > 0) {
        waypoints = selectRoute.map((el, i) =>
          L.latLng(el.position[0], el.position[1])
        );
        setWaypoints(waypoints);
      }
    }

    // console.log("selectRoute", selectRoute.route);
  }, [busNumberSelected, dataReceived]);

  function click(busNumber) {
    console.log("jadasdsad", busNumber);
    setBusNumberSelected(busNumber);
  }

  return (
    <>
      <RouteContext.Provider value={{ route, setRoute }}>
        <div className="z-50 w-full top-0 left-0 bg-[#E80202] h-[60px] flex items-center justify-center space-x-80 text-white text-3xl">
          <h1 className={"font-bold"}>Active Buses</h1>
        </div>
        <div className={"flex flex-row justify-start"}>
          <div className="">
            <div>
              <div className={"mt-5 ml-2"}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setDataReceived(preserveData);
                    }
                    setSearch(e.target.value);
                  }}
                  className="bg-[#D9D9D9] w-[317px] px-4 py-2 text-1xl font-semibold rounded-tl-lg rounded-bl-lg outline-none"
                />
                <button
                  className="px-4 py-2 text-1xl bg-[#E93F4B] text-white rounded-tr-lg rounded-br-lg"
                  onClick={searchLocation}
                >
                  Search
                </button>
              </div>
            </div>
            <div className="w-[440px] space-y-8 mt-10 overflow-y-scroll h-[480px]">
              {isLoading ? (
                <h1 className="text-white"> Loading... </h1>
              ) : (
                dataReceived.map((ele) => (
                  <Card
                    busNumber={ele.busNumber}
                    rating={ele.avgRating}
                    route={ele.route}
                    active={ele.busStatus}
                    eta={ele.progress}
                    key={ele._id}
                    objectId={ele._id}
                    click={click}
                  />
                ))
              )}
            </div>
          </div>
          {/* {console.log("go", waypoints)} */}
          {waypoints ? <LeafletMap waypoints={waypoints} /> : <LoadMap />}
          {/* <LeafletMap waypoints={waypoints} /> */}
        </div>
      </RouteContext.Provider>
    </>
  );
}

function LeafletMap({ waypoints }) {
  console.log("ekfjwe", waypoints);
  // if (waypoints) {
  return (
    <MapContainer
      center={[30.2681398, 78.0010132]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {waypoints && <Routing waypoints={waypoints} />}
    </MapContainer>
  );
  // } else {
  //   return (
  //     <div className="h-full w-full">
  //       <p style={{ fontSize: "40px" }}>Loading...</p>
  //     </div>
  //   );
  // }
}

L.Marker.prototype.options.icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
});

function Routing({ waypoints }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !waypoints) return;
    console.log(waypoints);
    const s = waypoints.map((el) => L.latLng(el));
    console.log("s", s);
    // const S = [
    //   L.latLng(30.2681398, 78.0010132),
    //   L.latLng(30.288713, 77.996631),
    //   L.latLng(30.268616, 77.994732),
    // ];

    const routingControl = L.Routing.control({
      waypoints: s,
      showAlternatives: true,
      lineOptions: {
        styles: [{ opacity: 0.8, weight: 6 }],
      },
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, waypoints]);

  return null;
}
