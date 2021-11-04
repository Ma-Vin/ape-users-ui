import { map } from "rxjs/operators";
import { UserResource } from "./user-resource.model";
import { User } from "./user.model";

describe('User', () => {
    const userId = 'UAA00001';
    const firstName = 'Max';
    const lastName = 'Power';

    let user: User;
    let otherUser: User;

    beforeEach(() => {
        user = new User(userId, firstName, lastName);
        user.mail = `${firstName}.${lastName}@mav-vin.de`;
        user.lastLogin = new Date(2021, 12, 5, 10, 32, 45);
        user.validFrom = new Date(2021, 12, 1);
        user.validTo = new Date(2022, 12, 1);
        user.smallImage = new UserResource('URAA00001');
        user.image = new UserResource('URAA00002');
        user.isGlobalAdmin = true;

        otherUser = new User(userId, firstName, lastName);
        otherUser.mail = `${firstName}.${lastName}@mav-vin.de`;
        otherUser.lastLogin = new Date(2021, 12, 5, 10, 32, 45);
        otherUser.validFrom = new Date(2021, 12, 1);
        otherUser.validTo = new Date(2022, 12, 1);
        otherUser.smallImage = new UserResource('URAA00001');
        otherUser.image = new UserResource('URAA00002');
        otherUser.isGlobalAdmin = true;
    });

    it('should be created', () => {
        expect(user).toBeTruthy();
    });

    it('equal - undefined', () => {
        expect(user.equals(undefined)).toBeFalse();
    });

    it('equal - other type', () => {
        expect(user.equals(Object.assign({}, user))).toBeFalse();
    });

    it('equal - identical object', () => {
        expect(user.equals(user)).toBeTrue();
    });

    it('equal - User with identical values', () => {
        expect(user.equals(otherUser)).toBeTrue();
    });

    it('equal - User with identical values and undefines', () => {
        user.mail = undefined;
        user.image = undefined;
        user.smallImage = undefined;
        user.lastLogin = undefined;
        user.validFrom = undefined;
        user.validTo = undefined;

        otherUser.mail = undefined;
        otherUser.image = undefined;
        otherUser.smallImage = undefined;
        otherUser.lastLogin = undefined;
        otherUser.validFrom = undefined;
        otherUser.validTo = undefined;

        expect(user.equals(otherUser)).toBeTrue();
    });

    it('equal - User not equal identification', () => {
        otherUser.identification = otherUser.identification.concat('_');
        expect(user.equals(otherUser)).toBeFalse();
    });

    it('equal - User not equal firstName', () => {
        otherUser.firstName = otherUser.firstName.concat('_');
        expect(user.equals(otherUser)).toBeFalse();
    });

    it('equal - User not equal lastName', () => {
        otherUser.lastName = otherUser.lastName.concat('_');
        expect(user.equals(otherUser)).toBeFalse();
    });

    it('equal - User not equal mail', () => {
        otherUser.mail = otherUser.mail?.concat('_');
        expect(user.equals(otherUser)).toBeFalse();
    });

    it('equal - User not equal image', () => {
        if (otherUser.image != undefined) {
            otherUser.image.identification = otherUser.image.identification.concat('_');
        }
        expect(user.equals(otherUser)).toBeFalse();
        otherUser.image = undefined;
        expect(user.equals(otherUser)).toBeFalse();
        otherUser.image = user.image;
        user.image = undefined;
        expect(user.equals(otherUser)).toBeFalse();
    });

    it('equal - User not equal smallImage', () => {
        if (otherUser.smallImage != undefined) {
            otherUser.smallImage.identification = otherUser.smallImage.identification.concat('_');
        }
        expect(user.equals(otherUser)).toBeFalse();
        otherUser.smallImage = undefined;
        expect(user.equals(otherUser)).toBeFalse();
        otherUser.smallImage = user.smallImage;
        user.smallImage = undefined;
        expect(user.equals(otherUser)).toBeFalse();
    });

    it('equal - User not equal mail', () => {
        otherUser.isGlobalAdmin = !otherUser.isGlobalAdmin;
        expect(user.equals(otherUser)).toBeFalse();
    });

    it('map - should have equal values', () => {
        let mappedUser = User.map(user);

        expect(mappedUser).toBeInstanceOf(User);

        expect(mappedUser.identification).toEqual(user.identification);
        expect(mappedUser.firstName).toEqual(user.firstName);
        expect(mappedUser.lastName).toEqual(user.lastName);
        expect(mappedUser.mail).toEqual(user.mail);
        expect(mappedUser.image).toBeDefined();
        expect(mappedUser.image?.data).toEqual(user.image?.data);
        expect(mappedUser.smallImage).toBeDefined();
        expect(mappedUser.smallImage?.data).toEqual(user.smallImage?.data);
        expect(mappedUser.lastLogin).toEqual(user.lastLogin);
        expect(mappedUser.validFrom).toEqual(user.validFrom);
        expect(mappedUser.validTo).toEqual(user.validTo);
        expect(mappedUser.isGlobalAdmin).toEqual(user.isGlobalAdmin);

        expect(user.equals(mappedUser)).toBeTrue();
    });

});