import mongoose from "mongoose"
import config from "../common/config"

export const connectDB = async () => {
    try {
        await mongoose.connect(config.DB_URL);
        console.log("Database connected");
    } catch (error) {
        console.error(error);
    }
}
