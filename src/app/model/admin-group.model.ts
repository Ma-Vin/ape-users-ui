import { IAbstractGroup } from "./abstract-group.model";

export interface IAdminGroup extends IAbstractGroup {
}

export class AdminGroup implements IAdminGroup {
    description: string | undefined;
    groupName: string;
    identification: string;
    validFrom: Date | undefined;
    validTo: Date | undefined;

    constructor(groupName: string, identification: string) {
        this.groupName = groupName;
        this.identification = identification;
    }

    public static map(base: IAdminGroup): AdminGroup {
        let result = new AdminGroup(base.groupName, base.identification);

        result.description = base.description;
        result.validFrom = base.validFrom;
        result.validTo = base.validTo;

        return result;
    }
}
