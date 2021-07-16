import { IdGenerator } from "../services/idGenerator";
import { UserDatabase } from "../data/UserDatabase";
import { LoginInputDTO, User, UserEditDTO, UserInputDTO } from "../model/User";
import { InvalidParameterError } from "../error/InvalidParameterError";
import { HashManager } from "../services/hashManager";
import { Authenticator } from "../services/authenticator";
import { Unauthorized } from "../error/Unauthorized";
import { GenericError } from "../error/GenericError";

export class UserBusiness {
    constructor (
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private hashManager: HashManager,
        private authenticator: Authenticator
    ) {}

    public async registerUser(user: UserInputDTO): Promise<string> {
		if (!user.email || !user.name || !user.cpf || !user.password) {
            throw new InvalidParameterError("Missing input");
        }

        if (user.email.indexOf("@") === -1) {
            throw new InvalidParameterError("Invalid email");
        }

        if (user.password.length < 6) {
            throw new InvalidParameterError("Invalid password");
        }

        const role = "NORMAL"
        const id = this.idGenerator.generate();
        const hashPassword = await this.hashManager.hash(user.password);

        await this.userDatabase.registerUser(id, user.email, user.name, user.cpf, hashPassword);

        const accessToken = this.authenticator.generateToken({ id, role });

        return accessToken;
    };

    public async getUserByEmailOrCpf(user: LoginInputDTO): Promise<string> {
 
        if (!user.emailOrCpf || !user.password) {
            throw new InvalidParameterError("Missing input");
        };

        const userFromDB = await this.userDatabase.getUserByEmailOrCpf(user.emailOrCpf);
        
        const hashCompare = await this.hashManager.compare(user.password, userFromDB.getPassword());

        if (!hashCompare) {
            throw new InvalidParameterError("Invalid Password!");
        };
        
        const accessToken = this.authenticator.generateToken({ id: userFromDB.getId(), role: userFromDB.getRole() });

        return accessToken;
    };

    public async getAllUser(token: string): Promise<User[]> {
        if (!token) {
            throw new GenericError("User must be logged");
        };

        const accessToken = this.authenticator.getData(token);
        if (accessToken.role !== "ADMIN") {
            throw new Unauthorized("Unauthorized");
        };

        const users = await this.userDatabase.getAllUsers();

        return users;
    };

    public async getUserById(token: string): Promise<User> {
        if (!token) {
            throw new GenericError("User must be logged");
        };

        const accessToken = this.authenticator.getData(token);

        return await this.userDatabase.getUserById(accessToken.id);
    };

    public async getUserByEmail(email: string): Promise<any> {
        if (!email) {
			throw new InvalidParameterError("Missing input");
        };

        const user = await this.userDatabase.getUserByEmail(email);

        const token = this.authenticator.generateToken({ id: user.getId(), role: user.getRole() }, '30min');
        
        const response = {
            user,
            token
        };

        return response;
    };

    public async updateUserById(token: string, id: string, user: UserEditDTO): Promise<void> {
        if (!token) {
            throw new GenericError("User must be logged");
        };

        if (
            !user.email || 
            !user.name || 
            !user.cpf
        ) {
			throw new InvalidParameterError("Missing input");
        };

        let hashPassword;
        if (user.password) {
            hashPassword = await this.hashManager.hash(user.password);
        };

        await this.userDatabase.updateUserById (
            id,
            user.email,
            user.name,
            user.cpf,
            hashPassword
        );
    };

    public async updatePassword(token: string, newPassword: string, confirmNewPassword: string): Promise<void> {
        if (!token) {
            throw new GenericError("User must be logged");
        };

        if (!newPassword || !confirmNewPassword) {
			throw new InvalidParameterError("Missing input");
        };

        if (newPassword !== confirmNewPassword) {
            throw new GenericError("Different newPassword and confirmNewPassword")
        };

        const userId = this.authenticator.getData(token);

        const hashPassword = await this.hashManager.hash(newPassword);

        await this.userDatabase.updatePassword(userId.id, hashPassword);
    };

    public async deleteUserById(token: string, id: string): Promise<void> {
        if (!token) {
            throw new GenericError("User must be logged");
        };

        await this.userDatabase.deleteUserById(id);
    };

};
