import { IAbstractGroup } from "./abstract-group.model";
import { IEqualsAndIdentifiable } from "./equals-identifiable";

export interface IPrivilegeGroup extends IAbstractGroup {
}

export class PrivilegeGroup implements IPrivilegeGroup, IEqualsAndIdentifiable {

    constructor(groupName: string, identification: string) {
        this.groupName = groupName;
        this.identification = identification;
    }

    description: string | undefined;
    groupName: string;
    identification: string;
    validFrom: Date | undefined;
    validTo: Date | undefined;

    /**
     * Creates an new PrivilegeGroup and maps the given values to the new one
     * @param base the structure which is to map to a PrivilegeGroup
     * @returns the new created PrivilegeGroup instance
     */
    public static map(base: IPrivilegeGroup): PrivilegeGroup {
        let result = new PrivilegeGroup(base.groupName, base.identification);

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
        if (!(other instanceof PrivilegeGroup)) {
            return false;
        }

        return this.identification == other.identification
            && this.groupName == other.groupName
            && this.description == other.description
            && this.validFrom?.getTime() == other.validFrom?.getTime()
            && this.validTo?.getTime() == other.validTo?.getTime();
    }


    getIdentification(): string {
        return this.identification;
    }
}