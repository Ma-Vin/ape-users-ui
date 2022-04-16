import { ADMIN_GROUP_ABS_PATH, BASE_GROUPS_ABS_PATH, PRIVILEGE_GROUPS_ABS_PATH, USERS_ABS_PATH } from "../app-constants";
import { ChangeType, HistoryChange } from "./history-change.model";
import { ModelType } from "./model-type.model";

describe('HistoryChange', () => {
    const editorId = 'UAA00001';
    const subjectId = 'BGAA00001';
    const targetId = 'UAA00002';
    const action = 'Property: "null" -> "anythingNew"';
    const changeTime = new Date(2022, 4, 10, 13, 32, 45);

    let change: HistoryChange;
    let otherChange: HistoryChange;

    beforeEach(() => {
        change = new HistoryChange(changeTime, ChangeType.CREATE, subjectId);
        change.editor = editorId;
        change.action = action;
        change.targetIdentification = targetId;
        change.targetType = ModelType.BASE_GROUP;

        otherChange = new HistoryChange(changeTime, ChangeType.CREATE, subjectId);
        otherChange.editor = editorId;
        otherChange.action = action;
        otherChange.targetIdentification = targetId;
        otherChange.targetType = ModelType.BASE_GROUP;
    });

    it('should be created', () => {
        expect(change).toBeTruthy();
    });

    it('equal - undefined', () => {
        expect(change.equals(undefined)).toBeFalse();
    });

    it('equal - other type', () => {
        expect(change.equals(Object.assign({}, change))).toBeFalse();
    });

    it('equal - identical object', () => {
        expect(change.equals(change)).toBeTrue();
    });

    it('equal - HistoryChange with identical values', () => {
        expect(change.equals(otherChange)).toBeTrue();
    });

    it('equal - HistoryChange with identical values and undefines', () => {
        change.editor = undefined;
        change.action = undefined;
        change.targetIdentification = undefined;

        otherChange.editor = undefined;
        otherChange.action = undefined;
        otherChange.targetIdentification = undefined;

        expect(change.equals(otherChange)).toBeTrue();
    });

    it('equal - HistoryChange not equal changeTime', () => {
        otherChange.changeTime = new Date(2023, 4, 10, 13, 32, 45);
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('equal - HistoryChange not equal changeType', () => {
        otherChange.changeType = ChangeType.MODIFY;
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('equal - HistoryChange not equal subjectIdentification', () => {
        otherChange.subjectIdentification = otherChange.subjectIdentification.concat('_');
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('equal - HistoryChange not equal editor', () => {
        otherChange.editor = otherChange.editor!.concat('_');
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('equal - HistoryChange not equal editorIsAdmin', () => {
        otherChange.isEditorAdmin = !otherChange.isEditorAdmin;
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('equal - HistoryChange not equal action', () => {
        otherChange.action = otherChange.action!.concat('_');
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('equal - HistoryChange not equal targetIdentification', () => {
        otherChange.targetIdentification = otherChange.targetIdentification!.concat('_');
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('equal - HistoryChange not equal targetType', () => {
        otherChange.targetType = ModelType.UNKNOWN;
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('map - should have equal values', () => {
        let mappedChange = HistoryChange.map(change);

        expect(mappedChange).toBeInstanceOf(HistoryChange);

        expect(mappedChange.changeTime).toEqual(change.changeTime);
        expect(mappedChange.changeType).toEqual(change.changeType);
        expect(mappedChange.subjectIdentification).toEqual(change.subjectIdentification);
        expect(mappedChange.editor).toEqual(change.editor);
        expect(mappedChange.isEditorAdmin).toEqual(change.isEditorAdmin);
        expect(mappedChange.action).toEqual(change.action);
        expect(mappedChange.targetIdentification).toEqual(change.targetIdentification);
        expect(mappedChange.targetType).toEqual(change.targetType);

        expect(change.equals(mappedChange)).toBeTrue();
    });



    it('initUrlsAndType - normal editor', () => {
        change.initUrlsAndType();
        expect(change.editorUrl).toEqual(`${USERS_ABS_PATH}/${editorId}`);
    });

    it('initUrlsAndType - admin editor', () => {
        change.isEditorAdmin = true;
        change.initUrlsAndType();
        expect(change.editorUrl).toEqual(`${ADMIN_GROUP_ABS_PATH}/${editorId}`);
    });

    it('initUrlsAndType - undefined editor', () => {
        change.editor = undefined;
        change.initUrlsAndType();
        expect(change.editorUrl).toBeUndefined();
    });

    it('initUrlsAndType - privilege group target', () => {
        change.targetType = ModelType.PRIVILEGE_GROUP;
        change.initUrlsAndType();
        expect(change.targetUrl).toEqual(`${PRIVILEGE_GROUPS_ABS_PATH}/${targetId}`);
        expect(change.targetTypeText).toEqual('Privilege Group');
    });

    it('initUrlsAndType - base group target', () => {
        change.targetType = ModelType.BASE_GROUP;
        change.initUrlsAndType();
        expect(change.targetUrl).toEqual(`${BASE_GROUPS_ABS_PATH}/${targetId}`);
        expect(change.targetTypeText).toEqual('Base Group');
    });

    it('initUrlsAndType - user target', () => {
        change.targetType = ModelType.USER;
        change.initUrlsAndType();
        expect(change.targetUrl).toEqual(`${USERS_ABS_PATH}/${targetId}`);
        expect(change.targetTypeText).toEqual('User');
    });

    it('initUrlsAndType - unknown target', () => {
        change.targetType = ModelType.UNKNOWN;
        change.initUrlsAndType();
        expect(change.targetUrl).toBeUndefined();
        expect(change.targetTypeText).toBeUndefined();
    });

    it('initUrlsAndType - undefined target', () => {
        change.targetIdentification = undefined;
        change.initUrlsAndType();
        expect(change.targetUrl).toBeUndefined();
        expect(change.targetTypeText).toBeUndefined();
    });

    it('initUrlsAndType - undefined target type', () => {
        change.targetType = undefined;
        change.initUrlsAndType();
        expect(change.targetUrl).toBeUndefined();
        expect(change.targetTypeText).toBeUndefined();
    });

});