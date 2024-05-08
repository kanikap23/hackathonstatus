import mongoose from "mongoose"

const stationSchema=new mongoose.Schema({
    stationName:{
        type:String,
        unique:[true,"Station Name Already Registered Try Other Number"],
        lowercase:true
    },
    position:{
        type:[Number],
    },
},)

export const STATION=mongoose.model("Station",stationSchema)
