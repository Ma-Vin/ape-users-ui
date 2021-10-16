import { IAbstractGroup } from "./abstract-group.model";
import { Role } from "./role.model";

export interface ICommonGroup extends IAbstractGroup {
    defaultRole: Role
}

export class CommonGroup implements ICommonGroup {

    constructor(groupName: string, identification: string) {
        this.groupName = groupName;
        this.identification = identification;
    }
    
    defaultRole: Role = Role.NOT_RELEVANT;
    description: string | undefined;
    groupName: string;
    identification: string;
    validFrom: Date | undefined;
    validTo: Date | undefined;
}
