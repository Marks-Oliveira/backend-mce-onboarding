import moment from "moment";

export class User {
    constructor(
        private id: string,
        private email: string,
        private name: string,
        private cpf: string,
        private password: string,
        private role: string,
        private createdAt: moment.Moment
    ) {}

    getId() {return this.id};
    getEmail() {return this.email};
    getName() {return this.name};
    getCpf() {return this.cpf}
    getPassword() {return this.password};
    getRole() {return this.role};
    getCreatedAt() {return this.createdAt};

    static toUserModel(user: any): User {
        let date = moment(user.cr)

        return user && new User (
            user.id, 
            user.email, 
            user.name, 
            user.cpf, 
            user.password, 
            user.role,
            user.created_at 
            );
    };

};

export interface UserInputDTO {
    name: string;
    email: string;
    cpf: string;
    password: string;
    role?:string
};

export interface LoginInputDTO {
    emailOrCpf: string;
    password: string;
};

export interface UserEditDTO {
    name: string;
    email: string;
    cpf: string;
    password?: string;
};
