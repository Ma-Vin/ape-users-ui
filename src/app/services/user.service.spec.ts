import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Config } from '../config/config';
import { ConfigService } from '../config/config.service';
import { ResponseWrapper } from '../model/response-wrapper';
import { Role } from '../model/role.model';
import { Status } from '../model/status.model';
import { IUser, User } from '../model/user.model';
import { BaseBackendService } from './base-backend.service';
import { RETRIES } from './base.service';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;


  const userId = 'UAA00002';
  const firstName = 'Lower';
  const lastName = 'Power';

  const commonGroupId = 'CGAA00001';

  const mockConfig: Config =
  {
    clientId: 'ape.user.ui',
    clientSecret: 'changeIt',
    backendBaseUrl: '//localhost:8080',
    adminGroupId: 'AGAA00001'
  };

  const mockIUser: IUser = {
    identification: userId,
    firstName: firstName,
    lastName: lastName,
    mail: `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}@ma-vin.de`,
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    role: Role.VISITOR
  }

  const modifiedUser = User.map({
    identification: userId,
    firstName: firstName,
    lastName: lastName,
    mail: 'max.power@ma-vin.de',
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    isGlobalAdmin: false,
    role: Role.VISITOR
  } as User)

  const mockErrorResponseWrapper: ResponseWrapper = {
    response: undefined,
    status: Status.ERROR,
    messages: [{ time: new Date(2021, 9, 25, 20, 15), order: 1, messageText: 'Some error text', status: Status.ERROR }]
  }

  const mockFatalResponseWrapper: ResponseWrapper = {
    response: undefined,
    status: Status.FATAL,
    messages: [{ time: new Date(2021, 9, 25, 20, 15), order: 1, messageText: 'Some error text', status: Status.FATAL }]
  }



  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    service = TestBed.inject(UserService);

    BaseBackendService.clearMockData();

    spyOn(configService, 'getConfig').and.returnValue(mockConfig);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });



  /**
   * getUser
   */
  it('getUser - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIUser,
      status: Status.OK,
      messages: []
    }

    service.getUser(userId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(mockIUser.identification);
      expect(data.firstName).toEqual(mockIUser.firstName);
      expect(data.lastName).toEqual(mockIUser.lastName);
      expect(data.image).toBeUndefined();
      expect(data.smallImage).toBeUndefined();
      expect(data.lastLogin).toEqual(mockIUser.lastLogin);
      expect(data.validFrom).toEqual(mockIUser.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getUser/${userId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getUser/${userId}`);

    tick();
  }));

  it('getUser - with error status', fakeAsync(() => {
    service.getUser(userId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getUser/${userId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getUser/${userId}`);

    tick();
  }));

  it('getUser - with fatal status', fakeAsync(() => {
    service.getUser(userId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getUser/${userId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getUser/${userId}`);

    tick();
  }));

  it('getUser - mock', fakeAsync(() => {
    service.useMock = true;
    service.getUser(userId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(userId);
    });

    httpMock.expectNone(`//localhost:8080/user/getUser/${userId}`);

    tick();
  }));

  it('getUser - mock with error', fakeAsync(() => {
    service.useMock = true;
    service.getUser('someId').subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`There is not any User with identification "someId"`);
      });

    httpMock.expectNone(`//localhost:8080/user/getUser/someId`);

    tick();
  }));


  /**
   * 
   */
  it('getAllUsers - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsers(commonGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].firstName).toEqual(mockIUser.firstName);
      expect(data[0].lastName).toEqual(mockIUser.lastName);
      expect(data[0].image).toBeUndefined();
      expect(data[0].smallImage).toBeUndefined();
      expect(data[0].lastLogin).toEqual(mockIUser.lastLogin);
      expect(data[0].validFrom).toEqual(mockIUser.validFrom);
      expect(data[0].validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsers/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsers/${commonGroupId}`);

    tick();
  }));

  it('getAllUsers - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsers(commonGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].firstName).toEqual(mockIUser.firstName);
      expect(data[0].lastName).toEqual(mockIUser.lastName);
      expect(data[0].image).toBeUndefined();
      expect(data[0].smallImage).toBeUndefined();
      expect(data[0].lastLogin).toEqual(mockIUser.lastLogin);
      expect(data[0].validFrom).toEqual(mockIUser.validFrom);
      expect(data[0].validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsers/${commonGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsers/${commonGroupId}?page=1&size=50`);

    tick();
  }));


  it('getAllUsers - with error status', fakeAsync(() => {
    service.getAllUsers(commonGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUsers/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUsers/${commonGroupId}`);

    tick();
  }));


  it('getAllUsers - with fatal status', fakeAsync(() => {
    service.getAllUsers(commonGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUsers/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUsers/${commonGroupId}`);

    tick();
  }));


  it('getAllUsers - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllUsers(commonGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(userId);
    });

    httpMock.expectNone(`//localhost:8080/user/getAllUsers/${commonGroupId}`);

    tick();
  }));



  /**
   * updateUser
   */
  it('updateUser - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIUser,
      status: Status.OK,
      messages: []
    }

    service.updateUser(modifiedUser).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(mockIUser.identification);
      expect(data.firstName).toEqual(mockIUser.firstName);
      expect(data.lastName).toEqual(mockIUser.lastName);
      expect(data.image).toBeUndefined();
      expect(data.smallImage).toBeUndefined();
      expect(data.lastLogin).toEqual(mockIUser.lastLogin);
      expect(data.validFrom).toEqual(mockIUser.validFrom);
      expect(data.validTo).toBeUndefined();
    });


    const req = httpMock.expectOne(`//localhost:8080/user/updateUser/${userId}`);
    expect(req.request.method).toEqual("PUT");
    expect(req.request.body).toEqual(modifiedUser);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/updateUser/${userId}`);

    tick();
  }));

  it('updateUser - with error status', fakeAsync(() => {
    service.updateUser(modifiedUser).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/updateUser/${userId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/updateUser/${userId}`);

    tick();
  }));

  it('updateUser - with fatal status', fakeAsync(() => {
    service.updateUser(modifiedUser).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/updateUser/${userId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/updateUser/${userId}`);

    tick();
  }));

  it('updateUser - mock', fakeAsync(() => {
    service.useMock = true;
    service.updateUser(modifiedUser).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(modifiedUser.identification);
      expect(data.firstName).toEqual(modifiedUser.firstName);
      expect(data.lastName).toEqual(modifiedUser.lastName);
      expect(data.image).toBeUndefined();
      expect(data.smallImage).toBeUndefined();
      expect(data.lastLogin).toEqual(modifiedUser.lastLogin);
      expect(data.validFrom).toEqual(modifiedUser.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    httpMock.expectNone(`//localhost:8080/user/updateUser/${userId}`);

    tick();
  }));

  it('updateUser - mock with error', fakeAsync(() => {
    service.useMock = true;
    let otherModifiedUser: User = Object.assign({}, modifiedUser);
    otherModifiedUser.identification = 'someId';
    service.updateUser(otherModifiedUser).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating user someId at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/updateUser/someId`);

    tick();
  }));



  /**
   * createUser
   */
  it('createUser - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIUser,
      status: Status.OK,
      messages: []
    }

    service.createUser(commonGroupId, firstName, lastName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(mockIUser.identification);
      expect(data.firstName).toEqual(mockIUser.firstName);
      expect(data.lastName).toEqual(mockIUser.lastName);
      expect(data.image).toBeUndefined();
      expect(data.smallImage).toBeUndefined();
      expect(data.lastLogin).toEqual(mockIUser.lastLogin);
      expect(data.validFrom).toEqual(mockIUser.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/createUser`);
    expect(req.request.method).toEqual("POST");
    expect(req.request.body).toEqual(`firstName=${firstName}&lastName=${lastName}&commonGroupIdentification=${commonGroupId}`)
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/createUser`);

    tick();
  }));

  it('createUser - with error status', fakeAsync(() => {
    service.createUser(commonGroupId, firstName, lastName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/createUser`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`firstName=${firstName}&lastName=${lastName}&commonGroupIdentification=${commonGroupId}`)
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/createUser`);

    tick();
  }));

  it('createUser - with fatal status', fakeAsync(() => {
    service.createUser(commonGroupId, firstName, lastName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/createUser`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`firstName=${firstName}&lastName=${lastName}&commonGroupIdentification=${commonGroupId}`)
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/createUser`);

    tick();
  }));

  it('createUser - mock', fakeAsync(() => {
    service.useMock = true;
    service.createUser(commonGroupId, firstName, lastName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual('UAA00003');
      expect(data.firstName).toEqual(firstName);
      expect(data.lastName).toEqual(lastName);
    });

    httpMock.expectNone(`//localhost:8080/user/createUser`);

    tick();
  }));



  /**
   * deleteUser
   */
  it('deleteUser - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.deleteUser(userId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/deleteUser/${userId}`);
    expect(req.request.method).toEqual("DELETE");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/deleteUser/${userId}`);

    tick();
  }));

  it('deleteUser - with error status', fakeAsync(() => {
    service.deleteUser(userId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/deleteUser/${userId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/deleteUser/${userId}`);

    tick();
  }));

  it('deleteUser - with fatal status', fakeAsync(() => {
    service.deleteUser(userId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/deleteUser/${userId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/deleteUser/${userId}`);

    tick();
  }));

  it('deleteUser - mock', fakeAsync(() => {
    service.useMock = true;
    service.deleteUser(userId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/user/deleteUser/${userId}`);

    tick();
  }));

  it('deleteUser - mock non existing', fakeAsync(() => {
    service.useMock = true;
    service.deleteUser('someId').subscribe(data => {
      expect(data).toBeFalse();
    });

    httpMock.expectNone(`//localhost:8080/user/deleteUser/someId`);

    tick();
  }));



  /**
   * countUsers
   */
  it('countUsers - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countUsers(commonGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/countUsers/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/countUsers/${commonGroupId}`);

    tick();
  }));

  it('countUsers - with error status', fakeAsync(() => {
    service.countUsers(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countUsers/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countUsers/${commonGroupId}`);

    tick();
  }));

  it('countUsers - with fatal status', fakeAsync(() => {
    service.countUsers(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countUsers/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countUsers/${commonGroupId}`);

    tick();
  }));

  it('countUsers - mock', fakeAsync(() => {
    service.useMock = true;
    service.countUsers(commonGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(1);
    });

    httpMock.expectNone(`//localhost:8080/user/countUsers/${commonGroupId}`);

    tick();
  }));



  /**
   * setPassword
   */
  it('setPassword - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    let newPwd = 'somePwd';

    service.setPassword(userId, newPwd).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/setUserPassword/${userId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual({ rawPassword: newPwd });
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/setUserPassword/${userId}`);

    tick();
  }));

  it('setPassword - with error status', fakeAsync(() => {
    let newPwd = 'somePwd';

    service.setPassword(userId, newPwd).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/setUserPassword/${userId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ rawPassword: newPwd });
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/setUserPassword/${userId}`);

    tick();
  }));

  it('setPassword - with fatal status', fakeAsync(() => {
    let newPwd = 'somePwd';

    service.setPassword(userId, newPwd).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/setUserPassword/${userId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ rawPassword: newPwd });
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/setUserPassword/${userId}`);

    tick();
  }));

  it('setPassword - mock', fakeAsync(() => {
    let newPwd = 'somePwd';

    service.useMock = true;
    service.setPassword(userId, newPwd).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/user/setUserPassword/${userId}`);

    tick();
  }));

  it('setPassword - mock with error', fakeAsync(() => {
    let newPwd = 'somePwd';

    service.useMock = true;
    service.setPassword('someId', newPwd).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while setting password of user someId at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/setUserPassword/someId`);

    tick();
  }));



  /**
   * setRole
   */
  it('setRole - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    let newRole = Role.MANAGER;

    service.setRole(userId, newRole).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/setUserRole/${userId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual({ role: newRole });
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/setUserRole/${userId}`);

    tick();
  }));

  it('setRole - with error status', fakeAsync(() => {
    let newRole = Role.MANAGER;

    service.setRole(userId, newRole).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/setUserRole/${userId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ role: newRole });
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/setUserRole/${userId}`);

    tick();
  }));

  it('setRole - with fatal status', fakeAsync(() => {
    let newRole = Role.MANAGER;

    service.setRole(userId, newRole).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/setUserRole/${userId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ role: newRole });
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/setUserRole/${userId}`);

    tick();
  }));

  it('setRole - mock', fakeAsync(() => {
    let newRole = Role.MANAGER;

    service.useMock = true;
    service.setRole(userId, newRole).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/user/setUserRole/${userId}`);

    tick();
  }));

  it('setRole - mock not changed', fakeAsync(() => {
    let newRole = Role.ADMIN;

    service.useMock = true;
    service.setRole(userId, newRole).subscribe(data => {
      expect(data).toBeFalsy();
      expect(data).toBeFalse();
    });

    httpMock.expectNone(`//localhost:8080/user/setUserRole/${userId}`);

    tick();
  }));

  it('setRole - mock with error', fakeAsync(() => {
    let newRole = Role.MANAGER;

    service.useMock = true;
    service.setRole('someId', newRole).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while setting role of user someId at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/setUserRole/someId`);

    tick();
  }));
});
