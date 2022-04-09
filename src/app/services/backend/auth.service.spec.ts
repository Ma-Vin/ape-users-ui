import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppRoutingModule, LOGIN_PATH } from '../../app-routing.module';
import { ConfigService } from '../../config/config.service';
import { User } from '../../model/user.model';
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, AuthService, REFRESH_TOKEN, REFRESH_TOKENS_MOCK_KEY } from './auth.service';
import { ALL_USERS_MOCK_KEY, BaseBackendService } from '../base/base-backend.service';
import { CryptoService } from '../util/crypto.service';
import { SelectionService } from '../util/selection.service';
import { UserService } from './user.service';
import { AdminService } from './admin.service';
import { Observable, of, throwError } from 'rxjs';


describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let router: Router;
  let userService: UserService;
  let adminService: AdminService;
  let selectionService: SelectionService;

  let selectionServiceSetActiveUserSpy: jasmine.Spy<(user: User) => void>;
  let getUserSpy: jasmine.Spy<(userId: string) => Observable<User>>;
  let getAdminSpy: jasmine.Spy<(userId: string) => Observable<User>>;

  const baseTime = new Date(2021, 9, 1, 20, 15, 0);
  const jwtHeader = 'eyJ0eXAiOiJKV1QiLCJjdHkiOm51bGwsImFsZyI6IkhTMjU2In0';
  const jwtPayload = 'eyJpc3MiOiJVQUEwMDAwMiIsInN1YiI6IlVBQTAwMDAyIiwiYXVkIjpudWxsLCJleHAiOjE2MjUxNzY4MDAsIm5iZiI6bnVsbCwiaWF0IjoxNjI1MDkwNDAwLCJqdGkiOiJhYmMiLCJ0aW1lWm9uZSI6IkV1cm9wZS9CZXJsaW4ifQ';
  const jwtRefrehPayload = 'eyJpc3MiOiJVQUEwMDAwMiIsInN1YiI6IlVBQTAwMDAyIiwiYXVkIjpudWxsLCJleHAiOjE2MjUxODY4MDAsIm5iZiI6bnVsbCwiaWF0IjoxNjI1MTAwNDAwLCJqdGkiOiJhYmMiLCJ0aW1lWm9uZSI6IkV1cm9wZS9CZXJsaW4ifQ';
  // SomeDummySecret
  const jwtSignature = 'HGnch2fGaW4HpEYvwhsEzRSZCg6iGPOIBRc5G1IrfSs';
  const jwtRefreshSignature = 'AYIH4Vy0V2GE0MAGfU3nw3IoB6U54lKap4bFuRH132U';
  const accessToken = `${jwtHeader}.${jwtPayload}.${jwtSignature}`
  const refreshToken = `${jwtHeader}.${jwtRefrehPayload}.${jwtRefreshSignature}`

  const mockConfig =
  {
    clientId: 'ape.user.ui',
    backendBaseUrl: '//localhost:8080',
    adminGroupId: 'AGAA00001'
  };

  const mockResponse = {
    access_token: accessToken,
    token_type: 'jwt',
    expires_in: 1000,
    refresh_token: refreshToken,
    scope: 'READ|WRITE'
  };

  const userId = 'UAA00002';
  const firstName = 'Max';
  const lastName = 'Power';

  const spyUser = User.map({
    identification: userId,
    firstName: firstName,
    lastName: lastName,
    mail: 'max.power@ma-vin.de',
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    isGlobalAdmin: false
  } as User);

  const fakeConfig = { getConfig: () => mockConfig };

  let encryptedMap = new Map<string, string>();

  let fakeCrypto = {
    encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
    decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
    setEncryptedAtLocalStorage: (key: string, value: string) => { encryptedMap.set(key, value) },
    getDecryptedFromLocalStorage: (key: string) => encryptedMap.has(key) ? encryptedMap.get(key) : `decrypted key: ${key}`
  };

  let fakeCryptoModifiable = {
    encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
    decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
    setEncryptedAtLocalStorage: (key: string, value: string) => { encryptedMap.set(key, value) },
    getDecryptedFromLocalStorage: (key: string) => encryptedMap.has(key) ? encryptedMap.get(key) : `decrypted key: ${key}`
  };


  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, AppRoutingModule] });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    selectionService = TestBed.inject(SelectionService);
    userService = TestBed.inject(UserService);
    adminService = TestBed.inject(AdminService);

    selectionServiceSetActiveUserSpy = spyOn(selectionService, 'setActiveUser');
    getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(spyUser));
    getAdminSpy = spyOn(adminService, 'getAdmin').and.returnValue(throwError(new Error(`There is not any Admin with identification "${userId}"`)));

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router, selectionService, userService, adminService);

    BaseBackendService.clearMockData();
    encryptedMap.clear();
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('retrieveToken - retrieve token of user should be saved', fakeAsync(() => {
    let user = 'username';
    let pwd = 'pwd';

    const fakeCrypto = {
      encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
      decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
      setEncryptedAtLocalStorage: (key: string, value: string) => {
        expect(['access_token', 'access_token_expire', 'refresh_token']).toContain(key);
        if (key != 'access_token_expire') {
          expect([accessToken, refreshToken]).toContain(value);
        }
      },
      getDecryptedFromLocalStorage: (key: string) => { `decrypted key: ${key}` }
    };

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router, selectionService, userService, adminService);

    service.retrieveToken(user, pwd).subscribe(() => { });

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    expect(selectionServiceSetActiveUserSpy).toHaveBeenCalled();
    expect(getUserSpy).toHaveBeenCalled();
    expect(getAdminSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('retrieveToken - retrieve token of amdin should be saved', fakeAsync(() => {
    let user = 'username';
    let pwd = 'pwd';


    getUserSpy.and.returnValue(throwError(new Error(`There is not any User with identification "${userId}"`)));
    getAdminSpy.and.returnValue(of(spyUser));

    //userService.getUser('dummy').subscribe(data=> {console.log("data dummy")}, e=>{ console.log(`isError ${e instanceof Error}`); let err = e as Error; console.log(err.message)})

    const fakeCrypto = {
      encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
      decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
      setEncryptedAtLocalStorage: (key: string, value: string) => {
        expect(['access_token', 'access_token_expire', 'refresh_token']).toContain(key);
        if (key != 'access_token_expire') {
          expect([accessToken, refreshToken]).toContain(value);
        }
      },
      getDecryptedFromLocalStorage: (key: string) => { `decrypted key: ${key}` }
    };

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router, selectionService, userService, adminService);

    service.retrieveToken(user, pwd).subscribe(() => { });

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    expect(selectionServiceSetActiveUserSpy).toHaveBeenCalled();
    expect(getUserSpy).toHaveBeenCalled();
    expect(getAdminSpy).toHaveBeenCalled();

    tick();
  }));


  it('retrieveToken - empty config at retrieving token should not call save', fakeAsync(() => {
    let user = 'username';
    let pwd = 'pwd';
    const fakeConfig = { getConfig: () => undefined };

    spyOn(fakeCrypto, "setEncryptedAtLocalStorage").and.callThrough();
    expect(fakeCrypto.setEncryptedAtLocalStorage).not.toHaveBeenCalled();

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router, selectionService, userService, adminService);

    service.retrieveToken(user, pwd).subscribe(() => { });

    httpMock.expectNone('//localhost:8080/oauth/token');

    expect(selectionServiceSetActiveUserSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('retrieveToken - mock', fakeAsync(() => {
    service.useMock = true;
    let user = 'username';
    let pwd = 'pwd';
    addMockUser(user);

    service.retrieveToken(user, pwd).subscribe(() => {
      expect(encryptedMap.has(ACCESS_TOKEN)).toBeTrue();
      expect(encryptedMap.has(ACCESS_TOKEN_EXPIRE)).toBeTrue();
      expect(encryptedMap.has(REFRESH_TOKEN)).toBeTrue();
    });

    httpMock.expectNone('//localhost:8080/oauth/token');
    expect(selectionServiceSetActiveUserSpy).toHaveBeenCalled();

    tick();
  }));


  it('retrieveToken - mock with unknown user', fakeAsync(() => {
    service.useMock = true;
    let user = 'username';
    let pwd = 'pwd';

    service.retrieveToken(user, pwd).subscribe(() => {
      expect(encryptedMap.has(ACCESS_TOKEN)).toBeFalse();
      expect(encryptedMap.has(ACCESS_TOKEN_EXPIRE)).toBeFalse();
      expect(encryptedMap.has(REFRESH_TOKEN)).toBeFalse();
    }, e => {
      expect(e).toEqual('Backend returned code 401, error was: Unauthorized, message was: Bad credentials');
    });

    httpMock.expectNone('//localhost:8080/oauth/token');
    expect(selectionServiceSetActiveUserSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('refreshToken - refreshed retrieve token should be saved', fakeAsync(() => {

    const fakeCrypto = {
      encrypt: (plaintext: string) => { `encrypted: ${plaintext}` },
      decrypt: (encryptedText: string) => { `decrypted: ${encryptedText}` },
      setEncryptedAtLocalStorage: (key: string, value: string) => {
        expect(['access_token', 'access_token_expire', 'refresh_token']).toContain(key);
        if (key != 'access_token_expire') {
          expect([accessToken, refreshToken]).toContain(value);
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

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router, selectionService, userService, adminService);

    service.refreshToken().subscribe(() => { });

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    expect(selectionServiceSetActiveUserSpy).toHaveBeenCalled();

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
        return undefined;
      }
    };
    spyOn(fakeCrypto, "setEncryptedAtLocalStorage").and.callThrough();
    expect(fakeCrypto.setEncryptedAtLocalStorage).not.toHaveBeenCalled();

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router, selectionService, userService, adminService);

    service.refreshToken().subscribe(() => { });

    httpMock.expectNone('//localhost:8080/oauth/token');

    expect(selectionServiceSetActiveUserSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('refreshToken - empty config at refreshing should not call save', fakeAsync(() => {
    const fakeConfig = { getConfig: () => undefined };

    spyOn(fakeCrypto, "setEncryptedAtLocalStorage").and.callThrough();
    expect(fakeCrypto.setEncryptedAtLocalStorage).not.toHaveBeenCalled();

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router, selectionService, userService, adminService);

    service.refreshToken().subscribe(() => { });

    httpMock.expectNone('//localhost:8080/oauth/token');

    expect(selectionServiceSetActiveUserSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('refreshToken - mock', fakeAsync(() => {
    service.useMock = true;
    let userId = 'username';
    let user = addMockUser(userId);
    spyOn(selectionService, 'getActiveUser').and.returnValue(user);

    addRefrehToken(refreshToken);
    encryptedMap.set(REFRESH_TOKEN, refreshToken);

    service.refreshToken().subscribe(data => {
      expect(data).toBeTrue();
      expect(encryptedMap.has(REFRESH_TOKEN)).toBeTrue();
      expect(encryptedMap.get(REFRESH_TOKEN)).not.toEqual(refreshToken);
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('refreshToken - mock but missing active user', fakeAsync(() => {
    service.useMock = true;
    spyOn(selectionService, 'getActiveUser').and.returnValue(undefined);

    addRefrehToken(refreshToken);
    encryptedMap.set(REFRESH_TOKEN, refreshToken);

    service.refreshToken().subscribe(data => {
      expect(data).toBeFalse();
      expect(encryptedMap.get(REFRESH_TOKEN)).toEqual(refreshToken);
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('refreshToken - mock but missing refresh token', fakeAsync(() => {
    service.useMock = true;
    let userId = 'username';
    let user = addMockUser(userId);
    spyOn(selectionService, 'getActiveUser').and.returnValue(user);

    addRefrehToken(refreshToken);

    service.refreshToken().subscribe(data => {
      expect(data).toBeFalse();
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('refreshToken - mock but unkown refresh token', fakeAsync(() => {
    service.useMock = true;
    let userId = 'username';
    let user = addMockUser(userId);
    spyOn(selectionService, 'getActiveUser').and.returnValue(user);

    encryptedMap.set(REFRESH_TOKEN, refreshToken);

    service.refreshToken().subscribe(data => {
      expect(data).toBeFalse();
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('loginAndRedirect - all ok', fakeAsync(() => {
    let user = 'username';
    let pwd = 'pwd';
    let redirect = '/users'

    let spy = spyOn(router, 'navigate').and.callFake(() => new Promise<boolean>((resolve, reject) => resolve(true)));

    service = new AuthService(http, fakeConfig as ConfigService, fakeCrypto as CryptoService, router, selectionService, userService, adminService);

    service.loginAndRedirect(user, pwd, redirect);

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    tick();

    expect(spy).toHaveBeenCalledOnceWith([redirect]);
  }));


  it('hasValidUser - all ok', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted(undefined, [ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN], [accessToken, `${baseTime.getTime() + 50}`, refreshToken]);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCryptoModifiable as CryptoService, router, selectionService, userService, adminService);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeTrue())
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    expect(selectionServiceSetActiveUserSpy).toHaveBeenCalled();

    tick();
  }));


  it('hasValidUser - missing token', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted([ACCESS_TOKEN], [ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN], [`${baseTime.getTime() + 50}`, refreshToken]);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCryptoModifiable as CryptoService, router, selectionService, userService, adminService);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeFalse())
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('hasValidUser - missing expiration', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted([ACCESS_TOKEN_EXPIRE], [ACCESS_TOKEN, REFRESH_TOKEN], [accessToken, refreshToken]);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCryptoModifiable as CryptoService, router, selectionService, userService, adminService);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeFalse())
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));


  it('hasValidUser - missing refresh token', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted([REFRESH_TOKEN], [ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE], [accessToken, `${baseTime.getTime() + 50}`]);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCryptoModifiable as CryptoService, router, selectionService, userService, adminService);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeFalse())
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    tick();
  }));



  it('hasValidUser - expired token', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted(undefined, [ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN], [accessToken, `${baseTime.getTime() - 50}`, refreshToken]);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCryptoModifiable as CryptoService, router, selectionService, userService, adminService);

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeTrue())
    });

    const req = httpMock.expectOne('//localhost:8080/oauth/token');
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);

    expect(selectionServiceSetActiveUserSpy).toHaveBeenCalled();

    tick();
  }));

  it('hasValidUser - already setting active user', fakeAsync(() => {
    createFakeCryptoServiceGetDecrypted(undefined, [ACCESS_TOKEN, ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN], [accessToken, `${baseTime.getTime() + 50}`, refreshToken]);

    service = new AuthService(http, fakeConfig as ConfigService, fakeCryptoModifiable as CryptoService, router, selectionService, userService, adminService);

    let numCalled = 0;
    getUserSpy.and.callFake(userId => {
      if (numCalled == 0) {
        numCalled++;
        service.hasValidUser();
      }
      return of(spyUser)
    })

    jasmine.clock().withMock(() => {
      jasmine.clock().mockDate(baseTime);
      service.hasValidUser().subscribe(data => expect(data).toBeTrue())
    });

    httpMock.expectNone('//localhost:8080/oauth/token');

    expect(selectionServiceSetActiveUserSpy).toHaveBeenCalledTimes(1);

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
    if (keys != undefined && values != undefined) {
      for (let i = 0; i < keys.length && i < values.length; i++) {
        encryptedMap.set(keys[i], values[i]);
      }
    }
    fakeCryptoModifiable = {
      encrypt: (plaintext: string) => `encrypted: ${plaintext}`,
      decrypt: (encryptedText: string) => `decrypted: ${encryptedText}`,
      setEncryptedAtLocalStorage: (key: string, value: string) => { encryptedMap.set(key, value) },
      getDecryptedFromLocalStorage: (key: string) => {
        if (keysEmptyReturn != undefined && keysEmptyReturn.includes(key)) {
          return undefined;
        }
        return encryptedMap.has(key) ? encryptedMap.get(key) : `decrypted key: ${key}`
      }
    };
  }


  function addMockUser(userid: string): User {
    let user = {
      identification: userid,
      firstName: 'Max',
      lastName: 'Power',
      mail: 'max.power@ma-vin.de',
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: true
    } as User;
    TestAuthService.addMockUser(user);
    return user;
  }

  function addRefrehToken(refreshToken: string) {
    TestAuthService.addRefrehToken(refreshToken);
  }
});

/**
 * Dummy extension to be able to call protected methods the abstract class
 */
class TestAuthService extends AuthService {

  static addMockUser(user: User): void {
    if (!BaseBackendService.mockData.has(ALL_USERS_MOCK_KEY)) {
      BaseBackendService.mockData.set(ALL_USERS_MOCK_KEY, [] as User[]);
    }
    (BaseBackendService.mockData.get(ALL_USERS_MOCK_KEY) as User[]).push(user);
  }

  static addRefrehToken(refreshToken: string): void {
    if (!BaseBackendService.mockData.has(REFRESH_TOKENS_MOCK_KEY)) {
      BaseBackendService.mockData.set(REFRESH_TOKENS_MOCK_KEY, [] as string[]);
    }
    (BaseBackendService.mockData.get(REFRESH_TOKENS_MOCK_KEY) as string[]).push(refreshToken);
  }
}
