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

    constructor(identification: string, firstName: string, lastName: string) {
        this.identification = identification;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    identification: string;
    firstName: string;
    lastName: string;
    mail: string | undefined;
    image: UserResource | undefined;
    smallImage: UserResource | undefined;
    lastLogin: Date | undefined;
    validFrom: Date | undefined;
    validTo: Date | undefined;

}