import mongoose from "mongoose";

export async function connectDB()
{
    try
    {
        await mongoose.connect(process.env.MONGO_URL!);
        console.log("MogoDb connected!!");
    }catch(error)
    {
        console.log("MongoDb connection error", error);
        process.exit(1);
    }
}