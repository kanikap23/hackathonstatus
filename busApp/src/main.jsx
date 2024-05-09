import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createHashRouter, RouterProvider } from "react-router-dom";

import { LookupVehicles } from "./User/LookupVehicles/LookupVehicles.jsx";
import { TrackVechicle } from "./User/TrackVechicle/TrackVechicle.jsx";
import SendLocation from "./Driver/SendLocation/SendLocation.jsx";
import TypeOfUser from "./TypeOfUser.jsx";
import LoginDriver from "./Driver/LoginDriver/LoginDriver.jsx";
import RegisterDriver from "./Driver/RegisterDriver/RegisterDriver.jsx";
import BusDashboard from "./Driver/BusDashboard/BusDashboard.jsx";
import BusStatus from "./Driver/BusStatus/BusStatus.jsx";
import Feedback from "./Feedback/Feedback.jsx";
const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <TypeOfUser />,
      },
      {
        path: "/driver/registerDriver",
        element: <RegisterDriver />,
      },
      {
        path: "/driver/login",
        element: <LoginDriver />,
      },
      {
        path: "/driver/dashboard",
        element: <BusDashboard />,
      },
      {
        path: "/driver/setStatus/:id",
        element: <BusStatus />,
      },
      {
        path: "/driver/sendLocation/:id",
        element: <SendLocation />,
        // element: <p>Route Under Development :)</p>,
      },
      {
        path: "/user/lookupVehicle",
        element: <LookupVehicles />,
      },
      {
        path: "/user/trackVehicle/:id",
        element: <TrackVechicle />,
        // element: <p>Route Under Development :)</p>,
      },
      {
        path: "/user/feedback/:id",
        element: <Feedback />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </React.StrictMode>
);
