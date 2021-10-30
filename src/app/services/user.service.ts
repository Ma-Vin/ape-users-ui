import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { ResponseWrapper } from '../model/response-wrapper';
import { Status } from '../model/status.model';
import { IUser, User } from '../model/user.model';
import { BaseService, HTTP_URL_OPTIONS, RETRIES } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  private getUserUrl: string | undefined;

  constructor(private http: HttpClient, configService: ConfigService) {
    super('UserService', configService);
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
}
