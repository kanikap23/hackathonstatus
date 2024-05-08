import mongoose from "mongoose"
import { uploadOnCloudinary } from "../cloudStorage.js"
import { upload } from "../middlewares/multer.middleware.js"
import { BUS } from "../model/busModel.js"

export const updateDriver=async function(req,res)
{
    //getting data from req body
    const {busNumber,newDriverName,newContactInfo}=req.body

    if([busNumber,newDriverName,newContactInfo].some((ele)=>ele === ""))
        return res.status(400).json({
        success:true,
        message:"all fields are necessary"})

    //console.log(req.files.photo)
    if(req.files.photo === undefined)
        return res.status(400).json({
        success:false,
        message:"Please Insert Image"})
    
    
    const fileUrl=req.files.photo[0].path
        
    console.log(fileUrl)

    const imageUrl=await uploadOnCloudinary(fileUrl)

    console.log(imageUrl)

    const findDriver=await BUS.findOne({busNumber})

    findDriver.driver.name=newDriverName
    findDriver.driver.contactInfo=newContactInfo
    findDriver.photo.secure_url=imageUrl.secure_url
    findDriver.photo.photo_id=imageUrl.public_id

    const ans=await findDriver.save({validateBeforeSave:false},{new:true})

    console.log(ans)

    return res.status(200).json({
            success:true,
            message:"driver updated",
            data:ans
    })
}
