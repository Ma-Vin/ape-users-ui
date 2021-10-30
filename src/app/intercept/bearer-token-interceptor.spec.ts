import { HttpClient, HttpContext, HttpHandler, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AppRoutingModule } from '../app-routing.module';
import { ConfigService, CONFIG_URL } from '../config/config.service';
import { AuthService, TOKEN_URL } from '../services/auth.service';
import { CryptoService } from '../services/crypto.service';
import { BearerTokenInterceptor, AUTH_BEARER_PREFIX, AUTH_HEADER_PROPERTY_NAME } from './bearer-token-interceptor';


describe('BearerTokenInterceptor', () => {
  let interceptor: BearerTokenInterceptor;

  let authService: AuthService;
  let configService: ConfigService;
  let cryptoService: CryptoService;
  let router: Router;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let request: HttpRequest<any>;
  let handler: HttpHandler;


  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AppRoutingModule, HttpClientTestingModule] });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    configService = TestBed.inject(ConfigService);
    cryptoService = TestBed.inject(CryptoService);
    authService = TestBed.inject(AuthService);

    interceptor = new BearerTokenInterceptor(authService);
  });


  it('should create an instance', () => {
    expect(interceptor).toBeTruthy();
  });


  it('intercept - load config', fakeAsync(() => {
    initHttpRequest(CONFIG_URL, undefined, undefined);
    initHttpHandler('someConfig');

    let authServiceSpy = spyOn(authService, 'hasValidUser');

    interceptor.intercept(request, handler).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect((data as HttpResponse<string>).body).toEqual('someConfig');
      }
    );

    expect(authServiceSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('intercept - basic authorization', fakeAsync(() => {
    initHttpRequest('http://localhost:8080/anthing/anyId', `Basic :${btoa('someUser:somePwd')}`, undefined);
    initHttpHandler('someReturn');

    let authServiceSpy = spyOn(authService, 'hasValidUser');

    interceptor.intercept(request, handler).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect((data as HttpResponse<string>).body).toEqual('someReturn');
      }
    );

    expect(authServiceSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('intercept - bearer authorization already exists', fakeAsync(() => {
    initHttpRequest('http://localhost:8080/anthing/anyId', `${AUTH_BEARER_PREFIX} :${btoa('someToken123')}`, undefined);
    initHttpHandler('someReturn');

    let authServiceSpy = spyOn(authService, 'hasValidUser');

    interceptor.intercept(request, handler).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect((data as HttpResponse<string>).body).toEqual('someReturn');
      }
    );

    expect(authServiceSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('intercept - authentication request', fakeAsync(() => {
    initHttpRequest(`http://localhost:8080/${TOKEN_URL}`, undefined, undefined);
    initHttpHandler('someReturn');

    let authServiceSpy = spyOn(authService, 'hasValidUser');

    interceptor.intercept(request, handler).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect((data as HttpResponse<string>).body).toEqual('someReturn');
      }
    );

    expect(authServiceSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('intercept - valid user', fakeAsync(() => {
    initHttpRequest(`http://localhost:8080/admin/getAdmin/UAA00001`, undefined, 'someToken');
    initHttpHandler('someReturn');

    let authServiceValidUserSpy = spyOn(authService, 'hasValidUser').and.callFake(() => of(true));
    let authServiceGetTokenSpy = spyOn(authService, 'getToken').and.callFake(() => 'someToken');
    let authServiceClearTokenSpy = spyOn(authService, 'clearTokensAndLogin').and.callFake(() => { });

    interceptor.intercept(request, handler).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect((data as HttpResponse<string>).body).toEqual('someReturn');
      }
    );

    expect(authServiceValidUserSpy).toHaveBeenCalled();
    expect(authServiceGetTokenSpy).toHaveBeenCalled();
    expect(authServiceClearTokenSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('intercept - invalid user', fakeAsync(() => {
    initHttpRequest(`http://localhost:8080/admin/getAdmin/UAA00001`, undefined, 'someToken');
    initHttpHandler('someReturn');

    let authServiceValidUserSpy = spyOn(authService, 'hasValidUser').and.callFake(() => of(false));
    let authServiceGetTokenSpy = spyOn(authService, 'getToken').and.callFake(() => 'someToken');
    let authServiceClearTokenSpy = spyOn(authService, 'clearTokensAndLogin').and.callFake(() => { });

    interceptor.intercept(request, handler).subscribe(
      data => { expect(data).toBeFalsy(); },
      err => { expect(err).toBeFalsy(); },
      () => {
        expect('const').toBeFalsy();
      }
    );

    expect(authServiceValidUserSpy).toHaveBeenCalled();
    expect(authServiceGetTokenSpy).not.toHaveBeenCalled();
    expect(authServiceClearTokenSpy).toHaveBeenCalled();

    tick();
  }));


  function initHttpRequest(requestUrl: string, authHeaderValue: string | undefined, tokenValue: string | undefined) {

    let headersMock = {
      has(propName: string): boolean { return propName == AUTH_HEADER_PROPERTY_NAME && authHeaderValue != undefined },
      get(propName: string): string | null { return propName == AUTH_HEADER_PROPERTY_NAME && authHeaderValue != undefined ? authHeaderValue : null },
      set(propName: string, value: string | string[]): void {
        if (propName == AUTH_HEADER_PROPERTY_NAME && authHeaderValue == undefined && tokenValue != undefined) {
          expect(value).toEqual(`${AUTH_BEARER_PREFIX} ${tokenValue}`);
        }
      }
    } as HttpHeaders;

    request = {
      url: requestUrl,
      headers: headersMock,
      clone(update: {
        headers?: HttpHeaders,
        context?: HttpContext,
        reportProgress?: boolean,
        params?: HttpParams,
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text',
        withCredentials?: boolean,
        body?: any | null,
        method?: string,
        url?: string,
        setHeaders?: {
          [name: string]: string | string[],
        },
        setParams?: {
          [param: string]: string,
        }
      }): HttpRequest<any> {
        return {
          url: requestUrl,
          headers: headersMock,
        } as HttpRequest<any>
      }
    } as HttpRequest<any>

  }

  function initHttpHandler(dummyResponse: string) {
    handler = {
      handle(req: HttpRequest<any>) {
        return of(
          { body: dummyResponse } as HttpResponse<string>
        )
      }
    } as HttpHandler;
  }
});

