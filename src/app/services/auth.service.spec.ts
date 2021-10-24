import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppRoutingModule, LOGIN_PATH } from '../app-routing.module';
import { ConfigService } from '../config/config.service';
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, AuthService, REFRESH_TOKEN } from './auth.service';
import { CryptoService } from './crypto.service';


describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let router: Router;

  const baseTime = new Date(2021, 9, 1, 20, 15, 0);

  const mockConfig =
  {
    clientId: 'ape.user.ui',
    clientSecret: 'changeIt',
    backendBaseUrl: '//localhost:8080'
  };

  const mockResponse = {
    access_token: 'some_access_token',
    token_type: 'jwt',
    expires_in: 1000,
    refresh_token: 'some_refresh_token',
    scope: 'READ|WRITE'
  };

  const fakeConfig = { getConfig: () => mockConfig };

  let fakeCrypto = {
    encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
    decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
    setEncryptedAtLocalStorage: (key: string, value: string) => { },
    getDecryptedFromLocalStorage: (key: string) => { `decrypted key: ${key}` }
  };


  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, AppRoutingModule] });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('retrieveToken - retrieve token should be saved', fakeAsync(() => {
    let user = 'username';
    let pwd = 'pwd';

    const fakeCrypto = {
      encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
      decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
      setEncryptedAtLocalStorage: (key: string, value: string) => {
        expect(['access_token', 'access_token_expire', 'refresh_token']).toContain(key);
        if (key != 'access_token_expire') {
          expect(['some_access_token', 'some_refresh_token']).toContain(value);
        }
      },
      getDecryptedFromLocalStorage: (key: string) => { `decrypted key: ${key}` }
    };

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    service.retrieveToken(user, pwd).subscribe(() => { });

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    tick();
  }));


  it('retrieveToken - empty config at retrieving token should not call save', fakeAsync(() => {
    let user = 'username';
    let pwd = 'pwd';
    const fakeConfig = { getConfig: () => undefined };

    spyOn(fakeCrypto, "setEncryptedAtLocalStorage").and.callThrough();
    expect(fakeCrypto.setEncryptedAtLocalStorage).not.toHaveBeenCalled();

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    service.retrieveToken(user, pwd).subscribe(() => { });

    httpMock.expectNone('//localhost:8080/oauth/token');;

    tick();
  }));


  it('refreshToken - refreshed retrieve token should be saved', fakeAsync(() => {
    let refreshToken = 'refresh';

    const fakeCrypto = {
      encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
      decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
      setEncryptedAtLocalStorage: (key: string, value: string) => {
        expect(['access_token', 'access_token_expire', 'refresh_token']).toContain(key);
        if (key != 'access_token_expire') {
          expect(['some_access_token', 'some_refresh_token']).toContain(value);
        }
      },
      getDecryptedFromLocalStorage: (key: string) => {
        expect(['refresh_token']).toContain(key);
        if (key == 'refresh_token') {
          return refreshToken;
        }
        return null;
      }
    };

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    service.refreshToken().subscribe(() => { });

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    tick();
  }));


  it('refreshToken - empty refresh token should not call save', fakeAsync(() => {
    const fakeCrypto = {
      encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
      decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
      setEncryptedAtLocalStorage: (key: string, value: string) => {
      },
      getDecryptedFromLocalStorage: (key: string) => {
        expect(['refresh_token']).toContain(key);
        return null;
      }
    };
    spyOn(fakeCrypto, "setEncryptedAtLocalStorage").and.callThrough();
    expect(fakeCrypto.setEncryptedAtLocalStorage).not.toHaveBeenCalled();

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    service.refreshToken().subscribe(() => { });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('refreshToken - empty config at refreshing should not call save', fakeAsync(() => {
    const fakeConfig = { getConfig: () => undefined };

    spyOn(fakeCrypto, "setEncryptedAtLocalStorage").and.callThrough();
    expect(fakeCrypto.setEncryptedAtLocalStorage).not.toHaveBeenCalled();

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    service.refreshToken().subscribe(() => { });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('loginAndRedirect - all ok', fakeAsync(() => {
    let user = 'username';
    let pwd = 'pwd';
    let redirect = '/users'

    let spy = spyOn(router, 'navigate').and.callFake(() => new Promise<boolean>((resolve, reject) => resolve(true)));

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    service.loginAndRedirect(user, pwd, redirect);

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    tick();

    expect(spy).toHaveBeenCalledOnceWith([redirect]);
  }));


  it('hasValidUser - all ok', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted(undefined, [ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN], ['testToken', `${baseTime.getTime() + 50}`, 'testRefreshToken']);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeTrue())
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('hasValidUser - missing token', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted([ACCESS_TOKEN], [ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN], [`${baseTime.getTime() + 50}`, 'testRefreshToken']);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeFalse())
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('hasValidUser - missing expiration', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted([ACCESS_TOKEN_EXPIRE], [ACCESS_TOKEN, REFRESH_TOKEN], ['testToken', 'testRefreshToken']);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeFalse())
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('hasValidUser - missing refresh token', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted([REFRESH_TOKEN], [ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE], ['testToken', `${baseTime.getTime() + 50}`]);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeFalse())
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));



  it('hasValidUser - expired token', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted(undefined, [ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN], ['testToken', `${baseTime.getTime() - 50}`, 'testRefreshToken']);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeTrue())
    });

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    tick();
  }));


  it('clearTokensAndLogin - all ok', () => {
    let spyRouter = spyOn(router, 'navigate').and.callFake(() => new Promise<boolean>((resolve, reject) => resolve(true)));
    let spyLocalStorage = spyOn(localStorage, 'removeItem').and.callFake(data => { });

    service.clearTokensAndLogin();

    expect(spyRouter).toHaveBeenCalledOnceWith([LOGIN_PATH]);
    expect(spyLocalStorage).toHaveBeenCalledWith(ACCESS_TOKEN);
    expect(spyLocalStorage).toHaveBeenCalledWith(ACCESS_TOKEN_EXPIRE);
    expect(spyLocalStorage).toHaveBeenCalledWith(REFRESH_TOKEN);
    expect(spyLocalStorage).toHaveBeenCalledTimes(3);
  });


  function createFakeCryptoServiceGetDecrypted(keysEmptyReturn: string[] | undefined, keys: string[] | undefined, values: string[] | undefined) {
    fakeCrypto = {
      encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
      decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
      setEncryptedAtLocalStorage: (key: string, value: string) => { },
      getDecryptedFromLocalStorage: (key: string) => {
        if (keysEmptyReturn != undefined && keysEmptyReturn.includes(key)) {
          return null;
        }
        if (keys != undefined && keys.includes(key) && values != undefined) {
          return values[keys.indexOf(key)];
        }
        return `decrypted key: ${key}`
      }
    };
  }

});

function commands(commands: any, arg1: any, arg2: any) {
  throw new Error('Function not implemented.');
}
