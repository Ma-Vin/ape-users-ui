
import { CommonGroup } from "./common-group.model";
import { Role } from "./role.model";

describe('CommonGroup', () => {
    const commonGroupId = 'CGAA00001';
    const groupName = 'SomeTestGroup';

    let commonGroup: CommonGroup;
    let otherCommonGroup: CommonGroup;

    beforeEach(() => {
        commonGroup = new CommonGroup(groupName, commonGroupId);
        commonGroup.description = 'some description';
        commonGroup.validFrom = new Date(2021, 12, 1);
        commonGroup.validTo = new Date(2022, 12, 1);
        commonGroup.defaultRole = Role.VISITOR;

        otherCommonGroup = new CommonGroup(groupName, commonGroupId);
        otherCommonGroup.description = 'some description';
        otherCommonGroup.validFrom = new Date(2021, 12, 1);
        otherCommonGroup.validTo = new Date(2022, 12, 1);
        otherCommonGroup.defaultRole = Role.VISITOR;
    });

    it('should be created', () => {
        expect(commonGroup).toBeTruthy();
    });


    /**
     * equal
     */
    it('equal - undefined', () => {
        expect(commonGroup.equals(undefined)).toBeFalse();
    });

    it('equal - other type', () => {
        expect(commonGroup.equals(Object.assign({}, commonGroup))).toBeFalse();
    });

    it('equal - identical object', () => {
        expect(commonGroup.equals(commonGroup)).toBeTrue();
    });

    it('equal - CommonGroup with identical values', () => {
        expect(commonGroup.equals(otherCommonGroup)).toBeTrue();
    });

    it('equal - CommonGroup with identical values and undefines', () => {
        commonGroup.description = undefined;
        commonGroup.validFrom = undefined;
        commonGroup.validTo = undefined;

        otherCommonGroup.description = undefined;
        otherCommonGroup.validFrom = undefined;
        otherCommonGroup.validTo = undefined;

        expect(commonGroup.equals(otherCommonGroup)).toBeTrue();
    });

    it('equal - CommonGroup not equal identification', () => {
        otherCommonGroup.identification = otherCommonGroup.identification.concat('_');
        expect(commonGroup.equals(otherCommonGroup)).toBeFalse();
    });

    it('equal - CommonGroup not equal description', () => {
        otherCommonGroup.description = otherCommonGroup.description?.concat('_');
        expect(commonGroup.equals(otherCommonGroup)).toBeFalse();
    });

    it('equal - CommonGroup not equal valid from', () => {
        otherCommonGroup.validFrom =  new Date(2021, 12, 2);
        expect(commonGroup.equals(otherCommonGroup)).toBeFalse();
    });

    it('equal - CommonGroup not equal valid to', () => {
        otherCommonGroup.validTo =  new Date(2022, 12, 2);
        expect(commonGroup.equals(otherCommonGroup)).toBeFalse();
    });

    it('equal - CommonGroup not equal default role', () => {
        otherCommonGroup.defaultRole = Role.MANAGER;
        expect(commonGroup.equals(otherCommonGroup)).toBeFalse();
    });


    /**
     * map
     */
    it('map - should have equal values', () => {
        let mappedCommonGroup = CommonGroup.map(commonGroup);

        expect(mappedCommonGroup).toBeInstanceOf(CommonGroup);

        expect(mappedCommonGroup.identification).toEqual(commonGroup.identification);
        expect(mappedCommonGroup.groupName).toEqual(commonGroup.groupName);
        expect(mappedCommonGroup.description).toEqual(commonGroup.description);
        expect(mappedCommonGroup.defaultRole).toEqual(commonGroup.defaultRole);
        expect(mappedCommonGroup.validFrom).toEqual(commonGroup.validFrom);
        expect(mappedCommonGroup.validTo).toEqual(commonGroup.validTo);

        expect(commonGroup.equals(mappedCommonGroup)).toBeTrue();
    });

});