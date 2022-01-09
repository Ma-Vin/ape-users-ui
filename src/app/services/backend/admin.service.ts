import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { ConfigService } from '../../config/config.service';
import { AdminGroup, IAdminGroup } from '../../model/admin-group.model';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Status } from '../../model/status.model';
import { IUser, User } from '../../model/user.model';
import { ALL_USERS_MOCK_KEY, BaseBackendService, NEXT_USER_ID_MOCK_KEY } from '../base/base-backend.service';
import { HTTP_JSON_OPTIONS, HTTP_URL_OPTIONS, RETRIES } from '../base/base.service';


/**
 * Service to call all operations of the admin controller at backend
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService extends BaseBackendService {
  private getAdminGroupUrl: string | undefined;
  private updateAdminGroupUrl: string | undefined;
  private createAdminUrl: string | undefined;
  private deleteAdminUrl: string | undefined;
  private getAdminUrl: string | undefined;
  private countAdminUrl: string | undefined;
  private getAllAdminsUrl: string | undefined;
  private updateAdminUrl: string | undefined;
  private setAdminPasswordUrl: string | undefined;

  private adminGroupMock = AdminGroup.map({
    description: 'Group of admins',
    groupName: 'admingroup',
    identification: 'AGAA00001',
    validFrom: new Date(2021, 0, 1, 12, 0),
    validTo: undefined
  } as IAdminGroup);


  constructor(private http: HttpClient, configService: ConfigService) {
    super('AdminService', configService);
  }


  protected initServiceUrls(): boolean {
    if (this.config == undefined) {
      return false;
    }

    let adminControllerUrl = this.config.backendBaseUrl.concat('/admin');

    this.getAdminGroupUrl = adminControllerUrl.concat('/getAdminGroup');
    this.updateAdminGroupUrl = adminControllerUrl.concat('/updateAdminGroup');
    this.createAdminUrl = adminControllerUrl.concat('/createAdmin');
    this.deleteAdminUrl = adminControllerUrl.concat('/deleteAdmin');
    this.getAdminUrl = adminControllerUrl.concat('/getAdmin');
    this.countAdminUrl = adminControllerUrl.concat('/countAdmins');
    this.getAllAdminsUrl = adminControllerUrl.concat('/getAllAdmins');
    this.updateAdminUrl = adminControllerUrl.concat('/updateAdmin');
    this.setAdminPasswordUrl = adminControllerUrl.concat('/setAdminPassword');
    return true;
  }

  protected initServiceMocks(): void {
    (BaseBackendService.mockData.get(ALL_USERS_MOCK_KEY) as User[]).push(User.map({
      identification: 'UAA00001',
      firstName: 'Max',
      lastName: 'Power',
      mail: 'max.power@ma-vin.de',
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: true
    } as User));
  }

  /**
   * Determines all admins at mock data
   * @returns array of all admins
   */
  private getAllAdminsFromMock(): User[] {
    let result: User[] = [];
    for (let u of this.getAllUsersFromMock()) {
      if (u.isGlobalAdmin) {
        result.push(u);
      }
    }
    return result;
  }

  /**
   * Determines all users at mock data
   * @returns array of all users
   */
  private getAllUsersFromMock(): User[] {
    this.initMocks();
    return (BaseBackendService.mockData.get(ALL_USERS_MOCK_KEY) as User[]);
  }


  /**
   * Get an admin group from the back end
   * @param identification id of the admin group
   * @returns the admin group
   */
  public getAdminGroup(identification: string): Observable<AdminGroup> {
    this.init();
    if (this.useMock) {
      return this.getAdminGroupMock(identification);
    }
    let url = `${this.getAdminGroupUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let adminGroup = this.checkErrorAndGetResponse<IAdminGroup>(data, `occurs while getting admin group ${identification} from backend`);
        return AdminGroup.map(adminGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * Creates mock for getting an admingroup
   * @param identification id of the admin group
   * @returns the mocked observable of the admingroup
   */
  private getAdminGroupMock(identification: string): Observable<AdminGroup> {
    if (this.adminGroupMock.identification == identification) {
      return of(this.adminGroupMock);
    }
    return throwError(new Error(`${Status.ERROR} occurs while getting admin group ${identification} from backend`));
  }


  /**
   * Get an admin from the backend
   * @param identification id of the admin
   * @returns the admin
   */
  public getAdmin(identification: string): Observable<User> {
    this.init();
    if (this.useMock) {
      return this.getAdminMock(identification);
    }
    let url = `${this.getAdminUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let admin = this.checkErrorAndGetResponse<IUser>(data, `occurs while getting admin ${identification} from backend`);
        let result = User.map(admin);
        result.isGlobalAdmin = true;
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Creates mock for getting an admin
   * @param identification id of the admin
   * @returns the mocked observable of the admin
   */
  private getAdminMock(identification: string): Observable<User> {
    for (let a of this.getAllAdminsFromMock()) {
      if (a.identification == identification) {
        return of(User.map(a));
      }
    }
    return throwError(new Error(`There is not any User with identification "${identification}"`));
  }


  /**
   * Get all admins at a group from the backend
   * @param identification id of the admin group
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the admins
   */
  public getAllAdmins(identification: string, page: number | undefined, size: number | undefined): Observable<User[]> {
    this.init();
    if (this.useMock) {
      return this.getAllAdminsMock();
    }
    let url = `${this.getAllAdminsUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: page == undefined || size == undefined ? undefined : {
        page: `${page}`,
        size: `${size}`
      }
    }).pipe(
      map(data => {
        let users = this.checkErrorAndGetResponse<IUser[]>(data, `occurs while getting all admins at ${identification} from backend`);
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
   * Creates mock for getting all admins
   * @returns the mocked observable of all admins
   */
  private getAllAdminsMock(): Observable<User[]> {
    return of(this.getAllAdminsFromMock());
  }


  /**
   * Updates an admingroup in the backend
   * @param modifiedGroup the modefied group to put in the backend
   * @returns the stored group
   */
  public updateAdminGroup(modifiedGroup: AdminGroup): Observable<AdminGroup> {
    this.init();
    if (this.useMock) {
      return this.updateAdminGroupMock(modifiedGroup);
    }
    let url = `${this.updateAdminGroupUrl}/${modifiedGroup.identification}`;

    return this.http.put<ResponseWrapper>(url, modifiedGroup as IAdminGroup, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let adminGroup = this.checkErrorAndGetResponse<IAdminGroup>(data, `occurs while updating admin group ${modifiedGroup.identification} at backend`);
        return AdminGroup.map(adminGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Creates mock for updating an admin group
   * @param modifiedAdmin the modified group
   * @returns the mocked observable of the admin group
   */
  private updateAdminGroupMock(modifiedGroup: AdminGroup): Observable<AdminGroup> {
    if (this.adminGroupMock.identification == modifiedGroup.identification) {
      this.adminGroupMock = modifiedGroup;
      return of(modifiedGroup);
    }

    return throwError(new Error(`${Status.ERROR} occurs while updating admin group ${modifiedGroup.identification} at backend`));
  }



  /**
   * Updates an admin in the backend
   * @param modifiedGroup the modefied user to put in the backend
   * @returns the stored user
   */
  public updateAdmin(modifiedAdmin: User): Observable<User> {
    this.init();
    if (this.useMock) {
      return this.updateAdminMock(modifiedAdmin);
    }
    let url = `${this.updateAdminUrl}/${modifiedAdmin.identification}`;

    return this.http.put<ResponseWrapper>(url, modifiedAdmin as IUser, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        let admin = this.checkErrorAndGetResponse<IUser>(data, `occurs while updating admin ${modifiedAdmin.identification} at backend`);
        return User.map(admin);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Creates mock for updating an admin
   * @param modifiedAdmin the modified user
   * @returns the mocked observable of the admin
   */
  private updateAdminMock(modifiedAdmin: User): Observable<User> {
    let users = this.getAllUsersFromMock();
    for (let i = 0; i < users.length; i++) {
      if (users[i].identification == modifiedAdmin.identification) {
        users[i] = User.map(modifiedAdmin);
        return of(User.map(modifiedAdmin));
      }
    }
    return throwError(new Error(`${Status.ERROR} occurs while updating admin ${modifiedAdmin.identification} at backend`));
  }


  /**
   * Creates an admin at the admingroup
   * @param adminGroupIdentification id of the group where to create user at
   * @param firstName the first name of then user
   * @param lastName the last name of the user
   * @returns the new created user
   */
  createAdmin(adminGroupIdentification: string, firstName: string, lastName: string): Observable<User> {
    this.init();
    if (this.useMock) {
      return this.createAdminMock(firstName, lastName);
    }

    let url = `${this.createAdminUrl}`;
    let body = `firstName=${firstName}&lastName=${lastName}&adminGroupIdentification=${adminGroupIdentification}`;

    return this.http.post<ResponseWrapper>(url, body, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let admin = this.checkErrorAndGetResponse<IUser>(data, `occurs while creating admin at group ${adminGroupIdentification} from backend`);
        let result = User.map(admin);
        result.isGlobalAdmin = true;
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * creates a new admin at mock
   * @param firstName first name of the new admin
   * @param lastName last name of the new admin
   * @returns the mocked observable of the new admin
   */
  private createAdminMock(firstName: string, lastName: string): Observable<User> {
    let idBase = 'UAA';

    this.initMocks();
    let nextUserIdMock = BaseBackendService.mockData.get(NEXT_USER_ID_MOCK_KEY);

    let idExtend = `${nextUserIdMock}`;
    while (idExtend.length < 5) {
      idExtend = '0'.concat(idExtend);
    }
    BaseBackendService.mockData.set(NEXT_USER_ID_MOCK_KEY, nextUserIdMock + 1);

    let addedAdmin: User = User.map(
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
        isGlobalAdmin: true,
        role: undefined
      } as IUser);

    this.getAllUsersFromMock().push(addedAdmin);

    return of(addedAdmin);
  }


  /**
   * Deletes an admin in the backend
   * @param identification id of the admin to delete
   * @returns true if the admin was deleted. Otherwise false
   */
  deleteAdmin(identification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.deleteAdminMock(identification);
    }
    let url = `${this.deleteAdminUrl}/${identification}`;

    return this.http.delete<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while deleting admin ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * deletes an admin at mock
   * @param identification id of the admin to delete
   * @returns the mocked observable of succesfull deletion
   */
  private deleteAdminMock(identification: string): Observable<boolean> {
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
   * Counts the admins at an admin group in the backend
   * @param identification id of group where to count at
   * @returns the number of admins
   */
  countAdmins(identification: string): Observable<number> {
    this.init();
    if (this.useMock) {
      return this.countAdminsMock();
    }
    let url = `${this.countAdminUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<number>(data, `occurs while counting admins at group ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }

  /**
   * Counts aminds at mock
   * @returns the number of admins at mock
   */
  private countAdminsMock(): Observable<number> {
    return of(this.getAllAdminsFromMock().length);
  }


  /**
   * sets an password of an admin in the backend
   * @param identification id of the user
   * @param password password to set
   * @returns true if the password was updated. Otherwise false
   */
  setPassword(identification: string, password: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.setPasswordMock(identification);
    }
    let url = `${this.setAdminPasswordUrl}/${identification}`;

    return this.http.patch<ResponseWrapper>(url, {
      rawPassword: password
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while setting password of admin ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * sets an password of an admin at mock
   * @param identification id of the user
   * @returns mocked reponse of updating password
   */
  private setPasswordMock(identification: string): Observable<boolean> {
    for (let a of this.getAllAdminsFromMock()) {
      if (a.identification == identification) {
        return of(true);
      }
    }
    return throwError(new Error(`${Status.ERROR} occurs while setting password of admin ${identification} at backend`));
  }
}
