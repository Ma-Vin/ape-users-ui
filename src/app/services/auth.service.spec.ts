import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConfigService } from '../config/config.service';

import { AuthService } from './auth.service';
import { CryptoService } from './crypto.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

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

  const fakeCrypto = {
    encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
    decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
    setEncryptedAtLocalStorage: (key: string, value: string) => { },
    getDecryptedFromLocalStorage: (key: string) => { `decrypted key: ${key}` }
  };


  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('retrieve token should be saved', fakeAsync(() => {
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

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService);

    service.ngOnInit();
    service.retrieveToken(user, pwd).subscribe(() => { });

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    tick();
  }));


  it('empty config at retrieving token should not call save', fakeAsync(() => {
    let user = 'username';
    let pwd = 'pwd';
    const fakeConfig = { getConfig: () => undefined };

    spyOn(fakeCrypto, "setEncryptedAtLocalStorage").and.callThrough();
    expect(fakeCrypto.setEncryptedAtLocalStorage).not.toHaveBeenCalled();

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService);

    service.ngOnInit();
    service.retrieveToken(user, pwd).subscribe(() => { });

    httpMock.expectNone('//localhost:8080/oauth/token');;

    tick();
  }));


  it('refreshed retrieve token should be saved', fakeAsync(() => {
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

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService);

    service.ngOnInit();
    service.refreshToken().subscribe(() => { });

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    tick();
  }));


  it('empty refresh token should not call save', fakeAsync(() => {
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

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService);

    service.ngOnInit();
    service.refreshToken().subscribe(() => { });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('empty config at refreshing should not call save', fakeAsync(() => {
    const fakeConfig = { getConfig: () => undefined };

    spyOn(fakeCrypto, "setEncryptedAtLocalStorage").and.callThrough();
    expect(fakeCrypto.setEncryptedAtLocalStorage).not.toHaveBeenCalled();

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService);

    service.ngOnInit();
    service.refreshToken().subscribe(() => { });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));
});
