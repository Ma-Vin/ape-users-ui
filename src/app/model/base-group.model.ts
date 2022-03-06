import { IAbstractGroup } from "./abstract-group.model";
import { IEqualsAndIdentifiable } from "./equals-identifiable";

export interface IBaseGroup extends IAbstractGroup {
}

export class BaseGroup implements IBaseGroup, IEqualsAndIdentifiable {

    constructor(groupName: string, identification: string) {
        this.groupName = groupName;
        this.identification = identification;
    }

    description: string | undefined;
    groupName: string;
    identification: string;
    validFrom: Date | undefined;
    validTo: Date | undefined;
    isComplete = true;


    /**
     * Creates an new BaseGroup and maps the given values to the new one
     * @param base the structure which is to map to a BaseGroup
     * @returns the new created BaseGroup instance
     */
    public static map(base: IBaseGroup): BaseGroup {
        let result = new BaseGroup(base.groupName, base.identification);

        result.description = base.description;
        result.validFrom = base.validFrom;
        result.validTo = base.validTo;
        result.isComplete = base.isComplete;

        return result;
    }


    public equals(other: any): boolean {
        if (other == undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        if (!(other instanceof BaseGroup)) {
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