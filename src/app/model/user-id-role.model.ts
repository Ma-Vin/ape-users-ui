import { Role } from "./role.model";

export interface IUserIdRole {
    userIdentification: string;
    role: Role;
}

export class UserIdRole implements IUserIdRole {

    constructor(userIdentification: string, role: Role) {
        this.userIdentification = userIdentification;
        this.role = role;
    }

    userIdentification: string;
    role: Role;

}
