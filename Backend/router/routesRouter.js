import express from "express"

import { getStationDetails , addStations} from "../controllers/stationsController.js"
const router=express.Router()


router.route("/getStations").get(getStationDetails)
router.route("/addStations").post(addStations)

export default router
