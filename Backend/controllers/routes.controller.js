import mongoose from "mongoose"
import {ROUTE} from "../model/routeModel.js"
import { STATION } from "../model/stationModel.js"
export const getRoutes=async function(req,res)
{   
    try {
        const routeDetails=await ROUTE.aggregate([
            {
              $unwind:"$stations"
            },
            {
              $lookup: {
                from: "stations",
                localField: "stations",
                foreignField: "_id",
                as: "data",
                pipeline:[
                  {
                  $project:{
                      stationName:1,
                    position:1
                  }
                  }
                ]
              }
            },
            {
              $addFields: {
                points:{
                  $arrayElemAt:["$data",0]
                }
              }
            },
            {
              $project: {
                routeName:1,
                points:1,
                stations:1      
              }
            },
            {
              $group: {
                _id: "$routeName",
                routes: {
                  $push: "$points"
                }
              }
            }
          ])
    
          return res.status(200).json({
            success:true,
            message:"Routes details fetched",
            data:routeDetails
          })
    } catch (error) {
        console.log(error.message)
    }
}

export const insertRoute=async function(req,res)
{
    try {
      console.log(req.body)
      const {routeName,station1,station2,station3}=req.body
  
      if([routeName,station1,station2,station3].some((ele)=>ele === ""))
        {
          return res.status(400).json({
            success:false,
            message:"Fill out all details",
          })
        }
      let stations=[]
      const s1=await STATION.findOne({stationName:station1.toLowerCase()})
      const s2=await STATION.findOne({stationName:station2.toLowerCase()})
      const s3=await STATION.findOne({stationName:station3.toLowerCase()})
      stations.push(s1._id)
      stations.push(s2._id)
      stations.push(s3._id)

      const newStation=await ROUTE.create({
          routeName,
          stations
      })

      return res.status(200).json({
          success:true,
          message:"current stations are",
          data:newStation
      })
    } catch (error) {
      console.log(error.message)
    }
}
