// import jwt from "jsonwebtoken";
// import { User } from "../models/user.model.js";
// import { ENV_VARS } from "../config/envVars.js";

// export const protectRoute = async (req, res, next) => {
//   try {
//     const token = req.cookies["jwt-cinepulse"];
//     if (!token) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Unauthorized: No token provided" });
//     }
//     const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
//     if (!decoded) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Unauthorized: Invalid token" });
//     }
//   } catch (error) {}
// };
