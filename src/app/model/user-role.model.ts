import { Role } from "./role.model";
import { IUser, User } from "./user.model";

export interface IUserRole {
    user: IUser;
    role: Role;
}

export class UserRole implements IUserRole {
    
    constructor(user: User, role: Role) {
        this.user = user;
        this.role = role;
    }

    user: User;
    role: Role;

}