import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { cache } from "./Cache/cache.js";
import { createServer } from "http";

//For Call
import twilio from "twilio";
//TODO: Jab chahiye tab Kholo isse nahi toh paise katenge
const YOUR_AUTH_TOKEN = "cd562ae5e39c7fab1e3d4ef383b71fc6";
const YOUR_ACCOUNT_SID = "AC352763183ccb144550245e2828a6cc87";
const client = twilio(YOUR_ACCOUNT_SID, YOUR_AUTH_TOKEN);
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(cookieParser());

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.use((req, res, next) => {
  console.log(req.method, req.ip);
  next();
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: "*",
});

io.on("connection", (socket) => {
  socket.on("busId", (payload) => {
    console.log(payload);

    cache.set(payload.id, payload);
    console.log(cache);
    console.log(`busLocation-${payload.id}`);
    io.emit(`busLocation-${payload.id}`, payload);
  });

  socket.on("panicAlarm", (payload) => {
    client.calls
      .create({
        url: "http://demo.twilio.com/docs/voice.xml",
        to: "+918126052440",
        from: "+12532149315",
      })
      .then((call) => console.log(call.sid));
    socket.broadcast.emit("sendAlarm", payload);
  });

  socket.on("count", (payload) => {
    io.emit("sendCountPassenger", { countPassenger: payload.countPassenger });
  });

  socket.on("emergencyLocation", (payload) => {
    console.log(payload);
    socket.broadcast.emit(`${payload.routeTravelling}`, { result: "true" });
  });
});

//setting up routes
import busRouter from "./router/busRoute.js";
app.use("/api/v1", busRouter);

//setting stations
import stationRouter from "./router/routesRouter.js";
app.use("/api/v1/station", stationRouter);

//setting proper routes
import routesStation from "./router/routesStationRouter.js";
app.use("/api/v1/routesStation", routesStation);

import adminRouter from "./router/adminRoutes.js";
app.use("/api/v1/admin", adminRouter);

export default httpServer;
