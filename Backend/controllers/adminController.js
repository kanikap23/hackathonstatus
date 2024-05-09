import mongoose from "mongoose"
import { uploadOnCloudinary } from "../cloudStorage.js"
import { upload } from "../middlewares/multer.middleware.js"
import { BUS } from "../model/busModel.js"
import { ADMIN } from "../model/adminModel.js"

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

export const registerAdmin=async function(req,res)
{
    //getting details from frontend
    try {
        const {userName,contactNumber,password}=req.body
        console.log(req.body)
        if([userName,contactNumber,password].some((ele)=>ele === ""))
        {
            return res.status(400).json({
                success:false,
                message:"All fields are necessary"
            })
        }
        
        const findAdmin=await ADMIN.findOne({$or:[{userName},{contactNumber},{password}]})
        console.log(findAdmin)
        if(findAdmin)
            {
                console.log("yaha aai")
                return res.status(200).json({
                success:false,
                message:"admin already exists"
            })
            console.log("error")
        }
        const newAdmin=await ADMIN.create({
            userName,
            contactNumber,
            password
        })
    
        if(!newAdmin)
            return res.status(400).json({
            success:false,
            message:"error in creating new admin"})
        
        return res.status(200).json({
            success:true,
            message:"admin successfully created",
            data:newAdmin
        })
    } catch (error) {
        console.log(error.message)   
    }
}

export const loginAdmin=async function(req,res)
{
    try {
        const {contactNumber,password}=req.body

        if([contactNumber,password].some((ele)=>ele === ""))
            {
                return res.status(400).json({
                    success:false,
                    message:"All fields are necessary"
                })
            }
        
        const gotDriver=await ADMIN.findOne({contactNumber})
        
        console.log(gotDriver)

        if(gotDriver === null)
            return res.status(200).json({
                success:false,
                message:"cannot find driver register first"
            })
        
        const checkingPassword=await gotDriver.checkPassword(password)

        if(!checkingPassword)
            return res.status(400).json({
                success:false,
                message:"password not correct"
            })
        
        return res.status(200).json({
                success:true,
                message:"correct password",
                data:gotDriver
        })
    } catch (error) {
        console.log(error.message)
    }
}
