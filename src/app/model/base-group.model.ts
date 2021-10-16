import { IAbstractGroup } from "./abstract-group.model";

export interface IBaseGroup extends IAbstractGroup {
}

export class BaseGroup implements IBaseGroup {

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