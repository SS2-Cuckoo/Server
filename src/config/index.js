import env from "dotenv";
const envFound = env.config();

if (envFound.error) {
    // This error should crash whole process
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
    // About Service
    SERVICE_IP: process.env.SERVICE_IP, // Default : localhost
    SERVICE_PORT: Number(process.env.SERVICE_PORT), // Default : 8081

    // About DB
    DB_ID: process.env.DATABASE_ID,
    DB_PW: process.env.DATABASE_PW,
    DB_NAME: process.env.DATABASE_NAME,
    DB_HOST: process.env.DATABASE_HOST,
    DB_PORT: process.env.DATABASE_PORT,
};
