import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { TokenResponse } from '../model/auth/token-response.model';
import { BaseService } from './base.service';
import { catchError, map, share } from 'rxjs/operators';
import { CryptoService } from './crypto.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { LOGIN_ABS_PATH } from '../app-routing.module';


export const TOKEN_URL = "/oauth/token";

export const ACCESS_TOKEN = "access_token";
export const ACCESS_TOKEN_EXPIRE = "access_token_expire";
export const REFRESH_TOKEN = "refresh_token";

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  private isRefreshing = false;
  private retrieveTokenUrl: string;
  private refreshTokenUrl: string;
  private refreshOberserable = new Observable<boolean>();

  constructor(protected http: HttpClient, protected configService: ConfigService, private cryptoService: CryptoService, private router: Router) {
    super('AuthService', configService);
    this.retrieveTokenUrl = '';
    this.refreshTokenUrl = '';
  }

  protected init(): void {
    if (this.isInit) {
      return;
    }
    super.init();
    let config = this.configService.getConfig();
    this.retrieveTokenUrl = config != undefined ? config.backendBaseUrl.concat(TOKEN_URL) : '';
    this.refreshTokenUrl = this.retrieveTokenUrl;
  }

  retrieveToken(username: string, password: string): Observable<void> {
    this.init();
    let params = new URLSearchParams();

    let config = this.configService.getConfig();
    if (config == undefined) {
      return new Observable<void>();
    }

    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', btoa(password));
    params.append('client_id', config.clientId);
    params.append('client_secret', btoa(config.clientSecret));

    console.debug('AuthService: get Access token');
    return this.http.post<TokenResponse>(this.retrieveTokenUrl, params.toString(), this.getHttpUrlWithClientBasicAuthOptions())
      .pipe(
        map(
          data => this.saveToken(data),
          catchError(
            this.handleError
          )
        )
      );
  }

  refreshToken(): Observable<boolean> {
    this.init();
    let params = new URLSearchParams();
    let decodedRefreshToken = this.cryptoService.getDecryptedFromLocalStorage(REFRESH_TOKEN);
    let config = this.configService.getConfig();
    if (decodedRefreshToken === null || config == undefined) {
      return of(false);
    }



    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', decodedRefreshToken);
    params.append('client_id', config.clientId);
    params.append('client_secret', btoa(config.clientSecret));
    if (this.isRefreshing) {
      return this.refreshOberserable;
    }

    console.debug('AuthService: call backend to refresh access token');
    this.isRefreshing = true;
    this.refreshOberserable = this.http.post<TokenResponse>(this.refreshTokenUrl, params.toString(), this.getHttpUrlWithClientBasicAuthOptions())
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

  private saveToken(token: TokenResponse): void {
    var expireDate = new Date().getTime() + (1000 * token.expires_in);
    this.cryptoService.setEncryptedAtLocalStorage(ACCESS_TOKEN, token.access_token);
    this.cryptoService.setEncryptedAtLocalStorage(ACCESS_TOKEN_EXPIRE, expireDate.toString());
    if (token.refresh_token !== undefined) {
      this.cryptoService.setEncryptedAtLocalStorage(REFRESH_TOKEN, token.refresh_token);
    }
    console.debug('AuthService: save Access token');
  }

  loginAndRedirect(username: string, password: string, redirect: string): void {
    this.retrieveToken(username, password).subscribe(data => this.router.navigate([redirect]));
  }

  hasValidUser(): Observable<boolean> {
    this.init();
    if (this.cryptoService.getDecryptedFromLocalStorage(ACCESS_TOKEN) === null) {
      console.debug('AuthService: No access token');
      return of(false);
    }
    if (this.cryptoService.getDecryptedFromLocalStorage(ACCESS_TOKEN_EXPIRE) === null) {
      console.debug('AuthService: No access token expiration');
      return of(false);
    }
    if (this.cryptoService.getDecryptedFromLocalStorage(REFRESH_TOKEN) === null) {
      console.debug('AuthService: No refresh token');
      return of(false);
    }
    let now = new Date();
    let expires = Number(this.cryptoService.getDecryptedFromLocalStorage(ACCESS_TOKEN_EXPIRE));
    if (now.getTime() >= expires) {
      console.debug(`AuthService: Refresh Access token. expires ${new Date(expires).toISOString()} now ${now.toISOString()}`);
      return this.refreshToken();
    }
    console.debug(`AuthService: Access token is valid at ${new Date().toISOString()} by access_token_expire ${new Date(expires).toISOString()}`);
    return of(true);
  }

  clearTokensAndLogin(): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRE);
    localStorage.removeItem(REFRESH_TOKEN);
    this.router.navigate([LOGIN_ABS_PATH]);
  }
}
