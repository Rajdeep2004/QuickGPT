// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   let token = req.headers.authorization;

//   // Handle "Bearer <token>" format
//   if (token && token.startsWith("Bearer ")) {
//     token = token.slice(7);
//   }

//   if (!token) {
//     return res.status(401).json({ success: false, message: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.json({
//         success: false,
//         message: "Not authorized, User not found",
//       });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     res
//       .status(401)
//       .json({ success: false, message: "Not authorized, token failed" });
//   }
// };

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Check header exists and starts with Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next(); // ✅ THIS MUST BE A FUNCTION
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};
