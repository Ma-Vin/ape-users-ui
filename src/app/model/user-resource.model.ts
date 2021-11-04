export interface IUserResource {
    identification: string;
    data: string | ArrayBuffer | undefined;
}

export class UserResource implements IUserResource {

    constructor(identification: string) {
        this.identification = identification;
    }

    identification: string;
    data: string | ArrayBuffer | undefined;

    /**
     * Creates an new UserResource and maps the given values to the new one
     * @param base the structure which is to map to a UserResource
     * @returns the new created UserResource instance
     */
    public static map(base: IUserResource | undefined): UserResource | undefined {
        if (base == undefined) {
            return undefined;
        }
        let result = new UserResource(base.identification);
        result.data = base.data;
        return result;
    }

    /**
     * Checks whether an other object is equal to the actual one
     * @param other the other object
     * @returns true if the object eqauls the actual one (It has to be an instance of UserResource). Otherwise false
     */
    public equals(other: any): boolean {
        if (other == undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        if (!(other instanceof UserResource)) {
            return false;
        }

        return this.identification == other.identification
            && this.data == other.data;
    }

}