import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { TokenResponse } from '../model/auth/token-response.model';
import { BaseService } from './base.service';
import { catchError, map, share } from 'rxjs/operators';
import { CryptoService } from './crypto.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';


const TOKEN_URL = "/oauth/token";

const ACCESS_TOKEN = "access_token";
const ACCESS_TOKEN_EXPIRE = "access_token_expire";
const REFRESH_TOKEN = "refresh_token";

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  private isRefreshing = false;
  private retrieveTokenUrl: string;
  private refreshTokenUrl: string;
  private refreshOberserable = new Observable<boolean>();

  constructor(protected http: HttpClient, protected configService: ConfigService, private cryptoService: CryptoService) {
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
}
