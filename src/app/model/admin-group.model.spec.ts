import { AdminGroup } from "./admin-group.model";

describe('AdminGroup', () => {
    const userId = 'BGAA00001';
    const groupName = 'Base';
    const description = 'Some Base Group';

    let adminGroup: AdminGroup;
    let otherAdminGroup: AdminGroup;

    beforeEach(() => {
        adminGroup = new AdminGroup(groupName, userId);
        adminGroup.description = description;
        adminGroup.validFrom = new Date(2021, 12, 1);
        adminGroup.validTo = new Date(2022, 12, 1);

        otherAdminGroup = new AdminGroup(groupName, userId);
        otherAdminGroup.description = description;
        otherAdminGroup.validFrom = new Date(2021, 12, 1);
        otherAdminGroup.validTo = new Date(2022, 12, 1);
    });

    it('should be created', () => {
        expect(adminGroup).toBeTruthy();
    });

    it('equal - undefined', () => {
        expect(adminGroup.equals(undefined)).toBeFalse();
    });

    it('equal - other type', () => {
        expect(adminGroup.equals(Object.assign({}, adminGroup))).toBeFalse();
    });

    it('equal - identical object', () => {
        expect(adminGroup.equals(adminGroup)).toBeTrue();
    });

    it('equal - AdminGroup with identical values', () => {
        expect(adminGroup.equals(otherAdminGroup)).toBeTrue();
    });

    it('equal - AdminGroup with identical values and undefines', () => {
        adminGroup.description = undefined;
        adminGroup.validFrom = undefined;
        adminGroup.validTo = undefined;

        otherAdminGroup.description = undefined;
        otherAdminGroup.validFrom = undefined;
        otherAdminGroup.validTo = undefined;

        expect(adminGroup.equals(otherAdminGroup)).toBeTrue();
    });

    it('equal - AdminGroup not equal identification', () => {
        otherAdminGroup.identification = otherAdminGroup.identification.concat('_');
        expect(adminGroup.identification).not.toEqual(otherAdminGroup.identification);
        expect(adminGroup.equals(otherAdminGroup)).toBeFalse();
    });

    it('equal - AdminGroup not equal groupName', () => {
        otherAdminGroup.groupName = otherAdminGroup.groupName.concat('_');
        expect(adminGroup.groupName).not.toEqual(otherAdminGroup.groupName);
        expect(adminGroup.equals(otherAdminGroup)).toBeFalse();
    });

    it('equal - AdminGroup not equal description', () => {
        otherAdminGroup.description = otherAdminGroup.description?.concat('_');
        expect(adminGroup.description).not.toEqual(otherAdminGroup.description);
        expect(adminGroup.equals(otherAdminGroup)).toBeFalse();
    });

    it('equal - AdminGroup not completed', () => {
        otherAdminGroup.isComplete = false;
        expect(adminGroup.isComplete).not.toEqual(otherAdminGroup.isComplete);
        expect(adminGroup.equals(otherAdminGroup)).toBeFalse();
    });

    it('map - should have equal values', () => {
        adminGroup.isComplete = false;
        let mappedAdminGroup = AdminGroup.map(adminGroup);

        expect(mappedAdminGroup).toBeInstanceOf(AdminGroup);

        expect(mappedAdminGroup.identification).toEqual(adminGroup.identification);
        expect(mappedAdminGroup.description).toEqual(adminGroup.description);
        expect(mappedAdminGroup.validFrom).toEqual(adminGroup.validFrom);
        expect(mappedAdminGroup.validTo).toEqual(adminGroup.validTo);
        expect(mappedAdminGroup.isComplete).toEqual(adminGroup.isComplete);

        expect(adminGroup.equals(mappedAdminGroup)).toBeTrue();
    });

});