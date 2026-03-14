import express from "express";
import { SERVER_PORT} from "../config/config.service.js";
import connectDB from "./Modules/connection.js";
import { globalErrHandling } from "./Common/Response/response.js";
import userRouter from "./Modules/User/user.controller.js";
import authRouter from "./Modules/auth.controller.js";
import cors from "cors";
import path from "path";
async function bootstrap() {
  const app = express();
  const port = SERVER_PORT;
  await  connectDB();

  app.use(express.json() , cors());

  app.use("/uploads", express.static(path.resolve("./uploads")))

  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  app.use(globalErrHandling);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default bootstrap;