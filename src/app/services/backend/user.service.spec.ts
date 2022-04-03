import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { Config } from '../../config/config';
import { ConfigService } from '../../config/config.service';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Role } from '../../model/role.model';
import { Status } from '../../model/status.model';
import { IUser, User } from '../../model/user.model';
import { BaseBackendService, RETRIES } from '../base/base-backend.service';
import { SelectionService } from '../util/selection.service';
import { INITIAL_COMMON_GROUP_ID_AT_MOCK } from './common-group.service';
import { BaseGroupService, INITIAL_BASE_GROUP_ID_AT_MOCK } from './base-group.service';
import { INITIAL_USER_ID_AT_MOCK, UserService, USERS_AT_COMMON_GROUP } from './user.service';
import { UserIdRole } from '../../model/user-id-role.model';
import { INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK } from './privilege-group.service';

describe('UserService', () => {
  let service: UserService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let selectionService: SelectionService;
  let baseGroupService: BaseGroupService;

  let getSelectedCommonGroupSpy: jasmine.Spy<() => CommonGroup | undefined>;


  const userId = INITIAL_USER_ID_AT_MOCK;
  const secondUserId = INITIAL_USER_ID_AT_MOCK + "2";
  const firstName = 'Lower';
  const lastName = 'Power';

  const commonGroupId = INITIAL_COMMON_GROUP_ID_AT_MOCK;
  const baseGroupId = INITIAL_BASE_GROUP_ID_AT_MOCK;
  const privilegeGroupId = INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK;

  const mockConfig: Config =
  {
    clientId: 'ape.user.ui',
    clientSecret: 'changeIt',
    backendBaseUrl: '//localhost:8080',
    adminGroupId: 'AGAA00001'
  };

  let mockIUser: IUser;
  let modifiedUser: User;
  let secondUser: User;
  let mockCommonGroup: CommonGroup;

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
    baseGroupService = TestBed.inject(BaseGroupService);

    initMockData();

    BaseBackendService.clearMockData();
  });


  function initMockData() {
    mockIUser = {
      identification: userId,
      firstName: firstName,
      lastName: lastName,
      mail: `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}@ma-vin.de`,
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      role: Role.VISITOR,
      isComplete: true
    } as IUser;

    modifiedUser = User.map({
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

    secondUser = User.map({
      identification: secondUserId,
      firstName: firstName + '2',
      lastName: lastName + '2',
      mail: 'max.power@ma-vin.de',
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: false,
      role: Role.MANAGER
    } as User);

    mockCommonGroup = CommonGroup.map({
      description: 'some description',
      groupName: 'commonGroupName',
      identification: commonGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      defaultRole: Role.VISITOR
    } as ICommonGroup);

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
   * getAllUsers
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
      expect(data[0].isComplete).toBeTrue();
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
      expect(data[0].isComplete).toBeTrue();
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
      expect(data[0].isComplete).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/user/getAllUsers/${commonGroupId}`);

    tick();
  }));




  /**
   * getAllUserParts
   */
  it('getAllUserParts - all ok', fakeAsync(() => {
    mockIUser.image = undefined;
    mockIUser.smallImage = undefined;
    mockIUser.lastLogin = undefined;
    mockIUser.validFrom = undefined;
    mockIUser.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserParts(commonGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkUserPartWithName(data[0], mockIUser.identification, mockIUser.firstName, mockIUser.lastName);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserParts/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserParts/${commonGroupId}`);

    tick();
  }));

  it('getAllUserParts - with pageing', fakeAsync(() => {
    mockIUser.image = undefined;
    mockIUser.smallImage = undefined;
    mockIUser.lastLogin = undefined;
    mockIUser.validFrom = undefined;
    mockIUser.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserParts(commonGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkUserPartWithName(data[0], mockIUser.identification, mockIUser.firstName, mockIUser.lastName);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserParts/${commonGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserParts/${commonGroupId}?page=1&size=50`);

    tick();
  }));


  it('getAllUserParts - with error status', fakeAsync(() => {
    service.getAllUserParts(commonGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUserParts/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUserParts/${commonGroupId}`);

    tick();
  }));


  it('getAllUserParts - with fatal status', fakeAsync(() => {
    service.getAllUserParts(commonGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUserParts/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUserParts/${commonGroupId}`);

    tick();
  }));


  it('getAllUserParts - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllUserParts(commonGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkUserPart(data[0], userId);
    });

    httpMock.expectNone(`//localhost:8080/user/getAllUserParts/${commonGroupId}`);

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
    expect(req.request.body).toEqual(`"${newRole}"`);
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
      expect(req.request.body).toEqual(`"${newRole}"`);
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
      expect(req.request.body).toEqual(`"${newRole}"`);
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
    expect(req.request.body).toEqual(userId);
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
      expect(req.request.body).toEqual(userId);
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
      expect(req.request.body).toEqual(userId);
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
    expect(req.request.body).toEqual(userId);
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
      expect(req.request.body).toEqual(userId);
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
      expect(req.request.body).toEqual(userId);
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

    httpMock.expectNone(`//localhost:8080/user/removeUserFromBaseGroup/${baseGroupId}`);

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

    httpMock.expectNone(`//localhost:8080/user/removeUserFromBaseGroup/${baseGroupId}`);

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

    httpMock.expectNone(`//localhost:8080/user/removeUserFromBaseGroup/anyId`);

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
      expect(data[0].isGlobalAdmin).toBeFalse();
      expect(data[0].isComplete).toBeTrue();
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
      expect(data[0].isGlobalAdmin).toBeFalse();
      expect(data[0].isComplete).toBeTrue();
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
        expect(getAllData[0].isGlobalAdmin).toBeFalse();
        expect(getAllData[0].isComplete).toBeTrue();
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * getAllUserPartsFromBaseGroup
   */
  it('getAllUserPartsFromBaseGroup - all ok', fakeAsync(() => {
    mockIUser.image = undefined;
    mockIUser.smallImage = undefined;
    mockIUser.lastLogin = undefined;
    mockIUser.validFrom = undefined;
    mockIUser.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromBaseGroup(baseGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkUserPart(data[0], userId);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAllUserPartsFromBaseGroup - with pageing', fakeAsync(() => {
    mockIUser.image = undefined;
    mockIUser.smallImage = undefined;
    mockIUser.lastLogin = undefined;
    mockIUser.validFrom = undefined;
    mockIUser.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromBaseGroup(baseGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkUserPart(data[0], userId);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromBaseGroup/${baseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromBaseGroup/${baseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllUserPartsFromBaseGroup - with error status', fakeAsync(() => {
    service.getAllUserPartsFromBaseGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAllUserPartsFromBaseGroup - with fatal status', fakeAsync(() => {
    service.getAllUserPartsFromBaseGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAllUserPartsFromBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllUserPartsFromBaseGroup(baseGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(1);
        checkUserPart(getAllData[0], userId);
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromBaseGroup/${baseGroupId}`);

    tick();
  }));



  /**
   * countAvailableUsersForBaseGroup
   */
  it('countAvailableUsersForBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countAvailableUsersForBaseGroup(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/countAvailableUsersForBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/countAvailableUsersForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countAvailableUsersForBaseGroup - with error status', fakeAsync(() => {
    service.countAvailableUsersForBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countAvailableUsersForBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countAvailableUsersForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countAvailableUsersForBaseGroup - with fatal status', fakeAsync(() => {
    service.countAvailableUsersForBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countAvailableUsersForBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countAvailableUsersForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countAvailableUsersForBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;

    service.countAvailableUsersForBaseGroup(baseGroupId).subscribe(data => {
      expect(data).toBeFalsy();
      expect(data).toEqual(0);
    });
    service.addUserToMock(secondUser, commonGroupId);

    service.countAvailableUsersForBaseGroup(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(1);
    });

    httpMock.expectNone(`//localhost:8080/user/countAvailableUsersForBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * getAvailableUsersForBaseGroup
   */
  it('getAvailableUsersForBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAvailableUsersForBaseGroup(baseGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(userId);
      expect(data[0].isGlobalAdmin).toBeFalse();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAvailableUsersForBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAvailableUsersForBaseGroup - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAvailableUsersForBaseGroup(baseGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(userId);
      expect(data[0].isGlobalAdmin).toBeFalse();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAvailableUsersForBaseGroup/${baseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForBaseGroup/${baseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAvailableUsersForBaseGroup - with error status', fakeAsync(() => {
    service.getAvailableUsersForBaseGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAvailableUsersForBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAvailableUsersForBaseGroup - with fatal status', fakeAsync(() => {
    service.getAvailableUsersForBaseGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAvailableUsersForBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAvailableUsersForBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAvailableUsersForBaseGroup(baseGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(0);
      },
      e => expect(e).toBeFalsy()
    );

    service.addUserToMock(secondUser, commonGroupId);

    service.getAvailableUsersForBaseGroup(baseGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(1);
        expect(getAllData[0].identification).toEqual(secondUserId);
        expect(getAllData[0].isGlobalAdmin).toBeFalse();
        expect(getAllData[0].isComplete).toBeTrue();
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * getAvailableUserPartsForBaseGroup
   */
  it('getAvailableUserPartsForBaseGroup - all ok', fakeAsync(() => {
    mockIUser.image = undefined;
    mockIUser.smallImage = undefined;
    mockIUser.lastLogin = undefined;
    mockIUser.validFrom = undefined;
    mockIUser.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAvailableUserPartsForBaseGroup(baseGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkUserPart(data[0], userId);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAvailableUserPartsForBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAvailableUserPartsForBaseGroup - with pageing', fakeAsync(() => {
    mockIUser.image = undefined;
    mockIUser.smallImage = undefined;
    mockIUser.lastLogin = undefined;
    mockIUser.validFrom = undefined;
    mockIUser.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAvailableUserPartsForBaseGroup(baseGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkUserPart(data[0], userId);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAvailableUserPartsForBaseGroup/${baseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForBaseGroup/${baseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAvailableUserPartsForBaseGroup - with error status', fakeAsync(() => {
    service.getAvailableUserPartsForBaseGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAvailableUserPartsForBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAvailableUserPartsForBaseGroup - with fatal status', fakeAsync(() => {
    service.getAvailableUserPartsForBaseGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAvailableUserPartsForBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getAvailableUserPartsForBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAvailableUserPartsForBaseGroup(baseGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(0);
      },
      e => expect(e).toBeFalsy()
    );

    service.addUserToMock(secondUser, commonGroupId);

    service.getAvailableUserPartsForBaseGroup(baseGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(1);
        expect(getAllData[0].identification).toEqual(secondUserId);
        expect(getAllData[0].isGlobalAdmin).toBeFalse();
        expect(getAllData[0].isComplete).toBeFalse();
      },
      e => expect(e).toBeFalsy()
    );
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * addUserToPrivilegeGroup
   */
  it('addUserToPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }
    let userIdRole = new UserIdRole(userId, Role.CONTRIBUTOR);

    service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/addUserToPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual(userIdRole);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/addUserToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addUserToPrivilegeGroup - with error status', fakeAsync(() => {
    let userIdRole = new UserIdRole(userId, Role.CONTRIBUTOR);

    service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/addUserToPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(userIdRole);
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/addUserToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addUserToPrivilegeGroup - with fatal status', fakeAsync(() => {
    let userIdRole = new UserIdRole(userId, Role.CONTRIBUTOR);

    service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/addUserToPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(userIdRole);
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/addUserToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addUserToPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createUser(commonGroupId, 'Another', 'User').subscribe(
      addedUser => {
        expect(addedUser).toBeTruthy();
        service.addUserToPrivilegeGroup(addedUser.identification, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
          firstAddData => {
            expect(firstAddData).toBeTruthy();
            expect(firstAddData).toBeTrue();

            service.addUserToPrivilegeGroup(addedUser.identification, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
              secondAddData => {
                expect(secondAddData).toBeFalse();
              },
              e => expect(e).toBeFalsy());
          },
          e => expect(e).toBeFalsy()
        );
      },
      e => expect(e).toBeFalsy()
    );


    httpMock.expectNone(`//localhost:8080/user/addUserToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addUserToPrivilegeGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.addUserToPrivilegeGroup('anyId', privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding user anyId to privilege group ${privilegeGroupId} with role ${Role.CONTRIBUTOR} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/addUserToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addUserToPrivilegeGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.addUserToPrivilegeGroup(userId, 'anyId', Role.CONTRIBUTOR).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding user ${userId} to privilege group anyId with role ${Role.CONTRIBUTOR} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/addUserToPrivilegeGroup/anyId`);

    tick();
  }));




  /**
   * removeUserFromPrivilegeGroup
   */
  it('removeUserFromPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.removeUserFromPrivilegeGroup(userId, privilegeGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/removeUserFromPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual(userId);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/removeUserFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeUserFromPrivilegeGroup - with error status', fakeAsync(() => {
    service.removeUserFromPrivilegeGroup(userId, privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/removeUserFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(userId);
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/removeUserFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeUserFromPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.removeUserFromPrivilegeGroup(userId, privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/removeUserFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(userId);
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/removeUserFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeUserFromPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;

    service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.MANAGER).subscribe(
      addedData => {
        expect(addedData).toBeTruthy();
        service.removeUserFromPrivilegeGroup(userId, privilegeGroupId).subscribe(
          firstRemoveData => {
            expect(firstRemoveData).toBeTruthy();
            expect(firstRemoveData).toBeTrue();

            service.removeUserFromPrivilegeGroup(userId, privilegeGroupId).subscribe(
              secondRemoveData => {
                expect(secondRemoveData).toBeFalse();
              },
              e => expect(e).toBeFalsy());
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/user/removeUserFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeUserFromPrivilegeGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.removeUserFromPrivilegeGroup('anyId', privilegeGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing user anyId from privilege group ${privilegeGroupId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/removeUserFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeUserFromPrivilegeGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.removeUserFromPrivilegeGroup(userId, 'anyId').subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing user ${userId} from privilege group anyId at backend`);
      });

    httpMock.expectNone(`//localhost:8080/user/removeUserFromPrivilegeGroup/anyId`);

    tick();
  }));



  /**
   * countUsersAtPrivilegeGroup
   */
  it('countUsersAtPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countUsersAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/countUsersAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/countUsersAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('countUsersAtPrivilegeGroup - with error status', fakeAsync(() => {
    service.countUsersAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countUsersAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
      expect(req.request.method).toEqual("GET");
      expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countUsersAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('countUsersAtPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.countUsersAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countUsersAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
      expect(req.request.method).toEqual("GET");
      expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countUsersAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('countUsersAtPrivilegeGroup - mock with role', fakeAsync(() => {
    service.useMock = true;

    service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      addedData => {
        expect(addedData).toBeTrue();

        service.countUsersAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe(
          data => {
            expect(data).toEqual(1);
          },
          e => expect(e).toBeFalsy());

        service.countUsersAtPrivilegeGroup(privilegeGroupId, Role.MANAGER).subscribe(
          data => {
            expect(data).toEqual(0);
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );


    httpMock.expectNone(`//localhost:8080/user/countUsersAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    httpMock.expectNone(`//localhost:8080/user/countUsersAtPrivilegeGroup/${privilegeGroupId}?role=${Role.MANAGER}`);

    tick();
  }));

  it('countUsersAtPrivilegeGroup - mock without role', fakeAsync(() => {
    service.useMock = true;

    service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      addedData => {
        expect(addedData).toBeTrue();
        service.countUsersAtPrivilegeGroup(privilegeGroupId, undefined).subscribe(
          data => {
            expect(data).toEqual(1);
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );


    httpMock.expectNone(`//localhost:8080/user/countUsersAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));



  /**
   * getAllUsersFromPrivilegeGroup
   */
  it('getAllUsersFromPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('size')).toBeNull();
    expect(req.request.params.get('role')).toBeNull();
    expect(req.request.params.get('dissolveSubgroups')).toBeNull();
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));


  it('getAllUsersFromPrivilegeGroup - dissolve subgroups', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, true, undefined, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?dissolveSubgroups=true`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('size')).toBeNull();
    expect(req.request.params.get('role')).toBeNull();
    expect(req.request.params.get('dissolveSubgroups')).toEqual('true');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?dissolveSubgroups=true`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, undefined, undefined, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeTrue();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toBeNull();
    expect(req.request.params.get('dissolveSubgroups')).toBeNull();
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - with pageing and dissolve subgroups', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, true, undefined, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeTrue();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&dissolveSubgroups=true`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toBeNull();
    expect(req.request.params.get('dissolveSubgroups')).toEqual('true');

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&dissolveSubgroups=true`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - with pageing and role', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, undefined, Role.CONTRIBUTOR, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeTrue();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    expect(req.request.params.get('dissolveSubgroups')).toBeNull();
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - with pageing, role and dissolve subgroups', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, true, Role.CONTRIBUTOR, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeTrue();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    expect(req.request.params.get('dissolveSubgroups')).toEqual('true');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);

    tick();
  }));


  it('getAllUsersFromPrivilegeGroup - with role', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, undefined, Role.CONTRIBUTOR, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeTrue();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('size')).toBeNull();
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    expect(req.request.params.get('dissolveSubgroups')).toBeNull();
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - with role and dissolve subgroups', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, true, Role.CONTRIBUTOR, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeTrue();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('size')).toBeNull();
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    expect(req.request.params.get('dissolveSubgroups')).toEqual('true');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);

    tick();
  }));


  it('getAllUsersFromPrivilegeGroup - with error status', fakeAsync(() => {
    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getAllUsersFromPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - mock with role', fakeAsync(() => {
    service.useMock = true;
    baseGroupService.useMock = true;


    baseGroupService.createBaseGroup('subgroub').subscribe(
      createdSubBaseGroup => {
        baseGroupService.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.MANAGER).subscribe(
          addBaseGroup => {
            expect(addBaseGroup).toBeTrue();

            baseGroupService.addBaseToBaseGroup(createdSubBaseGroup.identification, baseGroupId).subscribe(
              addSubBaseGroup => {
                expect(addSubBaseGroup).toBeTrue();

                service.createUser(commonGroupId, 'sub', 'user').subscribe(
                  createdSubUser => {
                    service.addUserToBaseGroup(createdSubUser.identification, createdSubBaseGroup.identification).subscribe(
                      addSubUser => {
                        expect(addSubUser).toBeTrue();

                        service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
                          addUser => {
                            expect(addUser).toBeTrue();

                            service.getAllUsersFromPrivilegeGroup(privilegeGroupId, false, Role.CONTRIBUTOR, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(1);
                                expect(getAllData[0].identification).toEqual(userId);
                                expect(getAllData[0].isComplete).toBeTrue();
                                expect(getAllData[0].isGlobalAdmin).toBeFalse();
                              }, e => expect(e).toBeFalsy());

                            service.getAllUsersFromPrivilegeGroup(privilegeGroupId, false, Role.MANAGER, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(0);
                              }, e => expect(e).toBeFalsy());
                          }, e => expect(e).toBeFalsy());
                      }, e => expect(e).toBeFalsy());
                  }, e => expect(e).toBeFalsy());
              }, e => expect(e).toBeFalsy());
          }, e => expect(e).toBeFalsy());
      }, e => expect(e).toBeFalsy());

    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}&dissolveSubgroups=false`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - mock without role', fakeAsync(() => {
    service.useMock = true;
    baseGroupService.useMock = true;

    baseGroupService.createBaseGroup('subgroub').subscribe(
      createdSubBaseGroup => {
        baseGroupService.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.MANAGER).subscribe(
          addBaseGroup => {
            expect(addBaseGroup).toBeTrue();

            baseGroupService.addBaseToBaseGroup(createdSubBaseGroup.identification, baseGroupId).subscribe(
              addSubBaseGroup => {
                expect(addSubBaseGroup).toBeTrue();

                service.createUser(commonGroupId, 'sub', 'user').subscribe(
                  createdSubUser => {
                    service.addUserToBaseGroup(createdSubUser.identification, createdSubBaseGroup.identification).subscribe(
                      addSubUser => {
                        expect(addSubUser).toBeTrue();

                        service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
                          addUser => {
                            expect(addUser).toBeTrue();

                            service.getAllUsersFromPrivilegeGroup(privilegeGroupId, false, undefined, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(1);
                                expect(getAllData[0].identification).toEqual(userId);
                                expect(getAllData[0].isComplete).toBeTrue();
                                expect(getAllData[0].isGlobalAdmin).toBeFalse();
                              }, e => expect(e).toBeFalsy());

                          }, e => expect(e).toBeFalsy());
                      }, e => expect(e).toBeFalsy());
                  }, e => expect(e).toBeFalsy());
              }, e => expect(e).toBeFalsy());
          }, e => expect(e).toBeFalsy());
      }, e => expect(e).toBeFalsy());


    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}&dissolveSubgroups=false`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - mock with role and dissolve subgroups', fakeAsync(() => {
    service.useMock = true;
    baseGroupService.useMock = true;


    baseGroupService.createBaseGroup('subgroub').subscribe(
      createdSubBaseGroup => {
        baseGroupService.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
          addBaseGroup => {
            expect(addBaseGroup).toBeTrue();

            baseGroupService.addBaseToBaseGroup(createdSubBaseGroup.identification, baseGroupId).subscribe(
              addSubBaseGroup => {
                expect(addSubBaseGroup).toBeTrue();

                service.createUser(commonGroupId, 'sub', 'user').subscribe(
                  createdSubUser => {
                    service.addUserToBaseGroup(createdSubUser.identification, createdSubBaseGroup.identification).subscribe(
                      addSubUser => {
                        expect(addSubUser).toBeTrue();

                        service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
                          addUser => {
                            expect(addUser).toBeTrue();

                            service.getAllUsersFromPrivilegeGroup(privilegeGroupId, true, Role.CONTRIBUTOR, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(2);
                                expect(getAllData[0].identification).toEqual(userId);
                                expect(getAllData[0].isComplete).toBeTrue();
                                expect(getAllData[0].isGlobalAdmin).toBeFalse();
                                expect(getAllData[1].identification).toEqual(createdSubUser.identification);
                                expect(getAllData[1].isComplete).toBeTrue();
                                expect(getAllData[1].isGlobalAdmin).toBeFalse();
                              }, e => expect(e).toBeFalsy());

                            service.getAllUsersFromPrivilegeGroup(privilegeGroupId, true, Role.MANAGER, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(0);
                              }, e => expect(e).toBeFalsy());
                          }, e => expect(e).toBeFalsy());
                      }, e => expect(e).toBeFalsy());
                  }, e => expect(e).toBeFalsy());
              }, e => expect(e).toBeFalsy());
          }, e => expect(e).toBeFalsy());
      }, e => expect(e).toBeFalsy());

    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);

    tick();
  }));

  it('getAllUsersFromPrivilegeGroup - mock without role and dissolve subgroups', fakeAsync(() => {
    service.useMock = true;
    baseGroupService.useMock = true;

    baseGroupService.createBaseGroup('subgroub').subscribe(
      createdSubBaseGroup => {
        baseGroupService.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.MANAGER).subscribe(
          addBaseGroup => {
            expect(addBaseGroup).toBeTrue();

            baseGroupService.addBaseToBaseGroup(createdSubBaseGroup.identification, baseGroupId).subscribe(
              addSubBaseGroup => {
                expect(addSubBaseGroup).toBeTrue();

                service.createUser(commonGroupId, 'sub', 'user').subscribe(
                  createdSubUser => {
                    service.addUserToBaseGroup(createdSubUser.identification, createdSubBaseGroup.identification).subscribe(
                      addSubUser => {
                        expect(addSubUser).toBeTrue();

                        service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
                          addUser => {
                            expect(addUser).toBeTrue();

                            service.getAllUsersFromPrivilegeGroup(privilegeGroupId, true, undefined, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(2);
                                expect(getAllData[0].identification).toEqual(userId);
                                expect(getAllData[0].isComplete).toBeTrue();
                                expect(getAllData[0].isGlobalAdmin).toBeFalse();
                                expect(getAllData[1].identification).toEqual(createdSubUser.identification);
                                expect(getAllData[1].isComplete).toBeTrue();
                                expect(getAllData[1].isGlobalAdmin).toBeFalse();
                              }, e => expect(e).toBeFalsy());

                          }, e => expect(e).toBeFalsy());
                      }, e => expect(e).toBeFalsy());
                  }, e => expect(e).toBeFalsy());
              }, e => expect(e).toBeFalsy());
          }, e => expect(e).toBeFalsy());
      }, e => expect(e).toBeFalsy());


    httpMock.expectNone(`//localhost:8080/user/getAllUsersFromPrivilegeGroup/${privilegeGroupId}&dissolveSubgroups=true`);

    tick();
  }));





  /**
   * getAllUserPartsFromPrivilegeGroup
   */
  it('getAllUserPartsFromPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('size')).toBeNull();
    expect(req.request.params.get('role')).toBeNull();
    expect(req.request.params.get('dissolveSubgroups')).toBeNull();
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));


  it('getAllUserPartsFromPrivilegeGroup - dissolve subgroups', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, true, undefined, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?dissolveSubgroups=true`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('size')).toBeNull();
    expect(req.request.params.get('role')).toBeNull();
    expect(req.request.params.get('dissolveSubgroups')).toEqual('true');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?dissolveSubgroups=true`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, undefined, undefined, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeFalse();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toBeNull();
    expect(req.request.params.get('dissolveSubgroups')).toBeNull();
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - with pageing and dissolve subgroups', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, true, undefined, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeFalse();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&dissolveSubgroups=true`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toBeNull();
    expect(req.request.params.get('dissolveSubgroups')).toEqual('true');

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&dissolveSubgroups=true`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - with pageing and role', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, undefined, Role.CONTRIBUTOR, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeFalse();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    expect(req.request.params.get('dissolveSubgroups')).toBeNull();
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - with pageing, role and dissolve subgroups', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, true, Role.CONTRIBUTOR, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeFalse();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    expect(req.request.params.get('dissolveSubgroups')).toEqual('true');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);

    tick();
  }));


  it('getAllUserPartsFromPrivilegeGroup - with role', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, undefined, Role.CONTRIBUTOR, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('size')).toBeNull();
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    expect(req.request.params.get('dissolveSubgroups')).toBeNull();
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - with role and dissolve subgroups', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, true, Role.CONTRIBUTOR, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUser.identification);
      expect(data[0].isComplete).toBeFalse();
      expect(data[0].isGlobalAdmin).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('size')).toBeNull();
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    expect(req.request.params.get('dissolveSubgroups')).toEqual('true');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);

    tick();
  }));


  it('getAllUserPartsFromPrivilegeGroup - with error status', fakeAsync(() => {
    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - mock with role', fakeAsync(() => {
    service.useMock = true;
    baseGroupService.useMock = true;


    baseGroupService.createBaseGroup('subgroub').subscribe(
      createdSubBaseGroup => {
        baseGroupService.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.MANAGER).subscribe(
          addBaseGroup => {
            expect(addBaseGroup).toBeTrue();

            baseGroupService.addBaseToBaseGroup(createdSubBaseGroup.identification, baseGroupId).subscribe(
              addSubBaseGroup => {
                expect(addSubBaseGroup).toBeTrue();

                service.createUser(commonGroupId, 'sub', 'user').subscribe(
                  createdSubUser => {
                    service.addUserToBaseGroup(createdSubUser.identification, createdSubBaseGroup.identification).subscribe(
                      addSubUser => {
                        expect(addSubUser).toBeTrue();

                        service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
                          addUser => {
                            expect(addUser).toBeTrue();

                            service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, false, Role.CONTRIBUTOR, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(1);
                                expect(getAllData[0].identification).toEqual(userId);
                                expect(getAllData[0].isComplete).toBeFalse();
                                expect(getAllData[0].isGlobalAdmin).toBeFalse();
                              }, e => expect(e).toBeFalsy());

                            service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, false, Role.MANAGER, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(0);
                              }, e => expect(e).toBeFalsy());
                          }, e => expect(e).toBeFalsy());
                      }, e => expect(e).toBeFalsy());
                  }, e => expect(e).toBeFalsy());
              }, e => expect(e).toBeFalsy());
          }, e => expect(e).toBeFalsy());
      }, e => expect(e).toBeFalsy());

    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}&dissolveSubgroups=false`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - mock without role', fakeAsync(() => {
    service.useMock = true;
    baseGroupService.useMock = true;

    baseGroupService.createBaseGroup('subgroub').subscribe(
      createdSubBaseGroup => {
        baseGroupService.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.MANAGER).subscribe(
          addBaseGroup => {
            expect(addBaseGroup).toBeTrue();

            baseGroupService.addBaseToBaseGroup(createdSubBaseGroup.identification, baseGroupId).subscribe(
              addSubBaseGroup => {
                expect(addSubBaseGroup).toBeTrue();

                service.createUser(commonGroupId, 'sub', 'user').subscribe(
                  createdSubUser => {
                    service.addUserToBaseGroup(createdSubUser.identification, createdSubBaseGroup.identification).subscribe(
                      addSubUser => {
                        expect(addSubUser).toBeTrue();

                        service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
                          addUser => {
                            expect(addUser).toBeTrue();

                            service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, false, undefined, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(1);
                                expect(getAllData[0].identification).toEqual(userId);
                                expect(getAllData[0].isComplete).toBeFalse();
                                expect(getAllData[0].isGlobalAdmin).toBeFalse();
                              }, e => expect(e).toBeFalsy());

                          }, e => expect(e).toBeFalsy());
                      }, e => expect(e).toBeFalsy());
                  }, e => expect(e).toBeFalsy());
              }, e => expect(e).toBeFalsy());
          }, e => expect(e).toBeFalsy());
      }, e => expect(e).toBeFalsy());


    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}&dissolveSubgroups=false`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - mock with role and dissolve subgroups', fakeAsync(() => {
    service.useMock = true;
    baseGroupService.useMock = true;


    baseGroupService.createBaseGroup('subgroub').subscribe(
      createdSubBaseGroup => {
        baseGroupService.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
          addBaseGroup => {
            expect(addBaseGroup).toBeTrue();

            baseGroupService.addBaseToBaseGroup(createdSubBaseGroup.identification, baseGroupId).subscribe(
              addSubBaseGroup => {
                expect(addSubBaseGroup).toBeTrue();

                service.createUser(commonGroupId, 'sub', 'user').subscribe(
                  createdSubUser => {
                    service.addUserToBaseGroup(createdSubUser.identification, createdSubBaseGroup.identification).subscribe(
                      addSubUser => {
                        expect(addSubUser).toBeTrue();

                        service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
                          addUser => {
                            expect(addUser).toBeTrue();

                            service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, true, Role.CONTRIBUTOR, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(2);
                                expect(getAllData[0].identification).toEqual(userId);
                                expect(getAllData[0].isComplete).toBeFalse();
                                expect(getAllData[0].isGlobalAdmin).toBeFalse();
                                expect(getAllData[1].identification).toEqual(createdSubUser.identification);
                                expect(getAllData[1].isComplete).toBeFalse();
                                expect(getAllData[1].isGlobalAdmin).toBeFalse();
                              }, e => expect(e).toBeFalsy());

                            service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, true, Role.MANAGER, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(0);
                              }, e => expect(e).toBeFalsy());
                          }, e => expect(e).toBeFalsy());
                      }, e => expect(e).toBeFalsy());
                  }, e => expect(e).toBeFalsy());
              }, e => expect(e).toBeFalsy());
          }, e => expect(e).toBeFalsy());
      }, e => expect(e).toBeFalsy());

    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}&dissolveSubgroups=true`);

    tick();
  }));

  it('getAllUserPartsFromPrivilegeGroup - mock without role and dissolve subgroups', fakeAsync(() => {
    service.useMock = true;
    baseGroupService.useMock = true;

    baseGroupService.createBaseGroup('subgroub').subscribe(
      createdSubBaseGroup => {
        baseGroupService.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.MANAGER).subscribe(
          addBaseGroup => {
            expect(addBaseGroup).toBeTrue();

            baseGroupService.addBaseToBaseGroup(createdSubBaseGroup.identification, baseGroupId).subscribe(
              addSubBaseGroup => {
                expect(addSubBaseGroup).toBeTrue();

                service.createUser(commonGroupId, 'sub', 'user').subscribe(
                  createdSubUser => {
                    service.addUserToBaseGroup(createdSubUser.identification, createdSubBaseGroup.identification).subscribe(
                      addSubUser => {
                        expect(addSubUser).toBeTrue();

                        service.addUserToPrivilegeGroup(userId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
                          addUser => {
                            expect(addUser).toBeTrue();

                            service.getAllUserPartsFromPrivilegeGroup(privilegeGroupId, true, undefined, undefined, undefined).subscribe(
                              getAllData => {
                                expect(getAllData).toBeTruthy();
                                expect(getAllData.length).toEqual(2);
                                expect(getAllData[0].identification).toEqual(userId);
                                expect(getAllData[0].isComplete).toBeFalse();
                                expect(getAllData[0].isGlobalAdmin).toBeFalse();
                                expect(getAllData[1].identification).toEqual(createdSubUser.identification);
                                expect(getAllData[1].isComplete).toBeFalse();
                                expect(getAllData[1].isGlobalAdmin).toBeFalse();
                              }, e => expect(e).toBeFalsy());

                          }, e => expect(e).toBeFalsy());
                      }, e => expect(e).toBeFalsy());
                  }, e => expect(e).toBeFalsy());
              }, e => expect(e).toBeFalsy());
          }, e => expect(e).toBeFalsy());
      }, e => expect(e).toBeFalsy());


    httpMock.expectNone(`//localhost:8080/user/getAllUserPartsFromPrivilegeGroup/${privilegeGroupId}&dissolveSubgroups=true`);

    tick();
  }));





  /**
   * countAvailableUsersForPrivilegeGroup
   */
  it('countAvailableUsersForPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countAvailableUsersForPrivilegeGroup(privilegeGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/countAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/countAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('countAvailableUsersForPrivilegeGroup - with error status', fakeAsync(() => {
    service.countAvailableUsersForPrivilegeGroup(privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('countAvailableUsersForPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.countAvailableUsersForPrivilegeGroup(privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/countAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/countAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('countAvailableUsersForPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;

    service.countAvailableUsersForPrivilegeGroup(privilegeGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(1);
    });
    service.addUserToMock(secondUser, commonGroupId);

    service.countAvailableUsersForPrivilegeGroup(privilegeGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(2);
    });

    httpMock.expectNone(`//localhost:8080/user/countAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));





  /**
   * getAvailableUsersForPrivilegeGroup
   */
  it('getAvailableUsersForPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAvailableUsersForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(userId);
      expect(data[0].isGlobalAdmin).toBeFalse();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAvailableUsersForPrivilegeGroup - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAvailableUsersForPrivilegeGroup(privilegeGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(userId);
      expect(data[0].isGlobalAdmin).toBeFalse();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAvailableUsersForPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAvailableUsersForPrivilegeGroup - with error status', fakeAsync(() => {
    service.getAvailableUsersForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAvailableUsersForPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getAvailableUsersForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAvailableUsersForPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAvailableUsersForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(1);
        expect(getAllData[0].identification).toEqual(userId);
        expect(getAllData[0].isGlobalAdmin).toBeFalse();
        expect(getAllData[0].isComplete).toBeTrue();
      },
      e => expect(e).toBeFalsy()
    );

    service.addUserToMock(secondUser, commonGroupId);

    service.getAvailableUsersForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(2);
        expect(getAllData[0].identification).toEqual(userId);
        expect(getAllData[0].isGlobalAdmin).toBeFalse();
        expect(getAllData[0].isComplete).toBeTrue();
        expect(getAllData[1].identification).toEqual(secondUserId);
        expect(getAllData[1].isGlobalAdmin).toBeFalse();
        expect(getAllData[1].isComplete).toBeTrue();
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/user/getAvailableUsersForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));




  /**
   * getAvailableUserPartsForPrivilegeGroup
   */
  it('getAvailableUserPartsForPrivilegeGroup - all ok', fakeAsync(() => {
    mockIUser.image = undefined;
    mockIUser.smallImage = undefined;
    mockIUser.lastLogin = undefined;
    mockIUser.validFrom = undefined;
    mockIUser.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAvailableUserPartsForPrivilegeGroup(baseGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkUserPart(data[0], userId);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAvailableUserPartsForPrivilegeGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForPrivilegeGroup/${baseGroupId}`);

    tick();
  }));

  it('getAvailableUserPartsForPrivilegeGroup - with pageing', fakeAsync(() => {
    mockIUser.image = undefined;
    mockIUser.smallImage = undefined;
    mockIUser.lastLogin = undefined;
    mockIUser.validFrom = undefined;
    mockIUser.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUser],
      status: Status.OK,
      messages: []
    }

    service.getAvailableUserPartsForPrivilegeGroup(baseGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkUserPart(data[0], userId);
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getAvailableUserPartsForPrivilegeGroup/${baseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForPrivilegeGroup/${baseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAvailableUserPartsForPrivilegeGroup - with error status', fakeAsync(() => {
    service.getAvailableUserPartsForPrivilegeGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAvailableUserPartsForPrivilegeGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForPrivilegeGroup/${baseGroupId}`);

    tick();
  }));

  it('getAvailableUserPartsForPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getAvailableUserPartsForPrivilegeGroup(baseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getAvailableUserPartsForPrivilegeGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForPrivilegeGroup/${baseGroupId}`);

    tick();
  }));

  it('getAvailableUserPartsForPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAvailableUserPartsForPrivilegeGroup(baseGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(1);
        expect(getAllData[0].identification).toEqual(userId);
        expect(getAllData[0].isGlobalAdmin).toBeFalse();
        expect(getAllData[0].isComplete).toBeFalse();
      },
      e => expect(e).toBeFalsy()
    );

    service.addUserToMock(secondUser, commonGroupId);

    service.getAvailableUserPartsForPrivilegeGroup(baseGroupId, undefined, undefined).subscribe(
      getAllData => {
        expect(getAllData).toBeTruthy();
        expect(getAllData.length).toEqual(2);
        expect(getAllData[0].identification).toEqual(userId);
        expect(getAllData[0].isGlobalAdmin).toBeFalse();
        expect(getAllData[0].isComplete).toBeFalse();
        expect(getAllData[1].identification).toEqual(secondUserId);
        expect(getAllData[1].isGlobalAdmin).toBeFalse();
        expect(getAllData[1].isComplete).toBeFalse();
      },
      e => expect(e).toBeFalsy()
    );
    httpMock.expectNone(`//localhost:8080/user/getAvailableUserPartsForPrivilegeGroup/${baseGroupId}`);

    tick();
  }));



});


function checkUserPart(user: User, identification: string) {
  expect(user.identification).toEqual(identification);
  expect(user.image).toBeUndefined();
  expect(user.smallImage).toBeUndefined();
  expect(user.lastLogin).toBeUndefined();
  expect(user.validFrom).toBeUndefined();
  expect(user.validTo).toBeUndefined();
  expect(user.isComplete).toBeFalse();
  expect(user.isGlobalAdmin).toBeFalse();
}

function checkUserPartWithName(user: User, identification: string, firstName: string, lastName: string) {
  checkUserPart(user, identification);
  expect(user.firstName).toEqual(firstName);
  expect(user.lastName).toEqual(lastName);
}
