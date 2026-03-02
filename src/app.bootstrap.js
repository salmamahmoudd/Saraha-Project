import express from "express";
import { SERVER_PORT} from "../config/config.service.js";
import connectDB from "./Modules/connection.js";
import { globalErrHandling } from "./Common/Response/response.js";
import userRouter from "./Modules/User/user.controller.js";
import authRouter from "./Modules/auth.controller.js";
import cors from "cors";
async function bootstrap() {
  const GenderEnum = {
    Male:"male",
    Female:"female",
}

Object.values(GenderEnum)
  const app = express();
  const port = SERVER_PORT;
  await  connectDB();

  app.use(express.json() , cors());

  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  app.use(globalErrHandling);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default bootstrap;