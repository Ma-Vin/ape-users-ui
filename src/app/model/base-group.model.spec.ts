import { BaseGroup } from "./base-group.model";

describe('BaseGroup', () => {
    const userId = 'BGAA00001';
    const groupName = 'Base';
    const description = 'Some Base Group';

    let baseGroup: BaseGroup;
    let otherBaseGroup: BaseGroup;

    beforeEach(() => {
        baseGroup = new BaseGroup(groupName, userId);
        baseGroup.description = description;
        baseGroup.validFrom = new Date(2021, 12, 1);
        baseGroup.validTo = new Date(2022, 12, 1);

        otherBaseGroup = new BaseGroup(groupName, userId);
        otherBaseGroup.description = description;
        otherBaseGroup.validFrom = new Date(2021, 12, 1);
        otherBaseGroup.validTo = new Date(2022, 12, 1);
    });

    it('should be created', () => {
        expect(baseGroup).toBeTruthy();
    });

    it('equal - undefined', () => {
        expect(baseGroup.equals(undefined)).toBeFalse();
    });

    it('equal - other type', () => {
        expect(baseGroup.equals(Object.assign({}, baseGroup))).toBeFalse();
    });

    it('equal - identical object', () => {
        expect(baseGroup.equals(baseGroup)).toBeTrue();
    });

    it('equal - BaseGroup with identical values', () => {
        expect(baseGroup.equals(otherBaseGroup)).toBeTrue();
    });

    it('equal - BaseGroup with identical values and undefines', () => {
        baseGroup.description = undefined;
        baseGroup.validFrom = undefined;
        baseGroup.validTo = undefined;

        otherBaseGroup.description = undefined;
        otherBaseGroup.validFrom = undefined;
        otherBaseGroup.validTo = undefined;

        expect(baseGroup.equals(otherBaseGroup)).toBeTrue();
    });

    it('equal - BaseGroup not equal identification', () => {
        otherBaseGroup.identification = otherBaseGroup.identification.concat('_');
        expect(baseGroup.identification).not.toEqual(otherBaseGroup.identification);
        expect(baseGroup.equals(otherBaseGroup)).toBeFalse();
    });

    it('equal - BaseGroup not equal groupName', () => {
        otherBaseGroup.groupName = otherBaseGroup.groupName.concat('_');
        expect(baseGroup.groupName).not.toEqual(otherBaseGroup.groupName);
        expect(baseGroup.equals(otherBaseGroup)).toBeFalse();
    });

    it('equal - BaseGroup not equal description', () => {
        otherBaseGroup.description = otherBaseGroup.description?.concat('_');
        expect(baseGroup.description).not.toEqual(otherBaseGroup.description);
        expect(baseGroup.equals(otherBaseGroup)).toBeFalse();
    });

    it('map - should have equal values', () => {
        let mappedBaseGroup = BaseGroup.map(baseGroup);

        expect(mappedBaseGroup).toBeInstanceOf(BaseGroup);

        expect(mappedBaseGroup.identification).toEqual(baseGroup.identification);
        expect(mappedBaseGroup.description).toEqual(baseGroup.description);
        expect(mappedBaseGroup.validFrom).toEqual(baseGroup.validFrom);
        expect(mappedBaseGroup.validTo).toEqual(baseGroup.validTo);

        expect(baseGroup.equals(mappedBaseGroup)).toBeTrue();
    });

});