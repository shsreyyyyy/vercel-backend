import mongoose from "mongoose"

const adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "admin",
    },
    isVerified:{
    type:Boolean,
    default:false
}

},{timestamps:true})

export const Admin=mongoose.model("Admin",adminSchema)