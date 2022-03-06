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
    isComplente = true;

    /**
     * Creates an new PrivilegeGroup and maps the given values to the new one
     * @param privilege the structure which is to map to a PrivilegeGroup
     * @returns the new created PrivilegeGroup instance
     */
    public static map(privilege: IPrivilegeGroup): PrivilegeGroup {
        let result = new PrivilegeGroup(privilege.groupName, privilege.identification);

        result.description = privilege.description;
        result.validFrom = privilege.validFrom;
        result.validTo = privilege.validTo;
        result.isComplente = privilege.isComplente;

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
            && this.validTo?.getTime() == other.validTo?.getTime()
            && this.isComplente == other.isComplente;
    }


    getIdentification(): string {
        return this.identification;
    }
}