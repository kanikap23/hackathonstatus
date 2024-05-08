import mongoose from "mongoose"
import { STATION } from "../model/stationModel.js"

export const getStationDetails=async function(req,res)
{
    try {
        const allStations=await STATION.find({});

        return res.status(200).json({
            success:true,
            message:"got all stations",
            data:allStations
        })

    } catch (error) {
        console.log(error.message)
    }
}

export const addStations=async function(req,res)
{
    try {
        const {stationName,latitude,longitude}=req.body

        if(stationName === "" && latitude === ""  && longitude === "")
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        let positions=[]
        positions.push(latitude)
        positions.push(longitude)

        const newStation=await STATION.create({
            stationName,
            position:positions
        })

        return res.status(200).json({
            success:true,
            message:"station successfully created",
            data:newStation
        })

    } catch (error) {
        console.log(error.message)
    }
}
