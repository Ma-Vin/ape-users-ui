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

    /**
     * Creates an new CommonGroup and maps the given values to the new one
     * @param base the structure which is to map to a CommonGroup
     * @returns the new created CommonGroup instance
     */
    public static map(base: ICommonGroup): CommonGroup {
        let result = new CommonGroup(base.groupName, base.identification);

        result.description = base.description;
        result.validFrom = base.validFrom;
        result.validTo = base.validTo;
        result.defaultRole = base.defaultRole;

        return result;
    }

    /**
     * Checks whether an other object is equal to the actual one
     * @param other the other object
     * @returns true if the object eqauls the actual one (It has to be an instance of CommonGroup). Otherwise false
     */
    public equals(other: any): boolean {
        if (other == undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        if (!(other instanceof CommonGroup)) {
            return false;
        }
        return this.identification == other.identification
            && this.groupName == other.groupName
            && this.description == other.description
            && this.validFrom?.getTime() == other.validFrom?.getTime()
            && this.validTo?.getTime() == other.validTo?.getTime()
            && this.defaultRole == other.defaultRole
    }
}
