import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Config } from '../../config/config';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Status } from '../../model/status.model';
import { ConfigService } from '../../config/config.service';
import { BaseBackendService, RETRIES } from '../base/base-backend.service';
import { PrivilegeGroup, IPrivilegeGroup } from '../../model/privilege-group.model';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { Role } from '../../model/role.model';
import { CommonGroupService, INITIAL_COMMON_GROUP_ID_AT_MOCK } from './common-group.service';
import { AdminService } from './admin.service';
import { UserService } from './user.service';
import { SelectionService } from '../util/selection.service';

import { PrivilegeGroupService } from './privilege-group.service';


describe('PrivilegeGroupService', () => {
  let service: PrivilegeGroupService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let selectionService: SelectionService;

  let getSelectedCommonGroupSpy: jasmine.Spy<() => CommonGroup | undefined>;


  const privilegeGroupId = 'PGAA00001';
  const privilegeGroupName = 'Name of the group';
  const otherPrivilegeGroupId = 'PGAA00002';
  const commonGroupId = INITIAL_COMMON_GROUP_ID_AT_MOCK;

  const mockConfig: Config =
  {
    clientId: 'ape.user.ui',
    backendBaseUrl: '//localhost:8080',
    adminGroupId: 'AGAA00001'
  };

  let mockIPrivilegeGroup: IPrivilegeGroup;
  let modifiedPrivilegeGroup: PrivilegeGroup;
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
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    commonGroupService = TestBed.inject(CommonGroupService);
    selectionService = TestBed.inject(SelectionService);

    initMockData();

    service = TestBed.inject(PrivilegeGroupService);
  });


  function initMockData() {
    BaseBackendService.clearMockData();

    mockIPrivilegeGroup = {
      description: 'some description',
      groupName: privilegeGroupName,
      identification: privilegeGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isComplete: true
    } as IPrivilegeGroup;

    modifiedPrivilegeGroup = PrivilegeGroup.map({
      description: 'some description',
      groupName: privilegeGroupName,
      identification: privilegeGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined
    } as IPrivilegeGroup);

    mockCommonGroup = CommonGroup.map({
      description: 'some description',
      groupName: 'commonGroupName',
      identification: commonGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      defaultRole: Role.VISITOR
    } as ICommonGroup)

    spyOn(configService, 'getConfig').and.returnValue(mockConfig);
    getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(mockCommonGroup);
  }


  it('should be created', () => {
    expect(service).toBeTruthy();
  });



  /**
   * getPrivilegeGroup
   */
  it('getPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIPrivilegeGroup,
      status: Status.OK,
      messages: []
    }

    service.getPrivilegeGroup(privilegeGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(mockIPrivilegeGroup.description);
      expect(data.groupName).toEqual(mockIPrivilegeGroup.groupName);
      expect(data.identification).toEqual(mockIPrivilegeGroup.identification);
      expect(data.validFrom).toEqual(mockIPrivilegeGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/privilege/getPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/privilege/getPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getPrivilegeGroup - with error status', fakeAsync(() => {
    service.getPrivilegeGroup(privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/getPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/getPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getPrivilegeGroup(privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/getPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/getPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getPrivilegeGroup(privilegeGroupId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data.identification).toEqual(privilegeGroupId);
      });

    httpMock.expectNone(`//localhost:8080/group/privilege/getPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getPrivilegeGroup - mock, but no common group selected', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);
    service.getPrivilegeGroup(privilegeGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while getting privilege group ${privilegeGroupId} from backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/privilege/getPrivilegeGroup/someId`);

    tick();
  }));

  it('getPrivilegeGroup - mock with error', fakeAsync(() => {
    service.useMock = true;
    service.getPrivilegeGroup('someId').subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while getting privilege group someId from backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/privilege/getPrivilegeGroup/someId`);

    tick();
  }));





  /**
   * getAllPrivilegeGroups
   */
  it('getAllPrivilegeGroups - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIPrivilegeGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllPrivilegeGroups(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIPrivilegeGroup.identification);
      expect(data[0].groupName).toEqual(mockIPrivilegeGroup.groupName);
      expect(data[0].description).toEqual(mockIPrivilegeGroup.description);
      expect(data[0].validFrom).toEqual(mockIPrivilegeGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/privilege/getAllPrivilegeGroups/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroups/${commonGroupId}`);

    tick();
  }));

  it('getAllPrivilegeGroups - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIPrivilegeGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllPrivilegeGroups(1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIPrivilegeGroup.identification);
      expect(data[0].groupName).toEqual(mockIPrivilegeGroup.groupName);
      expect(data[0].description).toEqual(mockIPrivilegeGroup.description);
      expect(data[0].validFrom).toEqual(mockIPrivilegeGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/privilege/getAllPrivilegeGroups/${commonGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroups/${commonGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllPrivilegeGroups - with error status', fakeAsync(() => {
    service.getAllPrivilegeGroups(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/getAllPrivilegeGroups/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroups/${commonGroupId}`);

    tick();
  }));

  it('getAllPrivilegeGroups - with fatal status', fakeAsync(() => {
    service.getAllPrivilegeGroups(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/getAllPrivilegeGroups/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroups/${commonGroupId}`);

    tick();
  }));

  it('getAllPrivilegeGroups - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllPrivilegeGroups(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(privilegeGroupId);
      expect(data[0].isComplete).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroups/${commonGroupId}`);

    tick();
  }));





  /**
   * getAllPrivilegeGroupParts
   */
  it('getAllPrivilegeGroupParts - all ok', fakeAsync(() => {
    mockIPrivilegeGroup.description = undefined;
    mockIPrivilegeGroup.validFrom = undefined;
    mockIPrivilegeGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIPrivilegeGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllPrivilegeGroupParts(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIPrivilegeGroup.identification);
      expect(data[0].groupName).toEqual(mockIPrivilegeGroup.groupName);
      expect(data[0].description).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/privilege/getAllPrivilegeGroupParts/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroupParts/${commonGroupId}`);

    tick();
  }));

  it('getAllPrivilegeGroupParts - with pageing', fakeAsync(() => {
    mockIPrivilegeGroup.description = undefined;
    mockIPrivilegeGroup.validFrom = undefined;
    mockIPrivilegeGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIPrivilegeGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllPrivilegeGroupParts(1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIPrivilegeGroup.identification);
      expect(data[0].groupName).toEqual(mockIPrivilegeGroup.groupName);
      expect(data[0].description).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/privilege/getAllPrivilegeGroupParts/${commonGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroupParts/${commonGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllPrivilegeGroupParts - with error status', fakeAsync(() => {
    service.getAllPrivilegeGroupParts(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/getAllPrivilegeGroupParts/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroupParts/${commonGroupId}`);

    tick();
  }));

  it('getAllPrivilegeGroupParts - with fatal status', fakeAsync(() => {
    service.getAllPrivilegeGroupParts(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/getAllPrivilegeGroupParts/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroupParts/${commonGroupId}`);

    tick();
  }));

  it('getAllPrivilegeGroupParts - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllPrivilegeGroupParts(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(privilegeGroupId);
      expect(data[0].description).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    httpMock.expectNone(`//localhost:8080/group/privilege/getAllPrivilegeGroupParts/${commonGroupId}`);

    tick();
  }));




  /**
   * countPrivilegeGroups
   */
  it('countPrivilegeGroups - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countPrivilegeGroups(commonGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/privilege/countPrivilegeGroups/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/privilege/countPrivilegeGroups/${commonGroupId}`);

    tick();
  }));

  it('countPrivilegeGroups - with error status', fakeAsync(() => {
    service.countPrivilegeGroups(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/countPrivilegeGroups/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/countPrivilegeGroups/${commonGroupId}`);

    tick();
  }));

  it('countPrivilegeGroups - with fatal status', fakeAsync(() => {
    service.countPrivilegeGroups(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/countPrivilegeGroups/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/countPrivilegeGroups/${commonGroupId}`);

    tick();
  }));

  it('countPrivilegeGroups - mock', fakeAsync(() => {
    service.useMock = true;
    service.countPrivilegeGroups(commonGroupId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data).toEqual(1);
      });

    httpMock.expectNone(`//localhost:8080/group/privilege/countPrivilegeGroups/${commonGroupId}`);

    tick();
  }));




  /**
   * createPrivilegeGroup
   */
  it('createPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIPrivilegeGroup,
      status: Status.OK,
      messages: []
    }

    service.createPrivilegeGroup(privilegeGroupName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(mockIPrivilegeGroup.description);
      expect(data.groupName).toEqual(mockIPrivilegeGroup.groupName);
      expect(data.identification).toEqual(mockIPrivilegeGroup.identification);
      expect(data.validFrom).toEqual(mockIPrivilegeGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/privilege/createPrivilegeGroup`);
    expect(req.request.method).toEqual("POST");
    expect(req.request.body).toEqual(`groupName=${privilegeGroupName}&commonGroupIdentification=${commonGroupId}`)
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/privilege/createPrivilegeGroup`);

    tick();
  }));

  it('createPrivilegeGroup - with error status', fakeAsync(() => {
    service.createPrivilegeGroup(privilegeGroupName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/createPrivilegeGroup`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`groupName=${privilegeGroupName}&commonGroupIdentification=${commonGroupId}`)
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/createPrivilegeGroup`);

    tick();
  }));

  it('createPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.createPrivilegeGroup(privilegeGroupName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/createPrivilegeGroup`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`groupName=${privilegeGroupName}&commonGroupIdentification=${commonGroupId}`)
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/createPrivilegeGroup`);

    tick();
  }));

  it('createPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createPrivilegeGroup(privilegeGroupName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual('PGAA00002');
      expect(data.groupName).toEqual(privilegeGroupName);
    });

    httpMock.expectNone(`//localhost:8080/group/privilege/createPrivilegeGroup`);

    tick();
  }));

  it('createPrivilegeGroup - mock, but no common group selected', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);
    service.createPrivilegeGroup(privilegeGroupName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while creating privilege group at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/privilege/createPrivilegeGroup`);

    tick();
  }));




  /**
   * deletePrivilegeGroup
   */
  it('deletePrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.deletePrivilegeGroup(privilegeGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/privilege/deletePrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("DELETE");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/privilege/deletePrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('deletePrivilegeGroup - with error status', fakeAsync(() => {
    service.deletePrivilegeGroup(privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/deletePrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/deletePrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('deletePrivilegeGroup - with fatal status', fakeAsync(() => {
    service.deletePrivilegeGroup(privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/deletePrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/deletePrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('deletePrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.deletePrivilegeGroup(privilegeGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/group/privilege/deletePrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('deletePrivilegeGroup - mock non existing', fakeAsync(() => {
    service.useMock = true;
    service.deletePrivilegeGroup('someId').subscribe(data => {
      expect(data).toBeFalse();
    });

    httpMock.expectNone(`//localhost:8080/group/privilege/deletePrivilegeGroup/someId`);

    tick();
  }));

  it('deletePrivilegeGroup - mock, but no common group selected', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);
    service.deletePrivilegeGroup(privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while deleting privilege group ${privilegeGroupId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/privilege/deletePrivilegeGroup/someId`);

    tick();
  }));




  /**
   * updatePrivilegeGroup
   */
  it('updatePrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIPrivilegeGroup,
      status: Status.OK,
      messages: []
    }

    service.updatePrivilegeGroup(modifiedPrivilegeGroup).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(modifiedPrivilegeGroup.description);
      expect(data.groupName).toEqual(modifiedPrivilegeGroup.groupName);
      expect(data.identification).toEqual(modifiedPrivilegeGroup.identification);
      expect(data.validFrom).toEqual(modifiedPrivilegeGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });


    const req = httpMock.expectOne(`//localhost:8080/group/privilege/updatePrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("PUT");
    expect(req.request.body).toEqual(modifiedPrivilegeGroup);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/privilege/updatePrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('updatePrivilegeGroup - with error status', fakeAsync(() => {
    service.updatePrivilegeGroup(modifiedPrivilegeGroup).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/updatePrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/updatePrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('updatePrivilegeGroup - with fatal status', fakeAsync(() => {
    service.updatePrivilegeGroup(modifiedPrivilegeGroup).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/privilege/updatePrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/privilege/updatePrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('updatePrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.updatePrivilegeGroup(modifiedPrivilegeGroup).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(modifiedPrivilegeGroup.identification);
      expect(data.description).toEqual(modifiedPrivilegeGroup.description);
      expect(data.groupName).toEqual(modifiedPrivilegeGroup.groupName);
      expect(data.identification).toEqual(modifiedPrivilegeGroup.identification);
      expect(data.validFrom).toEqual(modifiedPrivilegeGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    httpMock.expectNone(`//localhost:8080/group/privilege/updatePrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('updatePrivilegeGroup - mock with error', fakeAsync(() => {
    service.useMock = true;
    let otherModifiedPrivilegeGroup: PrivilegeGroup = Object.assign({}, modifiedPrivilegeGroup);
    otherModifiedPrivilegeGroup.identification = 'someId';
    service.updatePrivilegeGroup(otherModifiedPrivilegeGroup).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating privilege group someId at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/privilege/updatePrivilegeGroup/someId`);

    tick();
  }));

  it('updatePrivilegeGroup - mock, but no common group selected', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);

    service.updatePrivilegeGroup(modifiedPrivilegeGroup).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating privilege group ${privilegeGroupId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/privilege/updatePrivilegeGroup/someId`);

    tick();
  }));


});
