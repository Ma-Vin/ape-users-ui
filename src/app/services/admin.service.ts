import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { AdminGroup, IAdminGroup } from '../model/admin-group.model';
import { ResponseWrapper } from '../model/response-wrapper';
import { Status } from '../model/status.model';
import { IUser, User } from '../model/user.model';
import { AuthService } from './auth.service';
import { BaseService, RETRIES } from './base.service';


/**
 * Service to call all operations of the admin controller at backend
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService extends BaseService {
  private getAdminGroupUrl: string | undefined;
  private updateAdminGroupUrl: string | undefined;
  private createAdminUrl: string | undefined;
  private deleteAdminUrl: string | undefined;
  private getAdminUrl: string | undefined;
  private countAdminUrl: string | undefined;
  private getAllAdminsUrl: string | undefined;
  private updateAdminUrl: string | undefined;
  private setAdminPasswordUrl: string | undefined;


  constructor(private http: HttpClient, configService: ConfigService, private authService: AuthService) {
    super('AdminService', configService);
  }


  /**
   * initilize the service
   */
  protected init() {
    if (this.isInit) {
      return;
    }
    super.init();
    this.isInit = true;
    this.initUrls();
  }

  /**
   * initilize the urls of the service
   */
  private initUrls() {
    if (this.config == undefined) {
      this.isInit = false;
      return;
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
  }


  /**
   * Get an admin group from the back end
   * @param identification id of the admin group
   * @returns the admin group
   */
  public getAdminGroup(identification: string): Observable<AdminGroup> {
    this.init();
    let url = `${this.getAdminGroupUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: this.authService.getHttpUrlTokenAuthOptions().headers,
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while getting admin group ${identification} from backend`));
        }
        return AdminGroup.map(data.response as IAdminGroup)
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Get an admin from the backend
   * @param identification id of the admin
   * @returns the admin
   */
  public getAdmin(identification: string): Observable<User> {
    this.init();
    let url = `${this.getAdminUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: this.authService.getHttpUrlTokenAuthOptions().headers,
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while getting admin ${identification} from backend`));
        }
        let result = User.map(data.response as IUser);
        result.isGlobalAdmin = true;
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
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
    let url = `${this.getAllAdminsUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: this.authService.getHttpUrlTokenAuthOptions().headers,
      params: page == undefined || size == undefined ? undefined : {
        page: `${page}`,
        size: `${size}`
      }
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while getting all admins at ${identification} from backend`));
        }
        let users = data.response as IUser[];
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
   * Updates an admingroup in the backend
   * @param modifiedGroup the modefied group to put in the backend
   * @returns the stored group
   */
  public updateAdminGroup(modifiedGroup: AdminGroup): Observable<AdminGroup> {
    this.init();
    let url = `${this.updateAdminGroupUrl}/${modifiedGroup.identification}`;

    return this.http.put<ResponseWrapper>(url, modifiedGroup as IAdminGroup, {
      headers: this.authService.getHttpJsonTokenAuthOptions().headers
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while updating admin group ${modifiedGroup.identification} at backend`));
        }
        return AdminGroup.map(data.response as IAdminGroup)
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Updates an admin in the backend
   * @param modifiedGroup the modefied user to put in the backend
   * @returns the stored user
   */
  public updateAdmin(modifiedAdmin: User): Observable<User> {
    this.init();
    let url = `${this.updateAdminUrl}/${modifiedAdmin.identification}`;

    return this.http.put<ResponseWrapper>(url, modifiedAdmin as IUser, {
      headers: this.authService.getHttpJsonTokenAuthOptions().headers
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while updating admin ${modifiedAdmin.identification} at backend`));
        }
        return User.map(data.response as IUser)
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
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
    let url = `${this.createAdminUrl}`;
    let body = `firstName=${firstName}&lastName=${lastName}&adminGroupIdentification=${adminGroupIdentification}`;

    return this.http.post<ResponseWrapper>(url, body, {
      headers: this.authService.getHttpUrlTokenAuthOptions().headers
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while creating admin at group ${adminGroupIdentification} from backend`));
        }
        let result = User.map(data.response as IUser);
        result.isGlobalAdmin = true;
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Deletes an admin in the backend
   * @param identification id of the admin to delete
   * @returns true if the admin was deleted. Otherwise false
   */
  deleteAdmin(identification: string): Observable<boolean> {
    this.init();
    let url = `${this.deleteAdminUrl}/${identification}`;

    return this.http.delete<ResponseWrapper>(url, {
      headers: this.authService.getHttpUrlTokenAuthOptions().headers
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while deleting admin ${identification} at backend`));
        }
        return data.response as boolean;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Counts the admins at an admin group in the backend
   * @param identification id of group where to count at
   * @returns the number of admins
   */
  countAdmins(identification: string): Observable<number> {
    this.init();
    let url = `${this.countAdminUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: this.authService.getHttpUrlTokenAuthOptions().headers,
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while counting admins at group ${identification} at backend`));
        }
        return data.response as number;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * sets an password of an admin in the backend
   * @param identification id of the user
   * @param password password to set
   * @returns true if the password was updated. Otherwise false
   */
  setPassword(identification: string, password: string): Observable<boolean> {
    this.init();
    let url = `${this.setAdminPasswordUrl}/${identification}`;

    return this.http.patch<ResponseWrapper>(url, {
      rawPassword: password
    }, {
      headers: this.authService.getHttpJsonTokenAuthOptions().headers
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while setting password of admin ${identification} at backend`));
        }
        return data.response as boolean;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }
}
