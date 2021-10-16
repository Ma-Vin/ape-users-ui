import { IAbstractGroup } from "./abstract-group.model";

export interface IAdminGroup extends IAbstractGroup {
}

export class AdminGroup implements IAdminGroup {

    constructor(groupName: string, identification: string) {
        this.groupName = groupName;
        this.identification = identification;
    }

    description: string | undefined;
    groupName: string;
    identification: string;
    validFrom: Date | undefined;
    validTo: Date | undefined;
}
