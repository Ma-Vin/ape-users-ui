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

    public static map(base: IUser): User {
        let result = new User(base.identification, base.firstName, base.lastName);

        result.mail = base.mail;
        result.image = base.image;
        result.smallImage = base.smallImage;
        result.lastLogin = base.lastLogin;
        result.validFrom = base.validFrom;
        result.validTo = base.validTo;

        return result;
    }

}