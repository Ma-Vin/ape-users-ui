import { IUserResource, UserResource } from "./user-resource.model";

export interface IUser {

    identification: string;
    firstName: string;
    lastName: string;
    mail: string | undefined;
    image: IUserResource | undefined;
    smallImage: IUserResource | undefined;
    lastLogin: Date | undefined;
    validFrom: Date | undefined;
    validTo: Date | undefined;

}

export class User implements IUser {

    identification: string;
    firstName: string;
    lastName: string;
    mail: string | undefined;
    image: UserResource | undefined;
    smallImage: UserResource | undefined;
    lastLogin: Date | undefined;
    validFrom: Date | undefined;
    validTo: Date | undefined;
    isGlobalAdmin = false;

    constructor(identification: string, firstName: string, lastName: string) {
        this.identification = identification;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    /**
     * Creates an new User and maps the given values to the new one
     * @param base the structure which is to map to a User
     * @returns the new created User instance
     */
    public static map(base: IUser): User {
        let result = new User(base.identification, base.firstName, base.lastName);

        result.mail = base.mail;
        result.image = UserResource.map(base.image);
        result.smallImage = UserResource.map(base.smallImage);
        result.lastLogin = base.lastLogin;
        result.validFrom = base.validFrom;
        result.validTo = base.validTo;
        result.isGlobalAdmin = (base as User).isGlobalAdmin != undefined && (base as User).isGlobalAdmin;

        return result;
    }

    /**
     * Checks whether an other object is equal to the actual one
     * @param other the other object
     * @returns true if the object eqauls the actual one (It has to be an instance of User). Otherwise false
     */
    public equals(other: any): boolean {
        if (other == undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        if (!(other instanceof User)) {
            return false;
        }

        return this.identification == other.identification
            && this.firstName == other.firstName
            && this.lastName == other.lastName
            && this.mail == other.mail
            && this.isGlobalAdmin == other.isGlobalAdmin
            && this.lastLogin?.getTime() == other.lastLogin?.getTime()
            && this.validFrom?.getTime() == other.validFrom?.getTime()
            && this.validTo?.getTime() == other.validTo?.getTime()
            && ((this.image != undefined && this.image.equals(other.image)) || (this.image == undefined && other.image == undefined))
            && ((this.smallImage != undefined && this.smallImage.equals(other.smallImage)) || (this.smallImage == undefined && other.smallImage == undefined))
            && this.isGlobalAdmin == other.isGlobalAdmin;
    }

}