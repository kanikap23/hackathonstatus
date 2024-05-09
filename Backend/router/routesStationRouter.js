import express from "express"
import { getRoutes , insertRoute} from "../controllers/routes.controller.js"
const router=express.Router()


router.route("/getRoute").get(getRoutes)
router.route("/insertRoute").post(insertRoute)

export default router