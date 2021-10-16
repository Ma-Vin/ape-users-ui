import { Role } from "./role.model";

export interface IBaseGroupIdRole {
    baseGroupIdentification: string;
    role: Role;
}

export class BaseGroupIdRole implements IBaseGroupIdRole {

    constructor(baseGroupIdentification: string, role: Role) {
        this.baseGroupIdentification = baseGroupIdentification;
        this.role = role;
    }

    baseGroupIdentification: string;
    role: Role;

}
