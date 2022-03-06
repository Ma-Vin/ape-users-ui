import { PrivilegeGroup } from "./privilege-group.model";

describe('PrivilegeGroup', () => {
    const userId = 'BGAA00001';
    const groupName = 'Base';
    const description = 'Some Base Group';

    let privilegeGroup: PrivilegeGroup;
    let otherPrivilegeGroup: PrivilegeGroup;

    beforeEach(() => {
        privilegeGroup = new PrivilegeGroup(groupName, userId);
        privilegeGroup.description = description;
        privilegeGroup.validFrom = new Date(2021, 12, 1);
        privilegeGroup.validTo = new Date(2022, 12, 1);

        otherPrivilegeGroup = new PrivilegeGroup(groupName, userId);
        otherPrivilegeGroup.description = description;
        otherPrivilegeGroup.validFrom = new Date(2021, 12, 1);
        otherPrivilegeGroup.validTo = new Date(2022, 12, 1);
    });

    it('should be created', () => {
        expect(privilegeGroup).toBeTruthy();
    });

    it('equal - undefined', () => {
        expect(privilegeGroup.equals(undefined)).toBeFalse();
    });

    it('equal - other type', () => {
        expect(privilegeGroup.equals(Object.assign({}, privilegeGroup))).toBeFalse();
    });

    it('equal - identical object', () => {
        expect(privilegeGroup.equals(privilegeGroup)).toBeTrue();
    });

    it('equal - PrivilegeGroup with identical values', () => {
        expect(privilegeGroup.equals(otherPrivilegeGroup)).toBeTrue();
    });

    it('equal - PrivilegeGroup with identical values and undefines', () => {
        privilegeGroup.description = undefined;
        privilegeGroup.validFrom = undefined;
        privilegeGroup.validTo = undefined;

        otherPrivilegeGroup.description = undefined;
        otherPrivilegeGroup.validFrom = undefined;
        otherPrivilegeGroup.validTo = undefined;

        expect(privilegeGroup.equals(otherPrivilegeGroup)).toBeTrue();
    });

    it('equal - PrivilegeGroup not equal identification', () => {
        otherPrivilegeGroup.identification = otherPrivilegeGroup.identification.concat('_');
        expect(privilegeGroup.identification).not.toEqual(otherPrivilegeGroup.identification);
        expect(privilegeGroup.equals(otherPrivilegeGroup)).toBeFalse();
    });

    it('equal - PrivilegeGroup not equal groupName', () => {
        otherPrivilegeGroup.groupName = otherPrivilegeGroup.groupName.concat('_');
        expect(privilegeGroup.groupName).not.toEqual(otherPrivilegeGroup.groupName);
        expect(privilegeGroup.equals(otherPrivilegeGroup)).toBeFalse();
    });

    it('equal - PrivilegeGroup not equal description', () => {
        otherPrivilegeGroup.description = otherPrivilegeGroup.description?.concat('_');
        expect(privilegeGroup.description).not.toEqual(otherPrivilegeGroup.description);
        expect(privilegeGroup.equals(otherPrivilegeGroup)).toBeFalse();
    });

    it('equal - PrivilegeGroup not equal isComplete', () => {
        otherPrivilegeGroup.isComplente = false;
        expect(privilegeGroup.isComplente).not.toEqual(otherPrivilegeGroup.isComplente);
        expect(privilegeGroup.equals(otherPrivilegeGroup)).toBeFalse();
    });

    it('map - should have equal values', () => {
        privilegeGroup.isComplente = false;
        let mappedPrivilegeGroup = PrivilegeGroup.map(privilegeGroup);

        expect(mappedPrivilegeGroup).toBeInstanceOf(PrivilegeGroup);

        expect(mappedPrivilegeGroup.identification).toEqual(privilegeGroup.identification);
        expect(mappedPrivilegeGroup.description).toEqual(privilegeGroup.description);
        expect(mappedPrivilegeGroup.validFrom).toEqual(privilegeGroup.validFrom);
        expect(mappedPrivilegeGroup.validTo).toEqual(privilegeGroup.validTo);
        expect(mappedPrivilegeGroup.isComplente).toEqual(privilegeGroup.isComplente);

        expect(privilegeGroup.equals(mappedPrivilegeGroup)).toBeTrue();
    });

});