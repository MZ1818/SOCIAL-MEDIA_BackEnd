const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
const { error, succes } = require("../utils/responseWrapper");
dotenv.config("./env");

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      // return res.status(400).send("All fiels are required");
      return res.send(error(400, "All fiels are required"));
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.send(error(409, "User is already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // return res.status(201).json({
    //   user,
    // });
    return res.send(succes(201, "user created succesfully"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send(error(400, "All fiels are required"));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.send(error(404, "User is not registered"));
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.send(error(403, "Incorrect Password"));
    }

    const accessToken = generateAccessToken({
      _id: user._id,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id,
    });

    // ccokies are required to send data by backend to frontend & here refreshToken has been send
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    // return res.json({ accessToken });
    return res.send(succes(200, { accessToken }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

// api that will create new access token from refresh token after checking validity of refresh token
const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.send(error(401, "Refresh Token is required"));
  }
  const refreshToken = cookies.jwt;

  //------

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const _id = decoded._id;
    const accessToken = generateAccessToken({ _id });

    // return res.status(201).json({ accessToken });
    return res.send(succes(201, { accessToken }));
  } catch (e) {
    console.log(e);
    return res.send(error(401, "Invalid refresh token"));
  }
};

//internal functions ---generating acces token
const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "5min",
    });
    console.log(token);
    return token;
  } catch (e) {
    console.log(e);
  }
};

//internal functions ---generating refresh token
const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "1y",
    });
    console.log(token);
    return token;
  } catch (e) {
    console.log(e);
  }
};

//logout controller-- we will remove the refresh token only from backend (access token will b removed by frontEnd)
const logoutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(succes(200, "user logged out"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  logoutController,
};
