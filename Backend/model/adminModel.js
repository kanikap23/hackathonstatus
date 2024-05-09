import mongoose from "mongoose"
import bcrypt from "bcrypt"

const adminSchema=new mongoose.Schema({
    userName:{
        type:String,
        lowercase:true,
        required:true
    },
    contactNumber:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        unique:true,
        required:true
    }
},{timestamps:true})

adminSchema.pre("save",async function(next)
{
    if(!this.isModified('password'))
        return next()
    this.password=await bcrypt.hash(this.password,8);
})

adminSchema.methods.checkPassword=async function(gotPassword)
{
    return await bcrypt.compare(gotPassword,this.password)
}

export const ADMIN=mongoose.model("Admin",adminSchema)