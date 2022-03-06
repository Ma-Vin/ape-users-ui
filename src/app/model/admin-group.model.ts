import { IAbstractGroup } from "./abstract-group.model";
import { IEqualsAndIdentifiable } from "./equals-identifiable";

export interface IAdminGroup extends IAbstractGroup {
}

export class AdminGroup implements IAdminGroup, IEqualsAndIdentifiable {
    description: string | undefined;
    groupName: string;
    identification: string;
    validFrom: Date | undefined;
    validTo: Date | undefined;
    isComplete = true;

    constructor(groupName: string, identification: string) {
        this.groupName = groupName;
        this.identification = identification;
    }

    public static map(admin: IAdminGroup): AdminGroup {
        let result = new AdminGroup(admin.groupName, admin.identification);

        result.description = admin.description;
        result.validFrom = admin.validFrom;
        result.validTo = admin.validTo;
        result.isComplete = admin.isComplete;

        return result;
    }


    public equals(other: any): boolean {
        if (other == undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        if (!(other instanceof AdminGroup)) {
            return false;
        }

        return this.identification == other.identification
            && this.groupName == other.groupName
            && this.description == other.description
            && this.validFrom?.getTime() == other.validFrom?.getTime()
            && this.validTo?.getTime() == other.validTo?.getTime()
            && this.isComplete == other.isComplete;
    }


    getIdentification(): string {
        return this.identification;
    }
}
