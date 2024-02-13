const express = require("express");
const dotenv = require("dotenv");
dotenv.config("./env");
const dbConnect = require("./dbConnect.js");
const authRouter = require("./routers/authRouter.js");
const userRouter = require("./routers/userRouter.js");
const morgan = require("morgan");
const postRouter = require("./routers/postRouter.js");
const cookieParser = require("cookie-parser");

const cloudinary = require("cloudinary").v2;
const cors = require("cors");

//configuration
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

//middleware
app.use(express.json({ limit: "10mb" }));
app.use(morgan("common"));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.status(200).send("OK from server");
});

const PORT = process.env.PORT || 4001;

dbConnect();

app.listen(PORT, () => {
  console.log(`listening to port: ${PORT}`);
});
