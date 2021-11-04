import { UserResource } from "./user-resource.model";

describe('UserResource', () => {
    const userResourceId = 'URAA00001';

    let userResource: UserResource;
    let otherUserResource: UserResource;

    beforeEach(() => {
        userResource = new UserResource(userResourceId);
        userResource.data = 'someData';
        otherUserResource = new UserResource(userResourceId);
        otherUserResource.data = 'someData';
    });

    it('should be created', () => {
        expect(userResource).toBeTruthy();
    });

    it('equal - undefined', () => {
        expect(userResource.equals(undefined)).toBeFalse();
    });

    it('equal - other type', () => {
        expect(userResource.equals(Object.assign({}, userResource))).toBeFalse();
    });

    it('equal - identical object', () => {
        expect(userResource.equals(userResource)).toBeTrue();
    });

    it('equal - User with identical values', () => {
        expect(userResource.equals(otherUserResource)).toBeTrue();
    });

    it('equal - User with identical values and undefines', () => {
        userResource.data = undefined;
        otherUserResource.data = undefined;

        expect(userResource.equals(otherUserResource)).toBeTrue();
    });

    it('equal - User not equal identification', () => {
        otherUserResource.identification = otherUserResource.identification.concat('_');
        expect(userResource.equals(otherUserResource)).toBeFalse();
    });

    it('equal - User not equal data', () => {
        if (otherUserResource.data != undefined) {
            otherUserResource.data = (otherUserResource.data as string).concat('_');
        }
        expect(userResource.equals(otherUserResource)).toBeFalse();
    });


    it('map - should have equal values', () => {
        let mappedUserResource = UserResource.map(userResource);

        expect(mappedUserResource).toBeDefined();
        expect(mappedUserResource).toBeInstanceOf(UserResource);

        expect(mappedUserResource?.identification).toEqual(userResource.identification);
        expect(mappedUserResource?.data).toEqual(userResource.data);

        expect(userResource.equals(mappedUserResource)).toBeTrue();
    });
});