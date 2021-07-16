import { Request, Response } from "express";
import { UserInputDTO, LoginInputDTO, UserEditDTO} from "../model/User";
import { UserBusiness } from "../business/UserBusiness";
import { UserDatabase } from "../data/UserDatabase";
import { IdGenerator } from "../services/idGenerator";
import { HashManager } from "../services/hashManager";
import { Authenticator } from "../services/authenticator";
import nodemailer from "nodemailer";

export class UserController {
    private static UserBusiness = new UserBusiness (
        new UserDatabase(),
        new IdGenerator(),
        new HashManager(),
        new Authenticator(),
    )

    public async register(req: Request, res: Response) {
        try {

            const input: UserInputDTO = {
                email: req.body.email,
                name: req.body.name,
                cpf: req.body.cpf,
                password: req.body.password
            };

            const accessToken = await UserController.UserBusiness.registerUser(input);

            res.status(201).send({ accessToken });

        } catch (error) {
            res.status(error.code || 400).send({ error: error.message });
        }
    };

    public async login(req: Request, res: Response) {

        try {

            const loginData: LoginInputDTO = {
                emailOrCpf: req.body.emailOrCpf,
                password: req.body.password
            };

            const accessToken = await UserController.UserBusiness.getUserByEmailOrCpf(loginData);

            res.status(200).send({ accessToken });

        } catch (error) {
            res.status(error.code || 400).send({ error: error.message });
        }
    };

    public async getAllUsers(req: Request, res: Response) {
        try {
            const token = req.headers.authorization as string;

            const result = await UserController.UserBusiness.getAllUser(token);

            res.status(200).send({ users: result })
        } catch (error) {
            res.status(error.code || 400).send({ error: error.message });
        }
    };

    public async getUserById(req: Request, res: Response) {
        try {
            const token = req.headers.authorization as string;

            const result = await UserController.UserBusiness.getUserById(token);

            res.status(200).send({ user: result })
        } catch (error) {
            res.status(error.code || 400).send({ error: error.message });
        }
    };

    public async forgotPassword(req: Request, res: Response) {
        try {
            const email = req.body.email;

            const result = await UserController.UserBusiness.getUserByEmail(email);

            const transport = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                auth: {
                  user: "1d024e1e04ac30",
                  pass: "925dc67c2f025f"
                }
            });

            transport.sendMail({
                from: 'Administrador <b4717f6675-cf1c3d@inbox.mailtrap.io>',
                to: result.user.getEmail(),
                subject: 'Recuperação de senha',
                html: `<p>Clique no link abaixo para cadastrar uma nova senha.</p>
                       <br/>
                       <a href="http://localhost:3000/register-newPassword/${result.token}">Link</a>
                      `
            }).then (() => {
                res.status(200).send({ message: "Email sended!"})

            }).catch ((error) => {
                res.status(error.code || 400).send({ error: error.message });    

            })

        } catch (error) {
            res.status(error.code || 400).send({ error: error.message });
        }
    };

    public async updatePassword(req: Request, res: Response) {
        try {
            const token = req.params.token;
            const newPassword = req.body.newPassword;
            const confirmNewPassword = req.body.confirmNewPassword;

            await UserController.UserBusiness.updatePassword(token, newPassword, confirmNewPassword)

            res.status(200).send({ message: "Password updated successfully!" })
        } catch (error) {
            res.status(error.code || 400).send({ error: error.message });
        }
    };

    public async updateUserById(req: Request, res: Response) {
        try {
            const token = req.headers.authorization as string;

            const id = req.params.id;

            const input: UserEditDTO = {
                email: req.body.email,
                name: req.body.name,
                cpf: req.body.cpf,
                password: req.body.password
            };

            await UserController.UserBusiness.updateUserById(token, id, input);

            res.status(200).send({ message: "User updated successfully!" })
        } catch (error) {
            console.log(error);
            
            res.status(error.code || 400).send({ error: error.message });
        }
    };

    public async deleteUserById(req: Request, res: Response) {
        try {
            const token = req.headers.authorization as string;

            const id = req.params.id;

            await UserController.UserBusiness.deleteUserById(token, id);

            res.status(200).send({ message: "User deleted successfully!" })
        } catch (error) {
            res.status(error.code || 400).send({ error: error.message });
        }
    };

};