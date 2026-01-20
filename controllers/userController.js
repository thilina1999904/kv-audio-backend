import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
// import axios from "axios";



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
      } else {
        if (user.isBlocked) {
          res.status(403).json({ error: "Your Acount Is Blocked" })
          return;
        }
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


export async function getAllUsers(req, res) {
  if (isItAdmin(req)) {
    try {
      const users = await User.find();
      res.json(users)
    } catch (e) {
      res.status(500).json({ error: "failed to get user" })
    }
  } else {
    res.status(403).json({ error: "Unauthorized Access" })
  }
}

export async function blockedOrUnblockedUser(req, res) {
  const email = req.params.email;

  if (isItAdmin(req)) {
    try {
      const user = await User.findOne(
        {
          email: email
        }
      )
      if (user == null) {
        res.status(404).json({ error: "User Not Found" })
        return;
      }

      const isBlocked = !user.isBlocked;

      await User.updateOne(
        {
          email: email
        },
        {
          isBlocked: isBlocked
        }
      );
      res.status(200).json({ message: "User Blocked/Unblocked Successfully" })

    } catch (e) {
      res.status(500).json({ error: "Failed to get User" })
    }
  } else {
    res.status(403).json({ error: "Unauthorized User" })
  }
}

export function getUser(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not authenticated",
      });
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
}
export async function loginWithGoogle(req, res) {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: "Access token required" });
        }

        /* -------- Get Google User Info (CORRECT) -------- */
        const googleRes = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const { email, name, picture } = googleRes.data;

        if (!email) {
            return res.status(400).json({ error: "Google account has no email" });
        }

        /* -------- Find or Create User -------- */
        let user = await User.findOne({ email });

        if (!user) {
            const [firstName, ...rest] = name.split(" ");
            const lastName = rest.join(" ");

            user = await User.create({
                firstName,
                lastName,
                email,
                profilePicture: picture,
                role: "customer",   // MATCH YOUR SYSTEM
                provider: "google",
                isBlocked: false,
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({ error: "Your account is blocked" });
        }

        /* -------- Create JWT -------- */
        const token = jwt.sign(
            {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        /* -------- SEND RESPONSE (IMPORTANT) -------- */
        res.status(200).json({
            message: "Google Login Successful",
            token,
            user,
        });

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Google login failed" });
    }
}
