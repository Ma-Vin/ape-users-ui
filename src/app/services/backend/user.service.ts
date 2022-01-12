import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { UserIdRole } from '../../model/user-id-role.model';
import { ConfigService } from '../../config/config.service';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Role } from '../../model/role.model';
import { Status } from '../../model/status.model';
import { IUser, User } from '../../model/user.model';
import { ALL_USERS_MOCK_KEY, BaseBackendService, NEXT_USER_ID_MOCK_KEY, HTTP_JSON_OPTIONS, HTTP_URL_OPTIONS, RETRIES } from '../base/base-backend.service';
import { SelectionService } from '../util/selection.service';
import { BaseGroupService, INITIAL_BASE_GROUP_ID_AT_MOCK, BASES_AT_COMMON_GROUP } from './base-group.service';
import { INITIAL_COMMON_GROUP_ID_AT_MOCK } from './common-group.service';
import { INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK, PrivilegeGroupService, PRIVILEGES_AT_COMMON_GROUP } from './privilege-group.service';


const USERS_AT_COMMON_GROUP = 'usersAtCommonGroup'
const USERS_AT_BASE_GROUP = 'usersAtBaseGroup'
const USERS_AT_PRIVILEGE_GROUP = 'usersAtPrivilegeGroup'
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
  private addUserToBaseGroupUrl: string | undefined;
  private removeUserFromBaseGroupUrl: string | undefined;
  private countUsersAtBaseGroupUrl: string | undefined;
  private getAllUsersFromBaseGroupUrl: string | undefined;
  private addUserToPrivilegeGroupUrl: string | undefined;
  private removeUserFromPrivilegeGroupUrl: string | undefined;
  private countUsersAtPrivilegeGroupUrl: string | undefined;
  private getAllUsersFromPrivilegeGroupUrl: string | undefined;

  constructor(private http: HttpClient, configService: ConfigService, private selectionService: SelectionService) {
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
    this.addUserToBaseGroupUrl = userControllerUrl.concat('/addUserToBaseGroup');
    this.removeUserFromBaseGroupUrl = userControllerUrl.concat('/removeUserFromBaseGroup');
    this.countUsersAtBaseGroupUrl = userControllerUrl.concat('/countUsersAtBaseGroup');
    this.getAllUsersFromBaseGroupUrl = userControllerUrl.concat('/getAllUsersFromBaseGroup');
    this.addUserToPrivilegeGroupUrl = userControllerUrl.concat('/addUserToPrivilegeGroup');
    this.removeUserFromPrivilegeGroupUrl = userControllerUrl.concat('/removeUserFromPrivilegeGroup');
    this.countUsersAtPrivilegeGroupUrl = userControllerUrl.concat('/countUsersAtPrivilegeGroup');
    this.getAllUsersFromPrivilegeGroupUrl = userControllerUrl.concat('/getAllUsersFromPrivilegeGroup');

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

    BaseBackendService.addEntryToStringToStringArrayMap(USERS_AT_COMMON_GROUP, INITIAL_COMMON_GROUP_ID_AT_MOCK, INITIAL_USER_ID_AT_MOCK);
    BaseBackendService.addEntryToStringToStringArrayMap(USERS_AT_BASE_GROUP, INITIAL_BASE_GROUP_ID_AT_MOCK, INITIAL_USER_ID_AT_MOCK);
    BaseBackendService.addEntryToStringToStringArrayMap(BASES_AT_COMMON_GROUP, INITIAL_COMMON_GROUP_ID_AT_MOCK, INITIAL_BASE_GROUP_ID_AT_MOCK);
    BaseBackendService.addEntryToStringToStringArrayMap(PRIVILEGES_AT_COMMON_GROUP, INITIAL_COMMON_GROUP_ID_AT_MOCK, INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK);

    if (!BaseBackendService.mockData.has(USERS_AT_PRIVILEGE_GROUP)) {
      BaseBackendService.mockData.set(USERS_AT_PRIVILEGE_GROUP, new Map<string, UserIdRole[]>());
    }
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
   * Determines the string array which contains the ids of users contained by a given common group
   * @param commonGroupIdentification the id of the common group whose base groups are searched for 
   * @returns the array of the user ids
   */
  public static getUserIdsFromMock(commonGroupIdentification: string): string[] {
    return BaseBackendService.getIdsFromMock(commonGroupIdentification, USERS_AT_COMMON_GROUP);
  }

  /**
   * Determines the string array which contains the ids of users contained by a given common group
   * @param baseGroupIdentification the id of the base group whose base groups are searched for 
   * @returns the array of the user ids
   */
  public static getUserIdsAtBaseGroupFromMock(baseGroupIdentification: string): string[] {
    return BaseBackendService.getIdsFromMock(baseGroupIdentification, USERS_AT_BASE_GROUP);
  }

  /**
   * Determines all base groups ids at mock data for the selected common group
   * @returns array of all base group ids at commongroup
   */
  private getAllBaseIdsAtSelectedCommonGroupFromMock(): string[] {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return [];
    }

    this.initMocks();

    return BaseGroupService.getBaseGroupIdsFromMock(commonGroup.identification);
  }


  /**
   * Determines all privilege groups ids at mock data for the selected common group
   * @returns array of all privilege group ids at commongroup
   */
  private getAllPrivilegeIdsAtSelectedCommonGroupFromMock(): string[] {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return [];
    }

    this.initMocks();

    return PrivilegeGroupService.getPrivilegeGroupIdsFromMock(commonGroup.identification);
  }


  /**
   * Determines all user ids at mock data for the selected common group
   * @returns array of all privilege group ids at commongroup
   */
  private getAllUserIdsAtSelectedCommonGroupFromMock(): string[] {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return [];
    }

    this.initMocks();

    return UserService.getUserIdsFromMock(commonGroup.identification);
  }

  /**
   * Determines all users at mock data for the selected common group
   * @returns array of all users at commongroup
   */
  private getAllUsersAtSelectedCommonGroupFromMock(): User[] {
    let result: User[] = [];
    let relevantUserIds = this.getAllUserIdsAtSelectedCommonGroupFromMock();

    for (let u of this.getAllUsersFromMock()) {
      if (relevantUserIds?.includes(u.identification)) {
        result.push(u);
      }
    }
    return result;
  }


  /**
   * Determines the string array which contains the ids of user contained by a given other privilege group
   * @param baseGroupIdentification the id of the privilege group whose users are searched for 
   * @returns the array of the user ids and their roles
   */
  private getUserIdRolesAtPrivilegeFromMock(privilegeGroupIdentification: string): UserIdRole[] {
    let result = (BaseBackendService.mockData.get(USERS_AT_PRIVILEGE_GROUP) as Map<string, UserIdRole[]>).get(privilegeGroupIdentification);
    if (result == undefined) {
      result = [];
      (BaseBackendService.mockData.get(USERS_AT_PRIVILEGE_GROUP) as Map<string, UserIdRole[]>).set(privilegeGroupIdentification, result);
    }
    return result;
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
        result.isGlobalAdmin = false;
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
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(new Error(`${Status.ERROR} occurs while getting user ${identification} from backend`));
    }

    this.initMocks();

    if (UserService.getUserIdsFromMock(commonGroup.identification).includes(identification)) {
      for (let a of this.getAllNonAdminsFromMock()) {
        if (a.identification == identification) {
          return of(User.map(a));
        }
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
      params: this.createPageingParams(page, size)
    }).pipe(
      map(data => {
        let users = this.checkErrorAndGetResponse<IUser[]>(data, `occurs while getting all users at ${commonGroupIdentification} from backend`);
        let result: User[] = new Array(users.length);
        for (let i = 0; i < users.length; i++) {
          result[i] = User.map(users[i]);
          result[i].isGlobalAdmin = false;
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
    let copy: User[] = [];
    for (let u of this.getAllUsersAtSelectedCommonGroupFromMock()) {
      copy.push(u)
    }
    return of(copy);
  }


  /**
   * Updates an user in the backend
   * @param modifiedUser the modefied user to put in the backend
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
        let result = User.map(user);
        result.isGlobalAdmin = false;
        return result;
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
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    this.initMocks();

    if (commonGroup == undefined || !UserService.getUserIdsFromMock(commonGroup.identification).includes(modifiedUser.identification)) {
      return throwError(new Error(`${Status.ERROR} occurs while updating user ${modifiedUser.identification} at backend`));
    }


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
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(new Error(`${Status.ERROR} occurs while creating user at backend`));
    }
    this.initMocks();
    let idBase = 'UAA';
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
    this.getAllUserIdsAtSelectedCommonGroupFromMock().push(addedUser.identification);

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
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(new Error(`${Status.ERROR} occurs while deleting user ${identification} at backend`));
    }

    this.initMocks();

    let userIds = UserService.getUserIdsFromMock(commonGroup.identification);
    if (!userIds.includes(identification)) {
      return of(false);
    }
    userIds.splice(userIds.indexOf(identification), 1);

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
    return of(this.getAllUserIdsAtSelectedCommonGroupFromMock().length);
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
    if (this.getAllUserIdsAtSelectedCommonGroupFromMock().includes(identification)) {
      return of(true);
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
    if (this.getAllUserIdsAtSelectedCommonGroupFromMock().includes(identification)) {
      for (let u of this.getAllNonAdminsFromMock()) {
        if (u.identification == identification) {
          let changed = u.role != role;
          u.role = role;
          return of(changed);
        }
      }
    }
    return throwError(new Error(`${Status.ERROR} occurs while setting role of user ${identification} at backend`));
  }



  /**
   * Adds an user to a base group
   * @param userIdentification id of the user to add
   * @param baseGroupIdentification id of base group where to add at
   * @returns reponse of adding the user
   */
  public addUserToBaseGroup(userIdentification: string, baseGroupIdentification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.addUserToBaseGroupMock(userIdentification, baseGroupIdentification);
    }
    let url = `${this.addUserToBaseGroupUrl}/${baseGroupIdentification}`;

    return this.http.patch<ResponseWrapper>(url, {
      userIdentification: userIdentification
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while adding user ${userIdentification} to base group ${baseGroupIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Adds an user to a base group at mock
   * @param userIdentification id of the user to add
   * @param baseGroupIdentification id of base group where to add at
   * @returns mocked reponse of adding the user
   */
  public addUserToBaseGroupMock(userIdentification: string, baseGroupIdentification: string): Observable<boolean> {
    this.initMocks();

    let allUserIds = this.getAllUserIdsAtSelectedCommonGroupFromMock();
    let allBaseGroupIds = this.getAllBaseIdsAtSelectedCommonGroupFromMock();
    if (!allUserIds.includes(userIdentification) || !allBaseGroupIds.includes(baseGroupIdentification)) {
      return throwError(new Error(`${Status.ERROR} occurs while adding user ${userIdentification} to base group ${baseGroupIdentification} at backend`));
    }

    let usersAtBaseGroup = UserService.getUserIdsAtBaseGroupFromMock(baseGroupIdentification);
    if (usersAtBaseGroup.includes(userIdentification)) {
      return of(false);
    }

    usersAtBaseGroup.push(userIdentification);
    return of(true);
  }



  /**
   * Removes an user from a base group
   * @param userIdentification id of the child user to remove
   * @param baseGroupIdentification id of the parent base group where to remove from
   * @returns true if the user was removed. Otherwise false
   */
  removeUserFromBaseGroup(userIdentification: string, baseGroupIdentification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.removeUserFromBaseGroupMock(userIdentification, baseGroupIdentification);
    }
    let url = `${this.removeUserFromBaseGroupUrl}/${baseGroupIdentification}`;

    return this.http.patch<ResponseWrapper>(url, {
      userIdentification: userIdentification
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while removing user ${userIdentification} from base group ${baseGroupIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Removes an user from a base group at mock
   * @param userIdentification id of the child user to remove
   * @param baseGroupIdentification id of the parent base group where to remove fromt
   * @returns mocked reponse of removing the user
   */
  private removeUserFromBaseGroupMock(userIdentification: string, baseGroupIdentification: string): Observable<boolean> {
    this.initMocks();

    let allUserIds = this.getAllUserIdsAtSelectedCommonGroupFromMock();
    let allBaseGroupIds = this.getAllBaseIdsAtSelectedCommonGroupFromMock();
    if (!allUserIds.includes(userIdentification) || !allBaseGroupIds.includes(baseGroupIdentification)) {
      return throwError(new Error(`${Status.ERROR} occurs while removing user ${userIdentification} from base group ${baseGroupIdentification} at backend`));
    }

    let usersAtBaseGroup = UserService.getUserIdsAtBaseGroupFromMock(baseGroupIdentification);
    if (!usersAtBaseGroup.includes(userIdentification)) {
      return of(false);
    }

    usersAtBaseGroup.splice(usersAtBaseGroup.indexOf(userIdentification), 1);
    return of(true);
  }



  /**
   * Count users of a base group at the backend
   * @param baseGroupIdentification the id of the base group where to count at
   * @returns the number of users at the base group
   */
  public countUsersAtBaseGroup(baseGroupIdentification: string): Observable<number> {
    this.init();
    if (this.useMock) {
      return this.countUsersAtBaseGroupMock(baseGroupIdentification);
    }
    let url = `${this.countUsersAtBaseGroupUrl}/${baseGroupIdentification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<number>(data, `occurs while counting users at ${baseGroupIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for counting users of a base group
   * @param baseGroupIdentification the id of the base group where to count at
   * @returns the mocked observable of the counted number
   */
  private countUsersAtBaseGroupMock(baseGroupIdentification: string): Observable<number> {
    this.initMocks();
    return of(UserService.getUserIdsAtBaseGroupFromMock(baseGroupIdentification).length);
  }




  /**
   * Get all users of a base group from the backend
   * @param baseGroupIdentification Id of the parent base group
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the users
   */
  public getAllUsersFromBaseGroup(baseGroupIdentification: string, page: number | undefined, size: number | undefined): Observable<User[]> {
    this.init();
    if (this.useMock) {
      return this.getAllUsersFromBaseGroupMock(baseGroupIdentification);
    }
    let url = `${this.getAllUsersFromBaseGroupUrl}/${baseGroupIdentification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: this.createPageingParams(page, size)
    }).pipe(
      map(data => {
        let users = this.checkErrorAndGetResponse<IUser[]>(data, `occurs while getting all users of ${baseGroupIdentification} from backend`);
        let result: User[] = new Array(users.length);
        for (let i = 0; i < users.length; i++) {
          result[i] = User.map(users[i]);
          result[i].isGlobalAdmin = false;
        }
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for getting all users of a base group
   * @param baseGroupIdentification Id of the parent base group
   * @returns the mocked observable of all users
   */
  private getAllUsersFromBaseGroupMock(baseGroupIdentification: string): Observable<User[]> {
    this.initMocks();
    let result: User[] = [];
    let userIds = UserService.getUserIdsAtBaseGroupFromMock(baseGroupIdentification);
    for (let u of this.getAllUsersAtSelectedCommonGroupFromMock()) {
      if (userIds.includes(u.identification)) {
        result.push(u)
      }
    }
    return of(result);
  }



  /**
   * Adds an user to a privilege group
   * @param userIdentification id of the user to add
   * @param privilegeGroupIdentification id of privilege group where to add at
   * @param role The role of the user at the group
   * @returns reponse of adding the user
   */
  public addUserToPrivilegeGroup(userIdentification: string, privilegeGroupIdentification: string, role: Role): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.addUserToPrivilegeGroupMock(userIdentification, privilegeGroupIdentification, role);
    }
    let url = `${this.addUserToPrivilegeGroupUrl}/${privilegeGroupIdentification}`;
    let userIdRole = new UserIdRole(userIdentification, role);
    return this.http.patch<ResponseWrapper>(url, {
      userRole: userIdRole
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while adding user ${userIdentification} to privilege group ${privilegeGroupIdentification} with role ${role} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Adds an user to a privilege group at mock
   * @param userIdentification id of the user to add
   * @param privilegeGroupIdentification id of privilege group where to add at
   * @param role The role of the user at the group
   * @returns mocked reponse of adding the user
   */
  public addUserToPrivilegeGroupMock(userIdentification: string, privilegeGroupIdentification: string, role: Role): Observable<boolean> {
    this.initMocks();

    let allUserIds = this.getAllUserIdsAtSelectedCommonGroupFromMock();
    let allPrivilegeGroupIds = this.getAllPrivilegeIdsAtSelectedCommonGroupFromMock();

    if (!allUserIds.includes(userIdentification) || !allPrivilegeGroupIds.includes(privilegeGroupIdentification)) {
      return throwError(new Error(`${Status.ERROR} occurs while adding user ${userIdentification} to privilege group ${privilegeGroupIdentification} with role ${role} at backend`));
    }

    let userRoles = this.getUserIdRolesAtPrivilegeFromMock(privilegeGroupIdentification);
    for (let ur of userRoles) {
      if (ur.userIdentification == userIdentification) {
        return of(false);
      }
    }

    let userIdRole = new UserIdRole(userIdentification, role);
    userRoles.push(userIdRole);
    return of(true);
  }



  /**
   * Removes an user from a privilege one
   * @param userIdentification id of the child user to remove
   * @param privilegeGroupIdentification id of the parent privilege group where to remove from
   * @returns true if the user was removed. Otherwise false
   */
  removeUserFromPrivilegeGroup(userIdentification: string, privilegeGroupIdentification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.removeUserFromPrivilegeGroupMock(userIdentification, privilegeGroupIdentification);
    }
    let url = `${this.removeUserFromPrivilegeGroupUrl}/${privilegeGroupIdentification}`;

    return this.http.patch<ResponseWrapper>(url, {
      userIdentification: userIdentification
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while removing user ${userIdentification} from privilege group ${privilegeGroupIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Removes an user from a privilege one at mock
   * @param userIdentification id of the child user to remove
   * @param privilegeGroupIdentification id of the parent privilege group where to remove from
   * @returns mocked reponse of removing the user
   */
  private removeUserFromPrivilegeGroupMock(userIdentification: string, privilegeGroupIdentification: string): Observable<boolean> {
    this.initMocks();

    let allUserIds = this.getAllUserIdsAtSelectedCommonGroupFromMock();
    let allPrivilegeGroupIds = this.getAllPrivilegeIdsAtSelectedCommonGroupFromMock();

    if (!allUserIds.includes(userIdentification) || !allPrivilegeGroupIds.includes(privilegeGroupIdentification)) {
      return throwError(new Error(`${Status.ERROR} occurs while removing user ${userIdentification} from privilege group ${privilegeGroupIdentification} at backend`));
    }

    let usersAtPrivilegeGroup = this.getUserIdRolesAtPrivilegeFromMock(privilegeGroupIdentification);
    for (let i = 0; i < usersAtPrivilegeGroup.length; i++) {
      if (usersAtPrivilegeGroup[i].userIdentification == userIdentification) {
        usersAtPrivilegeGroup.splice(i, 1);
        return of(true);
      }
    }

    return of(false);
  }



  /**
    * Count users at a privilege group at the backend
    * @param privilegeGroupIdentification the id of the privilege group where to count at
    * @param role the role which filter the users to be count. If undefined all will be count.
    * @returns the number users at the privilege group
    */
  public countUsersAtPrivilegeGroup(privilegeGroupIdentification: string, role: Role | undefined): Observable<number> {
    this.init();
    if (this.useMock) {
      return this.countUsersAtPrivilegeGroupMock(privilegeGroupIdentification, role);
    }
    let url = `${this.countUsersAtPrivilegeGroupUrl}/${privilegeGroupIdentification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: this.createPageingRoleParams(role, undefined, undefined)
    }).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<number>(data, `occurs while counting users at ${privilegeGroupIdentification} with role ${role} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for counting users at a privilege group at mock
   * @param baseGroupIdentification the id of the base group where to count at
   * @param role the role which filter the users to be count. If undefined all will becount.
   * @returns the mocked observable of the counted number
   */
  private countUsersAtPrivilegeGroupMock(privilegeGroupIdentification: string, role: Role | undefined): Observable<number> {
    this.initMocks();
    let userRoles = this.getUserIdRolesAtPrivilegeFromMock(privilegeGroupIdentification);
    if (role == undefined) {
      return of(userRoles.length);
    }
    let count = 0;
    for (let ur of userRoles) {
      if (ur.role == role) {
        count++;
      }
    }
    return of(count);
  }



  /**
   * Get all users at a privilege group from the backend
   * @param privilegeGroupIdentification Id of the parent privilege group
   * @param dissolveSubgroups indicator if the users of subgroups should also be added 
   * @param role the role which filter the users. If undefined all will be determined
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the users
   */
  public getAllBasesAtPrivilegeGroup(privilegeGroupIdentification: string, dissolveSubgroups: boolean | undefined, role: Role | undefined
    , page: number | undefined, size: number | undefined): Observable<User[]> {

    this.init();
    if (this.useMock) {
      return this.getAllBasesAtrivilegeGroupMock(privilegeGroupIdentification, dissolveSubgroups, role);
    }
    let url = `${this.getAllUsersFromPrivilegeGroupUrl}/${privilegeGroupIdentification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: this.createParams(dissolveSubgroups, role, page, size)
    }).pipe(
      map(data => {
        let baseGroups = this.checkErrorAndGetResponse<IUser[]>(data, `occurs while getting all users of ${privilegeGroupIdentification} with role ${role} from backend`);
        let result: User[] = new Array(baseGroups.length);
        for (let i = 0; i < baseGroups.length; i++) {
          result[i] = User.map(baseGroups[i]);
        }
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for getting all sub base groups of a privilege one
   * @param privilegeGroupIdentification Id of the parent base group
   * @param dissolveSubgroups indicator if the users of subgroups should also be added
   * @param role the role which filter the base groups. If undefined all will be determined
   * @returns the mocked observable of all sub base groups
   */
  private getAllBasesAtrivilegeGroupMock(privilegeGroupIdentification: string, dissolveSubgroups: boolean | undefined, role: Role | undefined): Observable<User[]> {
    this.initMocks();
    let result: User[] = [];
    let users = this.getAllUsersAtSelectedCommonGroupFromMock();

    for (let ur of this.getUserIdRolesAtPrivilegeFromMock(privilegeGroupIdentification)) {
      if (role != undefined && ur.role != role) {
        continue;
      }
      for (let u of users) {
        if (u.identification == ur.userIdentification) {
          result.push(u);
          break;
        }
      }
    }

    if (dissolveSubgroups) {
      for (let br of BaseGroupService.getBaseGroupIdRolesAtPrivilegeFromMock(privilegeGroupIdentification)) {
        if (role != undefined && br.role != role) {
          continue;
        }
        for (let userId of this.getDisolvedUsersAtBaseGroup(br.baseGroupIdentification)) {
          for (let u of users) {
            if (u.identification == userId && !result.includes(u)) {
              result.push(u);
              break;
            }
          }
        }
      }
    }

    return of(result);
  }



  /**
   * Collects all user ids from a base group and its sub groups
   * @param baseGroupIdentification id of the base group
   * @returns list of of user ids
   */
  private getDisolvedUsersAtBaseGroup(baseGroupIdentification: string): string[] {
    let result: string[] = [];

    UserService.getUserIdsAtBaseGroupFromMock(baseGroupIdentification).forEach(userId => { result.push(userId); });

    BaseGroupService.getSubBaseGroupIdsFromMock(baseGroupIdentification).forEach(baseId => {
      this.getDisolvedUsersAtBaseGroup(baseId).forEach(userId => { result.push(userId); });
    });

    return result;
  }



  /**
   * creates the pageing params with role
   * @param role role to add at params
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0. 
   * @returns the params
   */
  protected createParams(dissolveSubgroups: boolean | undefined, role: Role | undefined, page: number | undefined, size: number | undefined): HttpParams | {
    [param: string]: string | number | boolean | readonly (string | number | boolean)[];
  } | undefined {
    if (dissolveSubgroups == undefined) {
      return this.createPageingRoleParams(role, page, size);
    }
    if ((page == undefined || size == undefined) && role == undefined) {
      return { dissolveSubgroups: `${dissolveSubgroups}` };
    }
    if ((page == undefined || size == undefined) && role != undefined) {
      return {
        role: `${role}`,
        dissolveSubgroups: `${dissolveSubgroups}`
      };
    }
    if ((page != undefined && size != undefined) && role == undefined) {
      return {
        page: `${page}`,
        size: `${size}`,
        dissolveSubgroups: `${dissolveSubgroups}`
      };
    }
    return {
      page: `${page}`,
      size: `${size}`,
      role: `${role}`,
      dissolveSubgroups: `${dissolveSubgroups}`
    };
  }
}
