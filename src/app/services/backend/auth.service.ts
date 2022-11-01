import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '../../config/config.service';
import { TokenResponse } from '../../model/auth/token-response.model';
import { JwtPayload } from '../../model/auth/jwt-payload.model';
import { catchError, map, share, switchMap } from 'rxjs/operators';
import { CryptoService } from '../util/crypto.service';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LOGIN_PATH } from '../../app-constants';
import { SelectionService } from '../util/selection.service';
import { ALL_USERS_MOCK_KEY, BaseBackendService, HTTP_URL_OPTIONS } from '../base/base-backend.service';
import { User } from '../../model/user.model';
import { UserService } from './user.service';
import { AdminService } from './admin.service';


export const TOKEN_URL = "/oauth/token";

export const ACCESS_TOKEN = "access_token";
export const ACCESS_TOKEN_EXPIRE = "access_token_expire";
export const REFRESH_TOKEN = "refresh_token";

export const REFRESH_TOKENS_MOCK_KEY = 'refreshTokens'

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseBackendService {
  private isRefreshing = false;
  private isActiveUserCheck = false;
  private retrieveTokenUrl: string;
  private refreshTokenUrl: string;
  private refreshOberserable = new Observable<boolean>();

  private tokenResponseMock: TokenResponse = {
    access_token: 'toReplace',
    token_type: 'jwt',
    expires_in: 3600,
    refresh_token: 'toReplace',
    scope: 'READ|WRITE'
  }
  private jwtHeaderUrlEncodedMock = 'eyJ0eXAiOiJKV1QiLCJjdHkiOm51bGwsImFsZyI6IkhTMjU2In0';
  // private jwtPayloadUrlEncodedMock = 'eyJpc3MiOiJVQUEwMDAwMSIsInN1YiI6IlVBQTAwMDAxIiwiYXVkIjpudWxsLCJleHAiOjE2MjUxNzY4MDAsIm5iZiI6bnVsbCwiaWF0IjoxNjI1MDkwNDAwLCJqdGkiOiJhYmMiLCJ0aW1lWm9uZSI6IkV1cm9wZS9CZXJsaW4ifQ';
  // Signature Secret: SomeDummySecret
  private jwtSignatureUrlEncodedMock = 'bJ-OOeN4NUJdk4dD0VpNRYBv09Tn-RK4nhrvWXzgcxY';

  constructor(protected http: HttpClient, protected configService: ConfigService, private cryptoService: CryptoService
    , private router: Router, private selectionService: SelectionService, private userService: UserService, private adminService: AdminService) {

    super(http, 'AuthService', configService);
    this.retrieveTokenUrl = '';
    this.refreshTokenUrl = '';
  }

  protected initServiceUrls(): boolean {
    if (this.config == undefined) {
      return false;
    }
    this.retrieveTokenUrl = this.config.backendBaseUrl.concat(TOKEN_URL);
    this.refreshTokenUrl = this.retrieveTokenUrl;
    return true;
  }

  protected initServiceMocks(): void {
    if (!BaseBackendService.mockData.has(REFRESH_TOKENS_MOCK_KEY)) {
      BaseBackendService.mockData.set(REFRESH_TOKENS_MOCK_KEY, [] as string[]);
    }
  }

  retrieveToken(username: string, password: string): Observable<void> {
    this.init();
    if (this.useMock) {
      return this.retrieveTokenMock(username);
    }
    let params = new URLSearchParams();

    let config = this.configService.getConfig();
    if (config == undefined) {
      return new Observable<void>();
    }

    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', Buffer.from(password).toString('base64'));
    params.append('client_id', config.clientId);

    console.debug('AuthService: get Access token');
    return this.http.post<TokenResponse>(this.retrieveTokenUrl, params.toString(), HTTP_URL_OPTIONS)
      .pipe(
        map(data => this.saveToken(data)),
        catchError(this.handleError.bind(this))
      );
  }

  private retrieveTokenMock(username: string): Observable<void> {
    this.initMocks();
    let user: User | undefined;
    for (let u of (BaseBackendService.mockData.get(ALL_USERS_MOCK_KEY) as User[])) {
      if (u.identification == username) {
        user = u;
        break;
      }
    }
    if (user == undefined) {
      return throwError(() => new Error('Backend returned code 401, error was: Unauthorized, message was: Bad credentials'));
    }

    let tokenToSave = Object.assign({}, this.tokenResponseMock);
    let actualTime = new Date().getTime() * 1000;
    let tokenPayload: JwtPayload = {
      iss: username,
      sub: username,
      aud: 'ape.user.ui',
      exp: actualTime + 3600,
      nbf: actualTime,
      iat: actualTime,
      jti: `token.${username}.${actualTime}`,
      timeZone: 'ECT'
    };
    let refreshPayload: JwtPayload = {
      iss: username,
      sub: username,
      aud: 'ape.user.ui',
      exp: actualTime + 7200,
      nbf: actualTime,
      iat: actualTime,
      jti: `refresh.${username}.${actualTime}`,
      timeZone: 'ECT'
    };
    tokenToSave.access_token = `${this.jwtHeaderUrlEncodedMock}.${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}.${this.jwtSignatureUrlEncodedMock}`;
    tokenToSave.refresh_token = `${this.jwtHeaderUrlEncodedMock}.${Buffer.from(JSON.stringify(refreshPayload)).toString('base64')}.${this.jwtSignatureUrlEncodedMock}`;
    (BaseBackendService.mockData.get(REFRESH_TOKENS_MOCK_KEY) as string[]).push(tokenToSave.refresh_token);
    return of(this.saveToken(tokenToSave));
  }

  refreshToken(): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.refreshTokenMock();
    }
    let params = new URLSearchParams();
    let decodedRefreshToken = this.cryptoService.getDecryptedFromLocalStorage(REFRESH_TOKEN);
    let config = this.configService.getConfig();
    if (decodedRefreshToken === undefined || config == undefined) {
      return of(false);
    }



    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', decodedRefreshToken);
    params.append('client_id', config.clientId);
    if (this.isRefreshing) {
      return this.refreshOberserable;
    }

    console.debug('AuthService: call backend to refresh access token');
    this.isRefreshing = true;
    this.refreshOberserable = this.http.post<TokenResponse>(this.refreshTokenUrl, params.toString(), HTTP_URL_OPTIONS)
      .pipe(
        map(
          data => {
            this.isRefreshing = false;
            this.saveToken(data);
            return data.access_token != null;
          }
        ),
        share()
      );

    return this.refreshOberserable;
  }

  private refreshTokenMock(): Observable<boolean> {
    this.initMocks();
    let decodedRefreshToken = this.cryptoService.getDecryptedFromLocalStorage(REFRESH_TOKEN);
    let user = this.selectionService.getActiveUser();

    if (user == undefined || decodedRefreshToken == undefined
      || !(BaseBackendService.mockData.get(REFRESH_TOKENS_MOCK_KEY) as string[]).includes(decodedRefreshToken)) {

      return of(false);
    }

    let indexToRemove = (BaseBackendService.mockData.get(REFRESH_TOKENS_MOCK_KEY) as string[]).indexOf(decodedRefreshToken);
    (BaseBackendService.mockData.get(REFRESH_TOKENS_MOCK_KEY) as string[]).splice(indexToRemove, 1);

    return this.retrieveTokenMock(user.identification).pipe(switchMap(() => of(true)));
  }

  private saveToken(token: TokenResponse): void {
    var expireDate = new Date().getTime() + (1000 * token.expires_in);
    this.cryptoService.setEncryptedAtLocalStorage(ACCESS_TOKEN, token.access_token);
    this.cryptoService.setEncryptedAtLocalStorage(ACCESS_TOKEN_EXPIRE, expireDate.toString());
    if (token.refresh_token !== undefined) {
      this.cryptoService.setEncryptedAtLocalStorage(REFRESH_TOKEN, token.refresh_token);
    }
    this.setActiveUser(token.access_token);

    console.debug('AuthService: save Access token');
  }

  private setActiveUser(accessToken: string): void {
    if (this.selectionService.getActiveUser() != undefined) {
      return;
    }
    let split = accessToken.split('.');
    if (split.length == 3) {
      let payloadText = Buffer.from(split[1], 'base64').toString();
      let parsedPayload = JSON.parse(payloadText) as JwtPayload;
      this.setActiveUserAtSelectionService(parsedPayload.sub);
    }
  }


  /**
   * Sets the user at the selection service. The user is determined by the user and admin servivce
   * @param userId the identification of the user to set
   */
  private setActiveUserAtSelectionService(userId: string): void {
    if (this.useMock) {
      this.setActiveUserAtSelectionServiceMock(userId);
      return
    }
    if (this.isActiveUserCheck) {
      return;
    }
    this.isActiveUserCheck = true;
    this.userService.getUser(userId).pipe(
      catchError((err, caugth) => {
        if (err instanceof Error && err.message == `There is not any User with identification "${userId}"`) {
          console.debug(`The user ${userId} does not exists, may be it is an admin`)
          return this.adminService.getAdmin(userId);
        }
        console.error(err);
        this.selectionService.setActiveUser(undefined);
        return NEVER;
      })
    )
      .subscribe(data => this.selectionService.setActiveUser(data))
      .add(() => this.isActiveUserCheck = false);
  }

  private setActiveUserAtSelectionServiceMock(userId: string): void {
    this.initMocks();
    for (let u of (BaseBackendService.mockData.get(ALL_USERS_MOCK_KEY) as User[])) {
      if (u.identification == userId) {
        this.selectionService.setActiveUser(u);
        break;
      }
    }
    throwError(() => new Error(`There is not any User with identification "${userId}"`));
  }

  loginAndRedirect(username: string, password: string, redirect: string): void {
    this.retrieveToken(username, password).subscribe(data => this.router.navigate([redirect]));
  }

  hasValidUser(): Observable<boolean> {
    this.init();
    let accessToken = this.getToken();
    if (accessToken == undefined) {
      console.debug('AuthService: No access token');
      return of(false);
    }
    if (this.cryptoService.getDecryptedFromLocalStorage(ACCESS_TOKEN_EXPIRE) == undefined) {
      console.debug('AuthService: No access token expiration');
      return of(false);
    }
    if (this.cryptoService.getDecryptedFromLocalStorage(REFRESH_TOKEN) == undefined) {
      console.debug('AuthService: No refresh token');
      return of(false);
    }
    let now = new Date();
    let expires = Number(this.cryptoService.getDecryptedFromLocalStorage(ACCESS_TOKEN_EXPIRE));
    if (now.getTime() >= expires) {
      console.debug(`AuthService: Refresh Access token. expires ${new Date(expires).toISOString()} now ${now.toISOString()}`);
      return this.refreshToken();
    }
    this.setActiveUser(accessToken);
    console.debug(`AuthService: Access token is valid at ${new Date().toISOString()} by access_token_expire ${new Date(expires).toISOString()}`);
    return of(true);
  }

  clearTokensAndLogin(): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRE);
    localStorage.removeItem(REFRESH_TOKEN);
    this.selectionService.removeActiveUser();
    this.router.navigate([LOGIN_PATH]);
  }

  public getToken() {
    return this.cryptoService.getDecryptedFromLocalStorage(ACCESS_TOKEN);
  }
}
