import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ENV_VARS } from "../config/envVars.js";
import { UnauthorizedError, NotFoundError } from "../utils/errors.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-cinepulse"];
    if (!token) {
      throw new UnauthorizedError("Unauthorized: No token provided");
    }
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    if (!decoded) {
      throw new UnauthorizedError("Unauthorized: Invalid token");
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw new NotFoundError("Unauthorized: User not found");
    }
    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware: ", error.message);
    next(error);
  }
};
