import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();

export function registerUser(req, res) {

  const data = req.body;

  data.password = bcrypt.hashSync(data.password, 10)

  const newUser = new User(data)



  newUser.save().then(() => {
    res.json({
      message: "User Registered Successfully!"
    })
  }).catch((error) => {
    res.status(500).json({ error: "User Registration Failed" })
  })

}

export function loginUser(req, res) {
  const data = req.body; // You stored the request body here

  User.findOne({ email: data.email })
    .then((user) => {
      if (user == null) {
        return res.status(404).json({ error: "User Not Found" });
      }

      const isPasswordCorrect = bcrypt.compareSync(data.password, user.password);


      if (isPasswordCorrect) {
        const token = jwt.sign({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          phone: user.phone,
        }, process.env.JWT_SECRET);

        res.json({
          message: "Login Successful",
          token: token,
          user: user,
        });
      } else {
        res.status(401).json({ error: "Invalid Password" });
      }
    })
    .catch((err) => {
      // Adding this catch prevents the server from crashing on errors
      console.error("Login error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

export function isItAdmin(req) {
  let isAdmin = false;

  if (req.user != null) {
    if (req.user.role == "admin") {
      isAdmin = true;
    }

  }
  return isAdmin;
}

export function isItCustomer(req) {
  let isCustomer = false;

  if (req.user != null) {
    if (req.user.role == "customer") {
      isCustomer = true;
    }
  }
  return isCustomer;
}
