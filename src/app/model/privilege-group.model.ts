import { IAbstractGroup } from "./abstract-group.model";

export interface IPrivilegeGroup extends IAbstractGroup {
}

export class PrivilegeGroup implements IPrivilegeGroup {

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