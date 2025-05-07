import dotenv from "dotenv";

dotenv.config();

const mongoKey = process.env.MONGO_URI;

export default mongoKey;