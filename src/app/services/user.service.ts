import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { ResponseWrapper } from '../model/response-wrapper';
import { Status } from '../model/status.model';
import { IUser, User } from '../model/user.model';
import { BaseService, HTTP_URL_OPTIONS, RETRIES } from './base.service';

export const ALL_USERS_MOCK_KEY = 'users';
export const NEXT_USER_ID_MOCK_KEY = 'nextUserId';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  private getUserUrl: string | undefined;

  constructor(private http: HttpClient, configService: ConfigService) {
    super('UserService', configService);
    this.initMocks();
  }

  /**
   * Initialize the data at mock
   */
  private initMocks(): void {
    if (!this.useMock || BaseService.mockData.has('UserService.initMocks')) {
      return
    }
    if (!BaseService.mockData.has(ALL_USERS_MOCK_KEY)) {
      BaseService.mockData.set(ALL_USERS_MOCK_KEY, [] as User[]);
    }
    (BaseService.mockData.get(ALL_USERS_MOCK_KEY) as User[]).push({
      identification: 'UAA00002',
      firstName: 'Lower',
      lastName: 'Power',
      mail: 'lower.power@ma-vin.de',
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: false
    } as User);
    BaseService.mockData.set('UserService.initMocks', true);
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
    if (!BaseService.mockData.has(ALL_USERS_MOCK_KEY)) {
      this.initMocks();
    }
    return (BaseService.mockData.get(ALL_USERS_MOCK_KEY) as User[]);
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

    let adminControllerUrl = this.config.backendBaseUrl.concat('/user');

    this.getUserUrl = adminControllerUrl.concat('/getUser');
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
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while getting user ${identification} from backend`));
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
   * Creates mock for getting an user
   * @param identification id of the user
   * @returns the mocked observable of the user
   */
  private getUserMock(identification: string): Observable<User> {
    for (let a of this.getAllNonAdminsFromMock()) {
      if (a.identification == identification) {
        return of(a);
      }
    }
    return throwError(new Error(`${Status.ERROR} occurs while getting user ${identification} from backend`));
  }
}
