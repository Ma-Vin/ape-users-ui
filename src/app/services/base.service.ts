import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ConfigService } from '../config/config.service';
import { Observable, throwError } from 'rxjs';
import { Config } from '../config/config';
import { Message } from '../model/message';
import { Status } from '../model/status.model';


export const RETRIES = 3;

export const HTTP_URL_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  })
};

export const HTTP_JSON_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json;charset=UTF-8'
  })
};

export abstract class BaseService {

  protected isInit = false;
  protected config: Config | undefined;
  public clientId: string | undefined;
  public clientSecret: string | undefined;

  constructor(protected serviceName: string, protected configService: ConfigService) { }

  protected init(): void {
    if (this.isInit) {
      return;
    }
    this.config = this.configService.getConfig();
    this.clientId = this.config?.clientId;
    this.clientSecret = this.config?.clientSecret;
    this.isInit = this.initService();
  }

  /**
   * Initialize service specific values
   * @returns true if initialization was successfull. Otherwise false
   */
  protected abstract initService(): boolean;

  public handleError(error: any, data: Observable<any>) {
    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        console.error(`An error occurred at service ${this.serviceName}:`, error.error.message);
        return throwError(`An error occurred: ${error.error.message}`);
      } else {
        console.error(
          `An error occurred at service ${this.serviceName}, ` +
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
        return throwError(`Backend returned code ${error.status},  body was: ${error.error}`);
      }
    }
    if (error instanceof Error) {
      console.error(`An error occurred at service ${this.serviceName}: ${error.message}`)
      throw error;
    }
    return throwError('Something bad happened; please try again later.');
  }

  protected getHttpUrlWithClientBasicAuthOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(this.clientId + ":" + this.clientSecret)}`
      })
    };
  }

  protected getFirstMessageText(messages: Message[], status: Status, defaultMessageText: string): string {
    let result: Message | undefined;
    for (let m of messages) {
      if (m.status == status && (result == undefined || m.order < result.order)) {
        result = m;
      }
    }
    return result == undefined ? defaultMessageText : result.messageText;
  }
}
