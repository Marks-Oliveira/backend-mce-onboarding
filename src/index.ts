import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { userRoute } from "./routes/userRoute";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/user", userRoute);

export default app;
