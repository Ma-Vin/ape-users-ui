import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Role } from '../../model/role.model';
import { Status } from '../../model/status.model';
import { IUser, User } from '../../model/user.model';
import { ALL_USERS_MOCK_KEY, BaseBackendService, NEXT_USER_ID_MOCK_KEY } from '../base/base-backend.service';
import { HTTP_JSON_OPTIONS, HTTP_URL_OPTIONS, RETRIES } from '../base/base.service';


export const INITIAL_USER_ID_AT_MOCK = 'UAA00002';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseBackendService {
  private getUserUrl: string | undefined;
  private getAllUsersUrl: string | undefined;
  private updateUserUrl: string | undefined;
  private createUserUrl: string | undefined;
  private deleteUserUrl: string | undefined;
  private countUsersUrl: string | undefined;
  private setUserPasswordUrl: string | undefined;
  private setUserRoleUrl: string | undefined;

  constructor(private http: HttpClient, configService: ConfigService) {
    super('UserService', configService);
  }

  protected initServiceUrls(): boolean {
    if (this.config == undefined) {
      return false;
    }

    let userControllerUrl = this.config.backendBaseUrl.concat('/user');

    this.getUserUrl = userControllerUrl.concat('/getUser');
    this.getAllUsersUrl = userControllerUrl.concat('/getAllUsers');
    this.updateUserUrl = userControllerUrl.concat('/updateUser');
    this.createUserUrl = userControllerUrl.concat('/createUser');
    this.deleteUserUrl = userControllerUrl.concat('/deleteUser');
    this.countUsersUrl = userControllerUrl.concat('/countUsers');
    this.setUserPasswordUrl = userControllerUrl.concat('/setUserPassword');
    this.setUserRoleUrl = userControllerUrl.concat('/setUserRole');

    return true;
  }

  protected initServiceMocks(): void {
    (BaseBackendService.mockData.get(ALL_USERS_MOCK_KEY) as User[]).push(User.map({
      identification: INITIAL_USER_ID_AT_MOCK,
      firstName: 'Lower',
      lastName: 'Power',
      mail: 'lower.power@ma-vin.de',
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: false,
      role: Role.ADMIN
    } as User));
  }

  /**
   * Determines all non admins at mock data
   * @returns array of all admins
   */
  private getAllNonAdminsFromMock(): User[] {
    let result: User[] = [];
    for (let u of this.getAllUsersFromMock()) {
      if (!u.isGlobalAdmin) {
        result.push(u);
      }
    }
    return result;
  }

  /**
   * Determines all users (including admins) at mock data
   * @returns array of all users
   */
  private getAllUsersFromMock(): User[] {
    this.initMocks();
    return (BaseBackendService.mockData.get(ALL_USERS_MOCK_KEY) as User[]);
  }

  /**
 * Get an user from the backend
 * @param identification id of the admin
 * @returns the user
 */
  public getUser(identification: string): Observable<User> {
    this.init();
    if (this.useMock) {
      return this.getUserMock(identification);
    }
    let url = `${this.getUserUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let user = this.checkErrorAndGetResponse<IUser>(data, `occurs while getting user ${identification} from backend`);
        let result = User.map(user);
        result.isGlobalAdmin = true;
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Creates mock for getting an user
   * @param identification id of the user
   * @returns the mocked observable of the user
   */
  private getUserMock(identification: string): Observable<User> {
    for (let a of this.getAllNonAdminsFromMock()) {
      if (a.identification == identification) {
        return of(User.map(a));
      }
    }
    return throwError(new Error(`There is not any User with identification "${identification}"`));
  }


  /**
   * Get all users at a common group from the backend
   * @param commonGroupIdentification id of the common group
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the users
   */
  public getAllUsers(commonGroupIdentification: string, page: number | undefined, size: number | undefined): Observable<User[]> {
    this.init();
    if (this.useMock) {
      return this.getAllUsersMock();
    }
    let url = `${this.getAllUsersUrl}/${commonGroupIdentification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: page == undefined || size == undefined ? undefined : {
        page: `${page}`,
        size: `${size}`
      }
    }).pipe(
      map(data => {
        let users = this.checkErrorAndGetResponse<IUser[]>(data, `occurs while getting all users at ${commonGroupIdentification} from backend`);
        let result: User[] = new Array(users.length);
        for (let i = 0; i < users.length; i++) {
          result[i] = User.map(users[i]);
        }
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * Creates mock for getting all users
   * @returns the mocked observable of all users
   */
  private getAllUsersMock(): Observable<User[]> {
    return of(this.getAllNonAdminsFromMock());
  }


  /**
   * Updates an user in the backend
   * @param modifiedGroup the modefied user to put in the backend
   * @returns the stored user
   */
  public updateUser(modifiedUser: User): Observable<User> {
    this.init();
    if (this.useMock) {
      return this.updateUserMock(modifiedUser);
    }
    let url = `${this.updateUserUrl}/${modifiedUser.identification}`;

    return this.http.put<ResponseWrapper>(url, modifiedUser as IUser, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        let user = this.checkErrorAndGetResponse<IUser>(data, `occurs while updating user ${modifiedUser.identification} at backend`);
        return User.map(user);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Creates mock for updating an user
   * @param modifiedUser the modified user
   * @returns the mocked observable of the user
   */
  private updateUserMock(modifiedUser: User): Observable<User> {
    let users = this.getAllUsersFromMock();
    for (let i = 0; i < users.length; i++) {
      if (users[i].identification == modifiedUser.identification) {
        let existingRole = users[i].role;
        users[i] = User.map(modifiedUser);
        users[i].role = existingRole;
        let result = User.map(modifiedUser);
        result.role = existingRole;
        return of(result);
      }
    }
    return throwError(new Error(`${Status.ERROR} occurs while updating user ${modifiedUser.identification} at backend`));
  }


  /**
   * Creates an user at a given common group
   * @param commonGroupIdentification id of the group where to create user at
   * @param firstName the first name of then user
   * @param lastName the last name of the user
   * @returns the new created user
   */
  createUser(commonGroupIdentification: string, firstName: string, lastName: string): Observable<User> {
    this.init();
    if (this.useMock) {
      return this.createUserMock(firstName, lastName);
    }

    let url = `${this.createUserUrl}`;
    let body = `firstName=${firstName}&lastName=${lastName}&commonGroupIdentification=${commonGroupIdentification}`;

    return this.http.post<ResponseWrapper>(url, body, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let user = this.checkErrorAndGetResponse<IUser>(data, `occurs while creating common at group ${commonGroupIdentification} from backend`);
        let result = User.map(user);
        result.isGlobalAdmin = false;
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * creates an new user at mock
   * @param firstName first name of the new user
   * @param lastName last name of the new user
   * @returns the mocked observable of the new user
   */
  private createUserMock(firstName: string, lastName: string): Observable<User> {
    let idBase = 'UAA';

    this.initMocks();
    let nextUserIdMock = BaseBackendService.mockData.get(NEXT_USER_ID_MOCK_KEY);

    let idExtend = `${nextUserIdMock}`;
    while (idExtend.length < 5) {
      idExtend = '0'.concat(idExtend);
    }
    BaseBackendService.mockData.set(NEXT_USER_ID_MOCK_KEY, nextUserIdMock + 1);

    let addedUser: User = User.map(
      {
        identification: idBase.concat(idExtend),
        firstName: firstName,
        lastName: lastName,
        mail: undefined,
        image: undefined,
        smallImage: undefined,
        lastLogin: undefined,
        validFrom: new Date(),
        validTo: undefined,
        isGlobalAdmin: false,
        role: Role.NOT_RELEVANT
      } as IUser);

    this.getAllUsersFromMock().push(addedUser);

    return of(addedUser);
  }


  /**
   * Deletes an user in the backend
   * @param identification id of the user to delete
   * @returns true if the user was deleted. Otherwise false
   */
  deleteUser(identification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.deleteUserMock(identification);
    }
    let url = `${this.deleteUserUrl}/${identification}`;

    return this.http.delete<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while deleting user ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * deletes an user at mock
   * @param identification id of the user to delete
   * @returns the mocked observable of succesfull deletion
   */
  private deleteUserMock(identification: string): Observable<boolean> {
    let users = this.getAllUsersFromMock();
    for (let i = 0; i < users.length; i++) {
      if (users[i].identification == identification) {
        users.splice(i, 1);
        return of(true);
      }
    }
    return of(false);
  }


  /**
   * Counts the users at a common group in the backend
   * @param identification id of group where to count at
   * @returns the number of users
   */
  countUsers(identification: string): Observable<number> {
    this.init();
    if (this.useMock) {
      return this.countUsersMock();
    }
    let url = `${this.countUsersUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<number>(data, `occurs while counting users at group ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * Counts users at mock
   * @returns the number of users at mock
   */
  private countUsersMock(): Observable<number> {
    return of(this.getAllNonAdminsFromMock().length);
  }


  /**
   * sets a password of an user in the backend
   * @param identification id of the user
   * @param password password to set
   * @returns true if the password was updated. Otherwise false
   */
  setPassword(identification: string, password: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.setPasswordMock(identification);
    }
    let url = `${this.setUserPasswordUrl}/${identification}`;

    return this.http.patch<ResponseWrapper>(url, {
      rawPassword: password
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while setting password of user ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * sets a password of an user at mock
   * @param identification id of the user
   * @returns mocked reponse of updating password
   */
  private setPasswordMock(identification: string): Observable<boolean> {
    for (let a of this.getAllNonAdminsFromMock()) {
      if (a.identification == identification) {
        return of(true);
      }
    }
    return throwError(new Error(`${Status.ERROR} occurs while setting password of user ${identification} at backend`));
  }


  /**
   * sets a role of an user in the backend
   * @param identification id of the user
   * @param role role to set
   * @returns true if the role was updated. Otherwise false
   */
  setRole(identification: string, role: Role): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.setUserRoleMock(identification, role);
    }
    let url = `${this.setUserRoleUrl}/${identification}`;

    return this.http.patch<ResponseWrapper>(url, {
      role: role
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while setting role of user ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * sets a role of an user at the mock
   * @param identification id of the user
   * @param role role to set
   * @returns true if the role was updated. Otherwise false
   */
  setUserRoleMock(identification: string, role: Role): Observable<boolean> {
    for (let u of this.getAllNonAdminsFromMock()) {
      if (u.identification == identification) {
        let changed = u.role != role;
        u.role = role;
        return of(changed);
      }
    }
    return throwError(new Error(`${Status.ERROR} occurs while setting role of user ${identification} at backend`));
  }
}
