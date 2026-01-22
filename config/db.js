import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected");

    } catch (error) {
        console.error("DB connection error:", error.message);
        process.exit(1);


    }

}

export default dbConnect;