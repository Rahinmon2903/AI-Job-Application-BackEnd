const mongoose = require("mongoose");
const dotenv = require("dotenv");

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

module.exports = dbConnect;