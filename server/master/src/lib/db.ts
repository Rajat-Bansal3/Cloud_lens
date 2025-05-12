import mongoose from "mongoose";
import env from "src/env";
import productionConfig from "src/lib/productionConfig";
import logger from "./logger";

export const connect = async () => {
  try {
    await mongoose.connect(
      env.MONGO_URI,
      env.NODE_ENV === "production" ? productionConfig.mongoOptions : {}
    );
    logger.info("connected to db");
  } catch (err) {
    logger.error(`cant connect to db , ${err}`);
  }
};
export const checkDatabaseConnection = async () => {
  try {
    return mongoose.connection.readyState;
  } catch (err) {
    return false;
  }
};
