import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CommonGroup, ICommonGroup } from 'src/app/model/common-group.model';
import { Config } from '../../config/config';
import { ConfigService } from '../../config/config.service';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Role } from '../../model/role.model';
import { Status } from '../../model/status.model';
import { IUser, User } from '../../model/user.model';
import { BaseBackendService, RETRIES } from '../base/base-backend.service';
import { SelectionService } from '../util/selection.service';
import { INITIAL_COMMON_GROUP_ID_AT_MOCK } from './common-group.service';
import { INITIAL_BASE_GROUP_ID_AT_MOCK } from './base-group.service';

import { INITIAL_USER_ID_AT_MOCK, UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let selectionService: SelectionService;

  let getSelectedCommonGroupSpy: jasmine.Spy<() => CommonGroup | undefined>;


  const userId = INITIAL_USER_ID_AT_MOCK;
  const firstName = 'Lower';
  const lastName = 'Power';

  const commonGroupId = INITIAL_COMMON_GROUP_ID_AT_MOCK;
  const baseGroupId = INITIAL_BASE_GROUP_ID_AT_MOCK;

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
  } as User);

  const mockCommonGroup = CommonGroup.map({
    description: 'some description',
    groupName: 'commonGroupName',
    identification: commonGroupId,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    defaultRole: Role.VISITOR
  } as ICommonGroup);

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
    selectionService = TestBed.inject(SelectionService);
    service = TestBed.inject(UserService);

    initMockData();

    BaseBackendService.clearMockData();
  });

  function initMockData() {
    BaseBackendService.clearMockData();

    spyOn(configService, 'getConfig').and.returnValue(mockConfig);
    getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(mockCommonGroup);
  }


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
      expect(data.isGlobalAdmin).toBeFalse();
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

  it('getUser - mock without selected common group', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);

    service.getUser(userId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`ERROR occurs while getting user ${userId} from backend`);
      }
    );

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
      expect(data[0].isGlobalAdmin).toBeFalse();
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
      expect(data[0].isGlobalAdmin).toBeFalse();
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
      expect(data.isGlobalAdmin).toBeFalse();
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
      expect(data.role).not.toEqual(modifiedUser.role);
    });

    httpMock.expectNone(`//localhost:8080/user/updateUser/${userId}`);

    tick();
  }));

  it('updateUser - mock without selected common group', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);

    service.updateUser(modifiedUser).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating user ${userId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/updateUser/someId`);

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

  it('createUser - mock without selected common group', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);

    service.createUser(commonGroupId, firstName, lastName).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while creating user at backend`);
      }
    );

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

  it('deleteUser - mock without selected common group', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);

    service.deleteUser(userId).subscribe(
      data => {
        expect(data).toBeFalse();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while deleting user ${userId} at backend`);
      }
    );

    httpMock.expectNone(`//localhost:8080/user/deleteUser/someId`);

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




  /**
   * addUserToBaseGroup
   */
  it('addUserToBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.addUserToBaseGroup(userId, baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/addUserToBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual({ userIdentification: userId });
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/addUserToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addUserToBaseGroup - with error status', fakeAsync(() => {
    service.addUserToBaseGroup(userId, baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/addUserToBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ userIdentification: userId });
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/addUserToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addUserToBaseGroup - with fatal status', fakeAsync(() => {
    service.addUserToBaseGroup(userId, baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/addUserToBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ userIdentification: userId });
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/addUserToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addUserToBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;

    service.createUser(commonGroupId, 'Some other user', lastName).subscribe(
      createdUser => {
        service.addUserToBaseGroup(createdUser.identification, baseGroupId).subscribe(
          firstAddData => {
            expect(firstAddData).toBeTruthy();
            expect(firstAddData).toBeTrue();

            service.addUserToBaseGroup(createdUser.identification, baseGroupId).subscribe(
              secondAddData => {
                expect(secondAddData).toBeFalse();
              },
              e => expect(e).toBeFalsy());
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );
    httpMock.expectNone(`//localhost:8080/user/addUserToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addUserToBaseGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.addUserToBaseGroup('anyId', baseGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding user anyId to base group ${baseGroupId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/addUserToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addUserToBaseGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.addUserToBaseGroup(userId, 'anyId').subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding user ${userId} to base group anyId at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/addUserToBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * removeUserFromBaseGroup
   */
  it('removeUserFromBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.removeUserFromBaseGroup(userId, baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/removeUserFromBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual({ userIdentification: userId });
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/removeUserFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeUserFromBaseGroup - with error status', fakeAsync(() => {
    service.removeUserFromBaseGroup(userId, baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/removeUserFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ userIdentification: userId });
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/removeUserFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeUserFromBaseGroup - with fatal status', fakeAsync(() => {
    service.removeUserFromBaseGroup(userId, baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/removeUserFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ userIdentification: userId });
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/removeUserFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeUserFromBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;

    service.removeUserFromBaseGroup(userId, baseGroupId).subscribe(
      firstRemoveData => {
        expect(firstRemoveData).toBeTruthy();
        expect(firstRemoveData).toBeTrue();

        service.removeUserFromBaseGroup(userId, baseGroupId).subscribe(
          secondRemoveData => {
            expect(secondRemoveData).toBeFalse();
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/group/base/removeUserFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeUserFromBaseGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.removeUserFromBaseGroup('anyId', baseGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing user anyId from base group ${baseGroupId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/base/removeUserFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeUserFromBaseGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.removeUserFromBaseGroup(userId, 'anyId').subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing user ${userId} from base group anyId at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/base/removeUserFromBaseGroup/anyId`);

    tick();
  }));




  /**
   * countUsersAtBaseGroup
   */
  it('countUsersAtBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countUsersAtBaseGroup(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/countUsersAtBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/countUsersAtBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countUsersAtBaseGroup - with error status', fakeAsync(() => {
    service.countUsersAtBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countUsersAtBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countUsersAtBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countUsersAtBaseGroup - with fatal status', fakeAsync(() => {
    service.countUsersAtBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countUsersAtBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countUsersAtBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countUsersAtBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;

    service.countUsersAtBaseGroup(baseGroupId).subscribe(
      data => {
        expect(data).toEqual(1);
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/user/countUsersAtBaseGroup/${baseGroupId}`);

    tick();
  }));





  /**
   * getAllUsersFromBaseGroup
   */
  it('getAllUsersFromBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromBaseGroup(baseGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(userId);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAllUsersFromBaseGroup - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromBaseGroup(baseGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(userId);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllUsersFromBaseGroup - with error status', fakeAsync(() => {
    service.getAllUsersFromBaseGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAllUsersFromBaseGroup - with fatal status', fakeAsync(() => {
    service.getAllUsersFromBaseGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAllUsersFromBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllUsersFromBaseGroup(baseGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(1);
        expect(getAllData[0].identification).toEqual(userId);
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}`);

    tick();
  }));


});
