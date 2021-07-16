import moment from "moment";
import { BaseDatabase } from "./base/BaseDatabase";
import { User } from "../model/User";
import { NotFoundError } from "../error/NotFoundError";

export class UserDatabase extends BaseDatabase {

  public async registerUser(
    id: string,
    email: string,
    name: string,
    cpf: string,
    password: string,
  ): Promise<void> {
    let date = moment().format("YYYY-MM-DD");

    try {
      await this.getConnection()
        .insert({
          id,
          email,
          name,
          cpf,
          password,
          created_at: date
        })
        .into(this.tableNames.users);

      await BaseDatabase.destroyConnection();

    } catch (error) {
      throw new Error(error.sqlMessage || error.message);
    }
  };

  public async getUserByEmailOrCpf(emailOrCpf: string): Promise<User> {
    try {
      const result = await this.getConnection()
        .select("*")
        .from(this.tableNames.users)
        .where({ email: emailOrCpf })     
        .or.where({ cpf: emailOrCpf });

      await BaseDatabase.destroyConnection();

      return User.toUserModel(result[0]);  
      
    } catch (error) {
      throw new NotFoundError(error.sqlMessage || "User not found!");
    }
  };

  public async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.getConnection()
        .select('*')
        .from(this.tableNames.users)

      await BaseDatabase.destroyConnection();
      
      return result;

    } catch (error) {
      throw new Error(error.sqlMessage || error.message);
    }
  };

  public async getUserById(id: string): Promise<User> {
    try {
      const result = await this.getConnection()
        .select("*")
        .from(this.tableNames.users)
        .where({ id })

      await BaseDatabase.destroyConnection();

      return User.toUserModel(result[0]);

    } catch (error) {
      throw new Error(error.sqlMessage || error.message);
    }
  };

  public async getUserByEmail(email: string): Promise<User> {
    try {
      const result = await this.getConnection()
        .select("*")
        .from(this.tableNames.users)
        .where({ email })

      await BaseDatabase.destroyConnection();
      
      return User.toUserModel(result[0]);

    } catch (error) {
      throw new NotFoundError(error.sqlMessage || "User not found!");
    }
  };

  public async updateUserById (
    id: string, 
    email: string,
    name: string,
    cpf: string,
    password?: string
  ): Promise<void> {

    try {

      if (password) {
        await this.getConnection().raw(`
          UPDATE ${this.tableNames.users}
          SET email = '${email}', 
            name = '${name}', 
            cpf = '${cpf}', 
            password = '${password}'
          WHERE id = '${id}'
        `)

      } else {
        await this.getConnection().raw(`
          UPDATE ${this.tableNames.users}
          SET email = '${email}', 
            name = '${name}', 
            cpf = '${cpf}'
          WHERE id = '${id}'
        `)
      };

      await BaseDatabase.destroyConnection();

    } catch (error) {
      throw new Error(error.sqlMessage || error.message);
    }
  };

  public async updatePassword (id: string, newPassword: string): Promise<void> {
    try {
      await this.getConnection().raw(`
        UPDATE ${this.tableNames.users}
        SET password = '${newPassword}'
        WHERE id = '${id}'
      `)

      await BaseDatabase.destroyConnection();

    } catch (error) {
      throw new Error(error.sqlMessage || error.message);
    }
  };

  public async deleteUserById(id: string): Promise<void> {
    try {
      await this.getConnection()
        .del()
        .from(this.tableNames.users)
        .where({ id })

      await BaseDatabase.destroyConnection();

    } catch (error) {
      throw new Error(error.sqlMessage || error.message);
    }
  };

};
