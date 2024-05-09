import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const routeSchema=new mongoose.Schema({
    routeName:{
        type:String,
        unique:[true,"Route Name Already Registered Try Other Number"]
    },
    stations: [{
            ref: "Station",
            type:mongoose.Schema.Types.ObjectId
        }],
},)

routeSchema.plugin(mongooseAggregatePaginate)


export const ROUTE=mongoose.model("Route",routeSchema)