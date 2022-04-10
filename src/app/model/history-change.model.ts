import { IEqualsAndIdentifiable } from "./equals-identifiable";

/**
 * Interface of change events of entities during history
 */
export interface IHistoryChange {

    /**
     * The concrete action of this change
     */
    action: string | undefined;

    /**
     * date time of the change
     */
    changeTime: Date;

    /**
     * The general type of action
     */
    changeType: ChangeType;

    /**
     * Editor indetification of the change
     */
    editor: string | undefined;

    /**
     * The subject which is affected
     */
    subjectIdentification: string;

    /**
     * The target which is affected
     */
    targetIdentification: string | undefined;
}

/**
 * change event of entities during history
 */
export class HistoryChange implements IHistoryChange, IEqualsAndIdentifiable {

    action: string | undefined;
    changeTime: Date;
    changeType: ChangeType;
    editor: string | undefined;
    subjectIdentification: string;
    targetIdentification: string | undefined;

    constructor(changeTime: Date, changeType: ChangeType, subjectIdentification: string) {
        this.changeTime = changeTime;
        this.changeType = changeType;
        this.subjectIdentification = subjectIdentification;
    }

    /**
     * Creates an new HistoryChange and maps the given values to the new one
     * @param change the structure which is to map to a HistoryChange
     * @returns the new created HistoryChange instance
     */
    public static map(change: IHistoryChange): HistoryChange {
        let result = new HistoryChange(change.changeTime, change.changeType, change.subjectIdentification);

        result.action = change.action;
        result.editor = change.editor;
        result.targetIdentification = change.targetIdentification;

        return result;
    }

    equals(other: any): boolean {
        if (other == undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        if (!(other instanceof HistoryChange)) {
            return false;
        }

        return this.action == other.action
            && this.changeTime == other.changeTime
            && this.changeType == other.changeType
            && this.editor == other.editor
            && this.subjectIdentification == other.subjectIdentification
            && this.targetIdentification == other.targetIdentification;
    }
    getIdentification(): string {
        return 'null';
    }
}

/**
 * Enum which represent general action for historization
 */
export enum ChangeType {
    CREATE = 'CREATE',
    DELETE = 'DELETE',
    ADD = 'ADD',
    REMOVE = 'REMOVE',
    MODIFY = 'MODIFY',
    UNKNOWN = 'UNKNOWN'
}