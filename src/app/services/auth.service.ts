import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { ConfigService } from '../config/config.service';
import { TokenResponse } from '../model/auth/token-response.model';
import { BaseService } from './base.service';
import { catchError, map, share } from 'rxjs/operators';
import { CryptoService } from './crypto.service';
import { Observable } from 'rxjs';


const TOKEN_URL = "/oauth/token";

const ACCESS_TOKEN = "access_token";
const ACCESS_TOKEN_EXPIRE = "access_token_expire";
const REFRESH_TOKEN = "refresh_token";

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService implements OnInit {
  private isInit = false;
  private isRefreshing = false;
  private retrieveTokenUrl: string;
  private refreshTokenUrl: string;
  private refreshOberserable = new Observable<void>();

  constructor(protected http: HttpClient, protected configService: ConfigService, private cryptoService: CryptoService) {
    super('AuthService', configService);
    this.retrieveTokenUrl = '';
    this.refreshTokenUrl = '';
  }

  ngOnInit(): void {
    if (this.isInit) {
      return;
    }
    super.ngOnInit();
    let config = this.configService.getConfig();
    this.retrieveTokenUrl = config != undefined ? config.backendBaseUrl.concat(TOKEN_URL) : '';
    this.refreshTokenUrl = this.retrieveTokenUrl;
  }

  retrieveToken(username: string, password: string): Observable<void> {
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

  refreshToken(): Observable<void> {
    let params = new URLSearchParams();
    let decodedRefreshToken = this.cryptoService.getDecryptedFromLocalStorage(REFRESH_TOKEN);
    let config = this.configService.getConfig();
    if (decodedRefreshToken === null || config == undefined) {
      return new Observable<void>();
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
            return this.saveToken(data);
          }
        ),
        share()
      );

    return this.refreshOberserable;
  }

  saveToken(token: TokenResponse): void {
    var expireDate = new Date().getTime() + (1000 * token.expires_in);
    this.cryptoService.setEncryptedAtLocalStorage(ACCESS_TOKEN, token.access_token);
    this.cryptoService.setEncryptedAtLocalStorage(ACCESS_TOKEN_EXPIRE, expireDate.toString());
    if (token.refresh_token !== undefined) {
      this.cryptoService.setEncryptedAtLocalStorage(REFRESH_TOKEN, token.refresh_token);
    }
    console.debug('AuthService: save Access token');
  }
}
