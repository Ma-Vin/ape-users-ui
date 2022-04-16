import { ADMIN_GROUP_ABS_PATH, BASE_GROUPS_ABS_PATH, PRIVILEGE_GROUPS_ABS_PATH, USERS_ABS_PATH } from "../app-constants";
import { IEqualsAndIdentifiable } from "./equals-identifiable";
import { ModelType } from "./model-type.model";

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
     * Indicator whether the editor is an admin or not
     */
    isEditorAdmin: boolean;

    /**
     * The subject which is affected
     */
    subjectIdentification: string;

    /**
     * The target which is affected
     */
    targetIdentification: string | undefined;

    /**
     * Type of the target
     */
    targetType: ModelType | undefined;
}

/**
 * change event of entities during history
 */
export class HistoryChange implements IHistoryChange, IEqualsAndIdentifiable {

    action: string | undefined;
    changeTime: Date;
    changeType: ChangeType;
    editor: string | undefined;
    isEditorAdmin: boolean;
    subjectIdentification: string;
    targetIdentification: string | undefined;
    targetType: ModelType | undefined;

    editorUrl: string | undefined;
    targetUrl: string | undefined;
    targetTypeText: string | undefined;

    constructor(changeTime: Date, changeType: ChangeType, subjectIdentification: string) {
        this.changeTime = changeTime;
        this.changeType = changeType;
        this.subjectIdentification = subjectIdentification;
        this.isEditorAdmin = false;

        this.editorUrl = undefined;
        this.targetUrl = undefined;
    }

    /**
     * Creates an new HistoryChange and maps the given values to the new one
     * @param change the structure which is to map to a HistoryChange
     * @returns the new created HistoryChange instance. The urls are initialized.
     */
    public static map(change: IHistoryChange): HistoryChange {
        let result = new HistoryChange(change.changeTime, change.changeType, change.subjectIdentification);

        result.action = change.action;
        result.editor = change.editor;
        result.isEditorAdmin = change.isEditorAdmin;
        result.targetIdentification = change.targetIdentification;
        result.targetType = change.targetType;

        result.initUrlsAndType();

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
            && this.isEditorAdmin == other.isEditorAdmin
            && this.subjectIdentification == other.subjectIdentification
            && this.targetIdentification == other.targetIdentification
            && this.targetType == other.targetType;
    }

    getIdentification(): string {
        return 'null';
    }

    /**
     * Initialize the urls to the editor and to the target.The type of the target is also set. Nevertheless the urls and type might be undefined
     */
    initUrlsAndType(): void {
        if (this.editor != undefined) {
            this.editorUrl = `${this.isEditorAdmin ? ADMIN_GROUP_ABS_PATH : USERS_ABS_PATH}/${this.editor}`
        }
        if (this.targetIdentification != undefined && this.targetType != undefined) {
            switch (this.targetType) {
                case ModelType.PRIVILEGE_GROUP:
                    this.targetUrl = `${PRIVILEGE_GROUPS_ABS_PATH}/${this.targetIdentification}`;
                    this.targetTypeText = 'Privilege Group';
                    break;
                case ModelType.BASE_GROUP:
                    this.targetUrl = `${BASE_GROUPS_ABS_PATH}/${this.targetIdentification}`;
                    this.targetTypeText = 'Base Group';
                    break;
                case ModelType.USER:
                    this.targetUrl = `${USERS_ABS_PATH}/${this.targetIdentification}`;
                    this.targetTypeText = 'User';
                    break;
                default:
                    this.targetUrl = undefined;
                    this.targetTypeText = undefined;
            }
        }
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