import { IEqualsAndIdentifiable } from "./equals-identifiable";
import { Role } from "./role.model";
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
    role: Role | undefined;
    /**
     * Indicator whether this instance is loaded completly from backend or loaded in parts
     */
    isComplente: boolean;
}

export class User implements IUser, IEqualsAndIdentifiable {

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
    role: Role | undefined;
    isComplente = true;

    constructor(identification: string, firstName: string, lastName: string) {
        this.identification = identification;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    /**
     * Creates an new User and maps the given values to the new one
     * @param user the structure which is to map to a User
     * @returns the new created User instance
     */
    public static map(user: IUser): User {
        let result = new User(user.identification, user.firstName, user.lastName);

        result.mail = user.mail;
        result.image = UserResource.map(user.image);
        result.smallImage = UserResource.map(user.smallImage);
        result.lastLogin = user.lastLogin;
        result.validFrom = user.validFrom;
        result.validTo = user.validTo;
        result.isGlobalAdmin = (user as User).isGlobalAdmin != undefined && (user as User).isGlobalAdmin;
        result.role = user.role;
        result.isComplente = user.isComplente;

        return result;
    }


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
            && this.isGlobalAdmin == other.isGlobalAdmin
            && this.role == other.role
            && this.isComplente == other.isComplente;
    }


    getIdentification(): string {
        return this.identification;
    }

}