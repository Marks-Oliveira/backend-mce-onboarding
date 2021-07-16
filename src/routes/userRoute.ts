import express from "express";
import { UserController } from "../controller/UserController";

export const userRoute = express.Router();

const userController = new UserController();

userRoute.post("/signup", userController.register);
userRoute.post("/login", userController.login);
userRoute.get("/all", userController.getAllUsers);
userRoute.post("/forgot-password", userController.forgotPassword);
userRoute.get("/getUser", userController.getUserById);
userRoute.put("/update/:id", userController.updateUserById);
userRoute.delete("/delete/:id", userController.deleteUserById);
userRoute.put("/register-newPassword/:token", userController.updatePassword);

export default userRoute;
