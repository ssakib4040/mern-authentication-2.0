const User = require("../models/User");

const {
  validateUsername,
  validateEmail,
  validatePassword,
} = require("../utils/validator");

const { matchPassword, hashPassword } = require("../utils/passwordHash");
const { getSignedJwtToken } = require("../utils/jwtToken");
const { randomHash } = require("../utils/randomHash");

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  // Check empty fields
  if (!username || !email || !password) {
    return res.status(400).send({
      success: false,
      message: "Please fill all the fields",
    });
  }

  // validate Username
  if (!validateUsername(username))
    return res
      .status(400)
      .send({ success: false, message: "Invalid Username" });

  // validate Email
  if (!validateEmail(email))
    return res.status(400).send({ success: false, message: "Invalid Email" });

  // validate Password
  if (!validatePassword(password))
    return res
      .status(400)
      .send({ success: false, message: "Invalid Password" });

  // check email exists
  const userExists = await User.findOne({ email }).exec();
  if (userExists) {
    return res.status(400).send({
      success: false,
      message: "User already exists",
    });
  }

  try {
    const user = await User.create({
      username,
      email,
      password,
    });

    user.password = await hashPassword(user.password);
    user.save();

    const token = getSignedJwtToken(user._id);

    return res.status(201).json({
      success: true,
      token: token,
    });
  } catch (error) {
    return res.send({
      success: true,
      message: error,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check empty fields
  if (!email || !password) {
    return res.status(400).send({
      success: false,
      message: "Please fill all the fields",
    });
  }

  const userExists = await User.findOne({ email }).exec();
  if (!userExists) {
    return res.status(400).send({
      success: false,
      message: "User not found",
    });
  }

  // check password match
  const isPasswordMatched = await matchPassword(password, userExists.password);
  if (!isPasswordMatched) {
    return res.status(400).json({
      success: "false",
      message: "Password not matched",
    });
  }

  try {
    const token = getSignedJwtToken(userExists._id);

    return res.status(201).json({
      success: true,
      token: token,
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};
