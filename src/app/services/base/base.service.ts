import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../config/config.service';
import { Observable, throwError } from 'rxjs';
import { Config } from '../../config/config';


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
          `error was: ${error.error}` +
          `message was: ${error.message}`);
        return throwError(`Backend returned code ${error.status}, error was: ${error.error}, message was: ${error.message}`);
      }
    }
    if (error instanceof Error) {
      console.error(`An error occurred at service ${this.serviceName}: ${error.message}`)
      throw error;
    }
    return throwError('Something bad happened; please try again later.');
  }
}
