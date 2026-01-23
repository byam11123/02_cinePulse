import { ValidationError, InternalServerError } from "../utils/errors.js";
import AuthService from "../services/AuthService.js";
import UserService from "../services/UserService.js";

export async function signup(req, res, next) {
  try {
    const userData = req.body;
    const newUser = await AuthService.register(userData);

    // Generate token and set cookie
    const token = generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({
      success: true,
      user: {
        ...newUser.toObject(),
        password: "", // Don't send password in response
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const credentials = req.body;
    const loginResult = await AuthService.login(credentials, res);

    res.status(200).json({
      success: true,
      user: loginResult,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const result = await AuthService.logout(res);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function authCheck(req, res, next) {
  try {
    const user = await AuthService.getAuthUser(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
}
