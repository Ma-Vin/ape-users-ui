import { BaseGroup, IBaseGroup } from "./base-group.model";
import { Role } from "./role.model";

export interface IBaseGroupRole {
    baseGroup: IBaseGroup;
    role: Role;
}

export class BaseGroupRole implements IBaseGroupRole {

    constructor(baseGroup: BaseGroup, role: Role) {
        this.baseGroup = baseGroup;
        this.role = role;
    }

    baseGroup: IBaseGroup;
    role: Role;
}
