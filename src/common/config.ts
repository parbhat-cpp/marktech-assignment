import { resolve } from "path";
import dotenv from "dotenv";

const ENV_FILE_PATH = resolve(".env");

const isEnvFound = dotenv.config({ path: ENV_FILE_PATH });

// check if .env file exists
if (isEnvFound.error) {
    throw new Error("Cannot find .env file");
}

// setting default value if not provided
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.SERVER_PORT = process.env.SERVER_PORT || "5000";
process.env.SOCKET_PORT = process.env.SOCKET_PORT || "8080";

export default {
    NODE_ENV: process.env.NODE_ENV as string,

    SERVER_PORT: parseInt(process.env.SERVER_PORT, 10),
    SOCKET_PORT: parseInt(process.env.SOCKET_PORT, 10),

    JWT_SECRET: process.env.JWT_SECRET as string,

    SOCKET_URL: process.env.SOCKET_URL as string,
    EXPRESS_URL: process.env.EXPRESS_URL as string,
    DB_URL: process.env.DB_URL as string,
};
