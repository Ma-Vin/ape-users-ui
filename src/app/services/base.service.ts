import { Inject } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ConfigService } from '../config/config.service';
import { throwError } from 'rxjs';
import { Config } from '../config/config';


export const RETRIES = 3;

export const HTTP_URL_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};

export const HTTP_JSON_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

export abstract class BaseService {
  protected isInit = false;
  protected config: Config | undefined;
  public clientId: string | undefined;
  public clientSecret: string | undefined;

  constructor(@Inject(String) private serviceName: string, protected configService: ConfigService) {
  }

  protected init(): void {
    if (this.isInit) {
      return;
    }
    this.config = this.configService.getConfig();
    this.clientId = this.config?.clientId;
    this.clientSecret = this.config?.clientSecret;
  }

  public handleError(error: HttpErrorResponse) {
    console.error('Error occurred at Service ' + this.serviceName);
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  }

  protected getHttpUrlWithClientBasicAuthOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(this.clientId + ":" + this.clientSecret)}`
      })
    };
  }
}
