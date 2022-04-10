import { ChangeType, HistoryChange } from "./history-change.model";

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

        otherChange = new HistoryChange(changeTime, ChangeType.CREATE, subjectId);
        otherChange.editor = editorId;
        otherChange.action = action;
        otherChange.targetIdentification = targetId;
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

    it('equal - HistoryChange not equal action', () => {
        otherChange.action = otherChange.action!.concat('_');
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('equal - HistoryChange not equal targetIdentification', () => {
        otherChange.targetIdentification = otherChange.targetIdentification!.concat('_');
        expect(change.equals(otherChange)).toBeFalse();
    });

    it('map - should have equal values', () => {
        let mappedChange = HistoryChange.map(change);

        expect(mappedChange).toBeInstanceOf(HistoryChange);

        expect(mappedChange.changeTime).toEqual(change.changeTime);
        expect(mappedChange.changeType).toEqual(change.changeType);
        expect(mappedChange.subjectIdentification).toEqual(change.subjectIdentification);
        expect(mappedChange.editor).toEqual(change.editor);
        expect(mappedChange.action).toEqual(change.action);
        expect(mappedChange.targetIdentification).toEqual(change.targetIdentification);

        expect(change.equals(mappedChange)).toBeTrue();
    });

});