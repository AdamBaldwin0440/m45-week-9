const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../users/model");

const saltRounds = process.env.SALT_ROUNDS;

const hashPass = async (req, res, next) => {
  try {
    // const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
    // req.body.password = hashedPass;

    req.body.password = await bcrypt.hash(
      req.body.password,
      parseInt(saltRounds)
    );

    next();
  } catch (error) {
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};

const comparePass = async (req, res, next) => {
  try {
    console.log(req.body)
    // get user
    // const user = await User.findOne({ where: { username: req.body.username } });
    req.user = await User.findOne({ where: { username: req.body.username } });

    // compare passwords

    const match = await bcrypt.compare(req.body.password, req.user.password);

    // if no match - respond with 500 error message "passwords do not match"

    if (!match) {
      const error = new Error("Passwords do not match");
      res.status(500).json({ errorMessage: error.message, error: error });
    }

    // if match - next function

    next();
  } catch (error) {
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};

const tokenCheck = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    const decodedToken = await jwt.verify(token, process.env.SECRET);

    const user = await User.findOne({ where: { id: decodedToken.id } });

    if (!user) {
      const error = new Error("User is not authorised");
      res.status(401).json({ errorMessage: error.message, error: error });
    }

    req.authCheck = user;

    next();
  } catch (error) {
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};

module.exports = {
  hashPass,
  comparePass,
  tokenCheck,
};
