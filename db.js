import mongoose from "mongoose"
export const connectDb=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL,{
            dbName:"auth",
        })
        console.log("mongoDb connected")
    } catch (error) {
        console.log(error.message)
    } 
}