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
    }


    getIdentification(): string {
        return this.identification;
    }
}
