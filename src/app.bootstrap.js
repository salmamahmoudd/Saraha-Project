import express from "express";
import { SERVER_PORT} from "../config/config.service.js";
import connectDB from "./Modules/connection.js";
import { globalErrHandling } from "./Common/Response/response.js";
import userRouter from "./Modules/User/user.controller.js";
import authRouter from "./Modules/auth.controller.js";
import cors from "cors";
import path from "path";
import { testRedisConnection } from "./DB/Models/redis.connection.js";
import messageRouter from "./Modules/Message/message.conrtoller.js";
import helmet from "helmet";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import geolite from "geoip-lite";
import * as redisMethods from "./DB/Models/redis.connection.js";

async function bootstrap() {
  const app = express();
  const port = SERVER_PORT;

  await  connectDB();
  await testRedisConnection(); 
  
  app.set("trust proxy", true);

  app.use(express.json());
  app.use(cors({origin: "*"}), helmet(),rateLimit({
    windowMs: 1 * 60 * 1000, 
    limit: (req,res) => {
      const geoInfo = geolite.lookup(req.ip);
      return geoInfo.country == "EG" ? 3 : 1;
    },
    legacyHeaders: false,
    // message: "Too many requests, please try again later.",
    // statusCode: 400,
    handler: (req, res) => {
      return res.status(401).json({ msg : "Too many requests, please try again later." });
    },
    requestPropertyName: "reateLimit",
    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip)
      return `${ip}-${req.path}`;
    },
    store:{
       async incr (key, cb) {
        const hits = await redisMethods.incr(key);
        if (hits == 1) {
          await redisMethods.setExpire(key, 60);
    }
        cb(null, hits);
      },
      async decrement(key){
        const iskeyExist = await redisMethods.exists(key);
        if (iskeyExist) {
          await redisMethods.decr(key);
        }
      }
    },
    skipSuccessfulRequests: true,
  }),
  );

  app.use((req, res, next) => {
    console.log(req.headers["x-forwarded-for"]);
    console.log(req.ip);
    console.log({"req.rateLimit": req.rateLimit});
    next();
});
  app.use("/uploads", express.static(path.resolve("./uploads")))
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);

  app.use(globalErrHandling);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default bootstrap;