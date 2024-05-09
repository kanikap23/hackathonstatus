import express from "express"
const router=express.Router()
import { upload } from "../middlewares/multer.middleware.js"

import { updateDriver,registerAdmin,loginAdmin } from "../controllers/adminController.js"


router.route('/registerAdmin').post(registerAdmin)

router.route('/loginAdmin').post(loginAdmin)

router.route('/updateDriver').post(upload.fields([
    {
        name:"photo"
    }
]),updateDriver)

export default router