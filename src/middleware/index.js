const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../users/model");

const saltRounds = process.env.SALT_ROUNDS;

const hashPass = async (req, res, next) => {
  try {
      // if (!req.body.password) {
      //   const error = new Error("No password");
      //   res.status(500).json({errorMessage: error.message, error: error})
      // }
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
    // if (!req.body.password){
    //   const error = new Error("No password given");
    //   res.status(500).json({errorMessage: error.message, error: error});
    // }

    // if(!req.body.username){
    //   const error = new Error("No username");
    //   res.status(500).json({errorMessage: error.message, error: error})
    // }
    req.user = await User.findOne({ where: { username: req.body.username } });
    console.log(re.user);
    const match = await bcrypt.compare(req.body.password, req.user.password);

    if (!match) {
      const error = new Error("Passwords do not match");
      res.status(500).json({ errorMessage: error.message, error: error });
    }
    next();
  } catch (error) {
    res.status(501).json({ errorMessage: error.message, error: error });
  }
};

const tokenCheck = async (req, res, next) => {
  try {
    if(!req.header("Authorization")) {
      throw new Error("No Token error")
    }
    const token = req.header("Authorization").replace("Bearer", "");

    const decodedToken = await jwt.verify(token, process.env.SECRET);

    const user = await User.findOne({ where: { id: decodedToken.id } });

    if (!user) {
      throw new Error("User is not authorised");
      // res.status(401).json({ errorMessage: error.message, error: error });
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
