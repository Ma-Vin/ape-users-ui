import { IAbstractGroup } from "./abstract-group.model";
import { IEqualsAndIdentifiable } from "./equals-identifiable";
import { Role } from "./role.model";

export interface ICommonGroup extends IAbstractGroup {
    defaultRole: Role
}

export class CommonGroup implements ICommonGroup, IEqualsAndIdentifiable {

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
    isComplete = true;

    /**
     * Creates an new CommonGroup and maps the given values to the new one
     * @param common the structure which is to map to a CommonGroup
     * @returns the new created CommonGroup instance
     */
    public static map(common: ICommonGroup): CommonGroup {
        let result = new CommonGroup(common.groupName, common.identification);

        result.description = common.description;
        result.validFrom = common.validFrom;
        result.validTo = common.validTo;
        result.defaultRole = common.defaultRole;
        result.isComplete = common.isComplete;

        return result;
    }

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
            && this.isComplete == other.isComplete;
    }

    getIdentification(): string {
        return this.identification;
    }

}
