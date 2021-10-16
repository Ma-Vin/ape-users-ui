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

}