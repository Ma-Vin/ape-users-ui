import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Config } from '../../config/config';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Status } from '../../model/status.model';
import { BaseGroupIdRole } from '../../model/base-group-id-role.model';
import { ConfigService } from '../../config/config.service';
import { BaseBackendService, RETRIES } from '../base/base-backend.service';
import { INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK } from './privilege-group.service';
import { BaseGroup, IBaseGroup } from '../../model/base-group.model';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { Role } from '../../model/role.model';
import { CommonGroupService, INITIAL_COMMON_GROUP_ID_AT_MOCK } from './common-group.service';
import { AdminService } from './admin.service';
import { INITIAL_USER_ID_AT_MOCK, UserService } from './user.service';
import { SelectionService } from '../util/selection.service';

import { BaseGroupService } from './base-group.service';
import { ChangeType, IHistoryChange } from 'src/app/model/history-change.model';
import { IBaseGroupRole } from 'src/app/model/base-group-role';


describe('BaseGroupService', () => {
  let service: BaseGroupService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let selectionService: SelectionService;

  let getSelectedCommonGroupSpy: jasmine.Spy<() => CommonGroup | undefined>;


  const baseGroupId = 'BGAA00001';
  const baseGroupName = 'Name of the group';
  const otherBaseGroupId = 'BGAA00002';
  const commonGroupId = INITIAL_COMMON_GROUP_ID_AT_MOCK;
  const privilegeGroupId = INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK;
  const userId = INITIAL_USER_ID_AT_MOCK;

  const mockConfig: Config =
  {
    clientId: 'ape.user.ui',
    backendBaseUrl: '//localhost:8080',
    adminGroupId: 'AGAA00001'
  };

  let mockIBaseGroup: IBaseGroup;
  let modifiedBaseGroup: BaseGroup;
  let otherBaseGroup: BaseGroup;
  let mockCommonGroup: CommonGroup;
  let historyChange: IHistoryChange;

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

    service = TestBed.inject(BaseGroupService);
  });


  function initMockData() {
    BaseBackendService.clearMockData();

    mockIBaseGroup = {
      description: 'some description',
      groupName: baseGroupName,
      identification: baseGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isComplete: true
    } as IBaseGroup;

    modifiedBaseGroup = BaseGroup.map({
      description: 'some description',
      groupName: baseGroupName,
      identification: baseGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined
    } as IBaseGroup);

    otherBaseGroup = BaseGroup.map({
      description: 'some description',
      groupName: baseGroupName + '2',
      identification: otherBaseGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined
    } as IBaseGroup);

    mockCommonGroup = CommonGroup.map({
      description: 'some description',
      groupName: 'commonGroupName',
      identification: commonGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      defaultRole: Role.VISITOR
    } as ICommonGroup);

    historyChange = {
      action: undefined,
      changeTime: new Date(2022, 4, 10, 11, 8, 1),
      changeType: ChangeType.CREATE,
      editor: userId,
      subjectIdentification: baseGroupId,
      targetIdentification: undefined
    } as IHistoryChange;

    spyOn(configService, 'getConfig').and.returnValue(mockConfig);
    getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(mockCommonGroup);
  }


  it('should be created', () => {
    expect(service).toBeTruthy();
  });



  /**
   * getBaseGroup
   */
  it('getBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIBaseGroup,
      status: Status.OK,
      messages: []
    }

    service.getBaseGroup(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(mockIBaseGroup.description);
      expect(data.groupName).toEqual(mockIBaseGroup.groupName);
      expect(data.identification).toEqual(mockIBaseGroup.identification);
      expect(data.validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getBaseGroup - with error status', fakeAsync(() => {
    service.getBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getBaseGroup - with fatal status', fakeAsync(() => {
    service.getBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getBaseGroup(baseGroupId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data.identification).toEqual(baseGroupId);
      });

    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('getBaseGroup - mock, but no common group selected', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);
    service.getBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while getting base group ${baseGroupId} from backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroup/someId`);

    tick();
  }));

  it('getBaseGroup - mock with error', fakeAsync(() => {
    service.useMock = true;
    service.getBaseGroup('someId').subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while getting base group someId from backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroup/someId`);

    tick();
  }));





  /**
   * getAllBaseGroups
   */
  it('getAllBaseGroups - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllBaseGroups(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroups/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups/${commonGroupId}`);

    tick();
  }));

  it('getAllBaseGroups - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllBaseGroups(1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroups/${commonGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups/${commonGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllBaseGroups - with error status', fakeAsync(() => {
    service.getAllBaseGroups(undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroups/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups/${commonGroupId}`);

    tick();
  }));

  it('getAllBaseGroups - with fatal status', fakeAsync(() => {
    service.getAllBaseGroups(undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroups/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups/${commonGroupId}`);

    tick();
  }));

  it('getAllBaseGroups - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllBaseGroups(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(baseGroupId);
      expect(data[0].isComplete).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups/${commonGroupId}`);

    tick();
  }));





  /**
   * getAllBaseGroupParts
   */
  it('getAllBaseGroupParts - all ok', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllBaseGroupParts(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroupParts/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts/${commonGroupId}`);

    tick();
  }));

  it('getAllBaseGroupParts - with pageing', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllBaseGroupParts(1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroupParts/${commonGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts/${commonGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllBaseGroupParts - with error status', fakeAsync(() => {
    service.getAllBaseGroupParts(undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroupParts/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts/${commonGroupId}`);

    tick();
  }));

  it('getAllBaseGroupParts - with fatal status', fakeAsync(() => {
    service.getAllBaseGroupParts(undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroupParts/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts/${commonGroupId}`);

    tick();
  }));

  it('getAllBaseGroupParts - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllBaseGroupParts(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPart(data[0], baseGroupId);
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts/${commonGroupId}`);

    tick();
  }));




  /**
   * countBaseGroups
   */
  it('countBaseGroups - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countBaseGroups(commonGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/countBaseGroups/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/countBaseGroups/${commonGroupId}`);

    tick();
  }));

  it('countBaseGroups - with error status', fakeAsync(() => {
    service.countBaseGroups(commonGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countBaseGroups/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countBaseGroups/${commonGroupId}`);

    tick();
  }));

  it('countBaseGroups - with fatal status', fakeAsync(() => {
    service.countBaseGroups(commonGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countBaseGroups/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countBaseGroups/${commonGroupId}`);

    tick();
  }));

  it('countBaseGroups - mock', fakeAsync(() => {
    service.useMock = true;
    service.countBaseGroups(commonGroupId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data).toEqual(1);
      });

    httpMock.expectNone(`//localhost:8080/group/base/countBaseGroups/${commonGroupId}`);

    tick();
  }));




  /**
   * createBaseGroup
   */
  it('createBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIBaseGroup,
      status: Status.OK,
      messages: []
    }

    service.createBaseGroup(baseGroupName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(mockIBaseGroup.description);
      expect(data.groupName).toEqual(mockIBaseGroup.groupName);
      expect(data.identification).toEqual(mockIBaseGroup.identification);
      expect(data.validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/createBaseGroup`);
    expect(req.request.method).toEqual("POST");
    expect(req.request.body).toEqual(`groupName=${baseGroupName}&commonGroupIdentification=${commonGroupId}`)
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/createBaseGroup`);

    tick();
  }));

  it('createBaseGroup - with error status', fakeAsync(() => {
    service.createBaseGroup(baseGroupName).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/createBaseGroup`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`groupName=${baseGroupName}&commonGroupIdentification=${commonGroupId}`)
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/createBaseGroup`);

    tick();
  }));

  it('createBaseGroup - with fatal status', fakeAsync(() => {
    service.createBaseGroup(baseGroupName).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/createBaseGroup`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`groupName=${baseGroupName}&commonGroupIdentification=${commonGroupId}`)
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/createBaseGroup`);

    tick();
  }));

  it('createBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup(baseGroupName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual('BGAA00002');
      expect(data.groupName).toEqual(baseGroupName);
    });

    httpMock.expectNone(`//localhost:8080/group/base/createBaseGroup`);

    tick();
  }));

  it('createBaseGroup - mock, but no common group selected', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);
    service.createBaseGroup(baseGroupName).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while creating base group at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/createBaseGroup`);

    tick();
  }));




  /**
   * deleteBaseGroup
   */
  it('deleteBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.deleteBaseGroup(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/deleteBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("DELETE");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/deleteBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('deleteBaseGroup - with error status', fakeAsync(() => {
    service.deleteBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/deleteBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/deleteBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('deleteBaseGroup - with fatal status', fakeAsync(() => {
    service.deleteBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/deleteBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/deleteBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('deleteBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.deleteBaseGroup(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/group/base/deleteBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('deleteBaseGroup - mock non existing', fakeAsync(() => {
    service.useMock = true;
    service.deleteBaseGroup('someId').subscribe(data => {
      expect(data).toBeFalse();
    });

    httpMock.expectNone(`//localhost:8080/group/base/deleteBaseGroup/someId`);

    tick();
  }));

  it('deleteBaseGroup - mock, but no common group selected', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);
    service.deleteBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while deleting base group ${baseGroupId} at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/deleteBaseGroup/someId`);

    tick();
  }));




  /**
   * updateBaseGroup
   */
  it('updateBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIBaseGroup,
      status: Status.OK,
      messages: []
    }

    service.updateBaseGroup(modifiedBaseGroup).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(modifiedBaseGroup.description);
      expect(data.groupName).toEqual(modifiedBaseGroup.groupName);
      expect(data.identification).toEqual(modifiedBaseGroup.identification);
      expect(data.validFrom).toEqual(modifiedBaseGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });


    const req = httpMock.expectOne(`//localhost:8080/group/base/updateBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("PUT");
    expect(req.request.body).toEqual(modifiedBaseGroup);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/updateBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('updateBaseGroup - with error status', fakeAsync(() => {
    service.updateBaseGroup(modifiedBaseGroup).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/updateBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/updateBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('updateBaseGroup - with fatal status', fakeAsync(() => {
    service.updateBaseGroup(modifiedBaseGroup).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/updateBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/updateBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('updateBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.updateBaseGroup(modifiedBaseGroup).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(modifiedBaseGroup.identification);
      expect(data.description).toEqual(modifiedBaseGroup.description);
      expect(data.groupName).toEqual(modifiedBaseGroup.groupName);
      expect(data.identification).toEqual(modifiedBaseGroup.identification);
      expect(data.validFrom).toEqual(modifiedBaseGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    httpMock.expectNone(`//localhost:8080/group/base/updateBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('updateBaseGroup - mock with error', fakeAsync(() => {
    service.useMock = true;
    let otherModifiedBaseGroup: BaseGroup = Object.assign({}, modifiedBaseGroup);
    otherModifiedBaseGroup.identification = 'someId';
    service.updateBaseGroup(otherModifiedBaseGroup).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating base group someId at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/updateBaseGroup/someId`);

    tick();
  }));

  it('updateBaseGroup - mock, but no common group selected', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);

    service.updateBaseGroup(modifiedBaseGroup).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating base group ${baseGroupId} at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/updateBaseGroup/someId`);

    tick();
  }));





  /**
   * addBaseToBaseGroup
   */
  it('addBaseToBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.addBaseToBaseGroup(otherBaseGroupId, baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual(otherBaseGroupId);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - with error status', fakeAsync(() => {
    service.addBaseToBaseGroup(otherBaseGroupId, baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(otherBaseGroupId);
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - with fatal status', fakeAsync(() => {
    service.addBaseToBaseGroup(otherBaseGroupId, baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(otherBaseGroupId);
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('another group').subscribe({
      next: createData => {
        expect(createData).toBeTruthy();

        service.addBaseToBaseGroup(createData.identification, baseGroupId).subscribe({
          next: firstAddData => {
            expect(firstAddData).toBeTruthy();
            expect(firstAddData).toBeTrue();

            service.addBaseToBaseGroup(createData.identification, baseGroupId).subscribe({
              next:
                secondAddData => {
                  expect(secondAddData).toBeFalse();
                },
              error: e => expect(e).toBeFalsy()
            });
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToBaseGroup(otherBaseGroupId, baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding base group ${otherBaseGroupId} to base group ${baseGroupId} at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToBaseGroup(baseGroupId, otherBaseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding base group ${baseGroupId} to base group ${otherBaseGroupId} at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));





  /**
   * removeBaseFromBaseGroup
   */
  it('removeBaseFromBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.removeBaseFromBaseGroup(otherBaseGroupId, baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual(otherBaseGroupId);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - with error status', fakeAsync(() => {
    service.removeBaseFromBaseGroup(otherBaseGroupId, baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(otherBaseGroupId);
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - with fatal status', fakeAsync(() => {
    service.removeBaseFromBaseGroup(otherBaseGroupId, baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(otherBaseGroupId);
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('another group').subscribe({
      next: createData => {
        expect(createData).toBeTruthy();

        service.addBaseToBaseGroup(createData.identification, baseGroupId).subscribe({
          next: addData => {
            expect(addData).toBeTruthy();
            expect(addData).toBeTrue();

            service.removeBaseFromBaseGroup(createData.identification, baseGroupId).subscribe({
              next: firstRemoveData => {
                expect(firstRemoveData).toBeTruthy();
                expect(firstRemoveData).toBeTrue();

                service.removeBaseFromBaseGroup(createData.identification, baseGroupId).subscribe({
                  next: secondRemoveData => {
                    expect(secondRemoveData).toBeFalse();
                  },
                  error: e => expect(e).toBeFalsy()
                });
              },
              error: e => expect(e).toBeFalsy()
            });
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.removeBaseFromBaseGroup(otherBaseGroupId, baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing base group ${otherBaseGroupId} from base group ${baseGroupId} at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.removeBaseFromBaseGroup(baseGroupId, otherBaseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing base group ${baseGroupId} from base group ${otherBaseGroupId} at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * countBasesAtBaseGroup
   */
  it('countBasesAtBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countBasesAtBaseGroup(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/countBaseAtBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countBasesAtBaseGroup - with error status', fakeAsync(() => {
    service.countBasesAtBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countBaseAtBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countBasesAtBaseGroup - with fatal status', fakeAsync(() => {
    service.countBasesAtBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countBaseAtBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countBasesAtBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('A new sub base group').subscribe({
      next: createdData => {
        expect(createdData).toBeTruthy();

        service.addBaseToBaseGroup(createdData.identification, baseGroupId).subscribe({
          next: addedData => {
            service.countBasesAtBaseGroup(baseGroupId).subscribe({
              next: data => {
                expect(data).toEqual(1);
              },
              error: e => expect(e).toBeFalsy()
            });
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * getAllBasesAtBaseGroup
   */
  it('getAllBasesAtBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllBasesAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtBaseGroup/${otherBaseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasesAtBaseGroup - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllBasesAtBaseGroup(otherBaseGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtBaseGroup/${otherBaseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtBaseGroup/${otherBaseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllBasesAtBaseGroup - with error status', fakeAsync(() => {
    service.getAllBasesAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasesAtBaseGroup - with fatal status', fakeAsync(() => {
    service.getAllBasesAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasesAtBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('New sub base group').subscribe({
      next: createdData => {
        expect(createdData).toBeTruthy();
        service.addBaseToBaseGroup(createdData.identification, baseGroupId).subscribe({
          next: addedData => {
            expect(addedData).toBeTruthy();
            service.getAllBasesAtBaseGroup(baseGroupId, undefined, undefined).subscribe({
              next: getAllData => {
                expect(getAllData).toBeTruthy();
                expect(getAllData.length).toEqual(1);
                expect(getAllData[0].identification).toEqual(createdData.identification);
                expect(getAllData[0].isComplete).toBeTrue();
              },
              error: e => expect(e).toBeFalsy()
            });
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtBaseGroup/${baseGroupId}`);

    tick();
  }));





  /**
   * getAllBasePartsAtBaseGroup
   */
  it('getAllBasePartsAtBaseGroup - all ok', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllBasePartsAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtBaseGroup/${otherBaseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasePartsAtBaseGroup - with pageing', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllBasePartsAtBaseGroup(otherBaseGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtBaseGroup/${otherBaseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtBaseGroup/${otherBaseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllBasePartsAtBaseGroup - with error status', fakeAsync(() => {
    service.getAllBasePartsAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasePartsAtBaseGroup - with fatal status', fakeAsync(() => {
    service.getAllBasePartsAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasePartsAtBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('New sub base group').subscribe({
      next:
        createdData => {
          expect(createdData).toBeTruthy();
          service.addBaseToBaseGroup(createdData.identification, baseGroupId).subscribe({
            next:
              addedData => {
                expect(addedData).toBeTruthy();
                service.getAllBasePartsAtBaseGroup(baseGroupId, undefined, undefined).subscribe({
                  next:
                    getAllData => {
                      expect(getAllData).toBeTruthy();
                      expect(getAllData.length).toEqual(1);
                      checkBaseGroupPart(getAllData[0], createdData.identification);
                    },
                  error: e => expect(e).toBeFalsy()
                });
              },
            error: e => expect(e).toBeFalsy()
          });
        },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * countAvailableBasesForBaseGroup
   */
  it('countAvailableBasesForBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countAvailableBasesForBaseGroup(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/countAvailableBasesForBaseGroup/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/countAvailableBasesForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countAvailableBasesForBaseGroup - with error status', fakeAsync(() => {
    service.countAvailableBasesForBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countAvailableBasesForBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countAvailableBasesForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countAvailableBasesForBaseGroup - with fatal status', fakeAsync(() => {
    service.countAvailableBasesForBaseGroup(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countAvailableBasesForBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countAvailableBasesForBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('countAvailableBasesForBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.countAvailableBasesForBaseGroup(baseGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
        expect(data).toEqual(0);
      });

    service.addBaseGroupToMock(otherBaseGroup, commonGroupId);

    service.countAvailableBasesForBaseGroup(baseGroupId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data).toEqual(1);
      });


    httpMock.expectNone(`//localhost:8080/group/base/countAvailableBasesForBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * getAvailableBasesForBaseGroup
   */
  it('getAvailableBasesForBaseGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAvailableBasesForBaseGroup(otherBaseGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasesForBaseGroup/${otherBaseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAvailableBasesForBaseGroup - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAvailableBasesForBaseGroup(otherBaseGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasesForBaseGroup/${otherBaseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForBaseGroup/${otherBaseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAvailableBasesForBaseGroup - with error status', fakeAsync(() => {
    service.getAvailableBasesForBaseGroup(otherBaseGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasesForBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAvailableBasesForBaseGroup - with fatal status', fakeAsync(() => {
    service.getAvailableBasesForBaseGroup(otherBaseGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasesForBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAvailableBasesForBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('New sub base group').subscribe({
      next:
        createdData => {
          expect(createdData).toBeTruthy();
          service.getAvailableBasesForBaseGroup(baseGroupId, undefined, undefined).subscribe({
            next:
              getAllData => {
                expect(getAllData).toBeTruthy();
                expect(getAllData.length).toEqual(1);
                expect(getAllData[0].identification).toEqual(createdData.identification);
                expect(getAllData[0].isComplete).toBeTrue();
              },
            error: e => expect(e).toBeFalsy()
          });
        },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * getAvailableBasePartsForBaseGroup
   */
  it('getAvailableBasePartsForBaseGroup - all ok', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAvailableBasePartsForBaseGroup(otherBaseGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasePartsForBaseGroup/${otherBaseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAvailableBasePartsForBaseGroup - with pageing', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAvailableBasePartsForBaseGroup(otherBaseGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasePartsForBaseGroup/${otherBaseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForBaseGroup/${otherBaseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAvailableBasePartsForBaseGroup - with error status', fakeAsync(() => {
    service.getAvailableBasePartsForBaseGroup(otherBaseGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasePartsForBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAvailableBasePartsForBaseGroup - with fatal status', fakeAsync(() => {
    service.getAvailableBasePartsForBaseGroup(otherBaseGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasePartsForBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAvailableBasePartsForBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('New sub base group').subscribe({
      next:
        createdData => {
          expect(createdData).toBeTruthy();
          service.getAvailableBasePartsForBaseGroup(baseGroupId, undefined, undefined).subscribe({
            next:
              getAllData => {
                expect(getAllData).toBeTruthy();
                expect(getAllData.length).toEqual(1);
                checkBaseGroupPart(getAllData[0], createdData.identification);
              },
            error: e => expect(e).toBeFalsy()
          });
        },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForBaseGroup/${baseGroupId}`);

    tick();
  }));




  /**
   * addBaseToPrivilegeGroup
   */
  it('addBaseToPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }
    let baseGroupIdRole = new BaseGroupIdRole(baseGroupId, Role.CONTRIBUTOR);

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual(baseGroupIdRole);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - with error status', fakeAsync(() => {
    let baseGroupIdRole = new BaseGroupIdRole(baseGroupId, Role.CONTRIBUTOR);

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(baseGroupIdRole);
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - with fatal status', fakeAsync(() => {
    let baseGroupIdRole = new BaseGroupIdRole(baseGroupId, Role.CONTRIBUTOR);

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(baseGroupIdRole);
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: firstAddData => {
        expect(firstAddData).toBeTruthy();
        expect(firstAddData).toBeTrue();

        service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
          next: secondAddData => {
            expect(secondAddData).toBeFalse();
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });


    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToPrivilegeGroup('anyId', privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding base group anyId to privilege group ${privilegeGroupId} at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToPrivilegeGroup(baseGroupId, 'anyId', Role.CONTRIBUTOR).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding base group ${baseGroupId} to privilege group anyId at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/anyId`);

    tick();
  }));




  /**
   * removeBaseFromPrivilegeGroup
   */
  it('removeBaseFromPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.removeBaseFromPrivilegeGroup(baseGroupId, privilegeGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual(baseGroupId);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - with error status', fakeAsync(() => {
    service.removeBaseFromPrivilegeGroup(baseGroupId, privilegeGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(baseGroupId);
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.removeBaseFromPrivilegeGroup(baseGroupId, privilegeGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual(baseGroupId);
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.MANAGER).subscribe({
      next: addData => {
        expect(addData).toBeTruthy();
        expect(addData).toBeTrue();

        service.removeBaseFromPrivilegeGroup(baseGroupId, privilegeGroupId).subscribe({
          next: firstRemoveData => {
            expect(firstRemoveData).toBeTruthy();
            expect(firstRemoveData).toBeTrue();

            service.removeBaseFromPrivilegeGroup(baseGroupId, privilegeGroupId).subscribe({
              next: secondRemoveData => {
                expect(secondRemoveData).toBeFalse();
              },
              error: e => expect(e).toBeFalsy()
            });
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });


    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.removeBaseFromPrivilegeGroup('anyId', privilegeGroupId).subscribe({
      next: data => {
        expect(data).toBeFalsy();
      },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing base group anyId from privilege group ${privilegeGroupId} at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.removeBaseFromPrivilegeGroup(baseGroupId, 'anyId').subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing base group ${baseGroupId} from privilege group anyId at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/anyId`);

    tick();
  }));




  /**
   * countBasesAtPrivilegeGroup
   */
  it('countBasesAtPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('countBasesAtPrivilegeGroup - with error status', fakeAsync(() => {
    service.countBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
      expect(req.request.method).toEqual("GET");
      expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('countBasesAtPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.countBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
      expect(req.request.method).toEqual("GET");
      expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('countBasesAtPrivilegeGroup - mock with role', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: addedData => {
        expect(addedData).toBeTrue();

        service.countBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe({
          next: data => { expect(data).toEqual(1); },
          error: e => expect(e).toBeFalsy()
        });

        service.countBasesAtPrivilegeGroup(privilegeGroupId, Role.MANAGER).subscribe({
          next: data => { expect(data).toEqual(0); },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });


    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.MANAGER}`);

    tick();
  }));

  it('countBasesAtPrivilegeGroup - mock without role', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: addedData => {
        expect(addedData).toBeTrue();
        service.countBasesAtPrivilegeGroup(privilegeGroupId, undefined).subscribe({
          next: data => { expect(data).toEqual(1); },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });


    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));




  /**
   * getAllBasesAtPrivilegeGroup
   */
  it('getAllBasesAtPrivilegeGroup - all ok', fakeAsync(() => {
    let baseGroupRole: IBaseGroupRole = { baseGroup: mockIBaseGroup, role: Role.CONTRIBUTOR };

    let mockResponseWrapper: ResponseWrapper = {
      response: [baseGroupRole],
      status: Status.OK,
      messages: []
    }

    service.getAllBasesAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - with pageing', fakeAsync(() => {
    let baseGroupRole: IBaseGroupRole = { baseGroup: mockIBaseGroup, role: Role.CONTRIBUTOR };

    let mockResponseWrapper: ResponseWrapper = {
      response: [baseGroupRole],
      status: Status.OK,
      messages: []
    }

    service.getAllBasesAtPrivilegeGroup(privilegeGroupId, undefined, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - with pageing and role', fakeAsync(() => {
    let baseGroupRole: IBaseGroupRole = { baseGroup: mockIBaseGroup, role: Role.CONTRIBUTOR };

    let mockResponseWrapper: ResponseWrapper = {
      response: [baseGroupRole],
      status: Status.OK,
      messages: []
    }

    service.getAllBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);

    tick();
  }));


  it('getAllBasesAtPrivilegeGroup - with role', fakeAsync(() => {
    let baseGroupRole: IBaseGroupRole = { baseGroup: mockIBaseGroup, role: Role.CONTRIBUTOR };

    let mockResponseWrapper: ResponseWrapper = {
      response: [baseGroupRole],
      status: Status.OK,
      messages: []
    }

    service.getAllBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - with error status', fakeAsync(() => {
    service.getAllBasesAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getAllBasesAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - mock with role', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: addedData => {
        expect(addedData).toBeTruthy();

        service.getAllBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR, undefined, undefined).subscribe({
          next: getAllData => {
            expect(getAllData).toBeTruthy();
            expect(getAllData.length).toEqual(1);
            expect(getAllData[0].identification).toEqual(baseGroupId);
          },
          error: e => expect(e).toBeFalsy()
        });

        service.getAllBasesAtPrivilegeGroup(privilegeGroupId, Role.MANAGER, undefined, undefined).subscribe({
          next: getAllData => {
            expect(getAllData).toBeTruthy();
            expect(getAllData.length).toEqual(0);
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - mock without role', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: addedData => {
        expect(addedData).toBeTruthy();
        service.getAllBasesAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe({
          next: getAllData => {
            expect(getAllData).toBeTruthy();
            expect(getAllData.length).toEqual(1);
            expect(getAllData[0].identification).toEqual(baseGroupId);
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));




  /**
   * getAllBasePartsAtPrivilegeGroup
   */
  it('getAllBasePartsAtPrivilegeGroup - all ok', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let baseGroupRole: IBaseGroupRole = { baseGroup: mockIBaseGroup, role: Role.CONTRIBUTOR };

    let mockResponseWrapper: ResponseWrapper = {
      response: [baseGroupRole],
      status: Status.OK,
      messages: []
    }

    service.getAllBasePartsAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllBasePartsAtPrivilegeGroup - with pageing', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let baseGroupRole: IBaseGroupRole = { baseGroup: mockIBaseGroup, role: Role.CONTRIBUTOR };

    let mockResponseWrapper: ResponseWrapper = {
      response: [baseGroupRole],
      status: Status.OK,
      messages: []
    }

    service.getAllBasePartsAtPrivilegeGroup(privilegeGroupId, undefined, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllBasePartsAtPrivilegeGroup - with pageing and role', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let baseGroupRole: IBaseGroupRole = { baseGroup: mockIBaseGroup, role: Role.CONTRIBUTOR };

    let mockResponseWrapper: ResponseWrapper = {
      response: [baseGroupRole],
      status: Status.OK,
      messages: []
    }

    service.getAllBasePartsAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);

    tick();
  }));


  it('getAllBasePartsAtPrivilegeGroup - with role', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let baseGroupRole: IBaseGroupRole = { baseGroup: mockIBaseGroup, role: Role.CONTRIBUTOR };

    let mockResponseWrapper: ResponseWrapper = {
      response: [baseGroupRole],
      status: Status.OK,
      messages: []
    }

    service.getAllBasePartsAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllBasePartsAtPrivilegeGroup - with error status', fakeAsync(() => {
    service.getAllBasePartsAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllBasePartsAtPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getAllBasePartsAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllBasePartsAtPrivilegeGroup - mock with role', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: addedData => {
        expect(addedData).toBeTruthy();

        service.getAllBasePartsAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR, undefined, undefined).subscribe({
          next: getAllData => {
            expect(getAllData).toBeTruthy();
            expect(getAllData.length).toEqual(1);
            checkBaseGroupPart(getAllData[0], baseGroupId);
          },
          error: e => expect(e).toBeFalsy()
        });

        service.getAllBasePartsAtPrivilegeGroup(privilegeGroupId, Role.MANAGER, undefined, undefined).subscribe({
          next: getAllData => {
            expect(getAllData).toBeTruthy();
            expect(getAllData.length).toEqual(0);
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllBasePartsAtPrivilegeGroup - mock without role', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
      next: addedData => {
        expect(addedData).toBeTruthy();
        service.getAllBasePartsAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe({
          next: getAllData => {
            expect(getAllData).toBeTruthy();
            expect(getAllData.length).toEqual(1);
            checkBaseGroupPart(getAllData[0], baseGroupId);
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllBasePartAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));




  /**
   * countAvailableBasesForPrivilegeGroup
   */
  it('countAvailableBasesForPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countAvailableBasesForPrivilegeGroup(privilegeGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/countAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/countAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('countAvailableBasesForPrivilegeGroup - with error status', fakeAsync(() => {
    service.countAvailableBasesForPrivilegeGroup(privilegeGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('countAvailableBasesForPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.countAvailableBasesForPrivilegeGroup(privilegeGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/countAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/countAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('countAvailableBasesForPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.countAvailableBasesForPrivilegeGroup(privilegeGroupId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data).toEqual(1);
      });

    service.addBaseGroupToMock(otherBaseGroup, commonGroupId);

    service.countAvailableBasesForPrivilegeGroup(privilegeGroupId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data).toEqual(2);
      });


    httpMock.expectNone(`//localhost:8080/group/base/countAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));




  /**
   * getAvailableBasesForPrivilegeGroup
   */
  it('getAvailableBasesForPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAvailableBasesForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAvailableBasesForPrivilegeGroup - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAvailableBasesForPrivilegeGroup(privilegeGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toEqual(mockIBaseGroup.description);
      expect(data[0].validFrom).toEqual(mockIBaseGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasesForPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAvailableBasesForPrivilegeGroup - with error status', fakeAsync(() => {
    service.getAvailableBasesForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAvailableBasesForPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getAvailableBasesForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAvailableBasesForPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('New sub base group').subscribe({
      next: createdData => {
        expect(createdData).toBeTruthy();
        service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
          next: addedData => {
            service.getAvailableBasesForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe({
              next: getAllData => {
                expect(getAllData).toBeTruthy();
                expect(getAllData.length).toEqual(1);
                expect(getAllData[0].identification).toEqual(createdData.identification);
                expect(getAllData[0].isComplete).toBeTrue();
              },
              error: e => expect(e).toBeFalsy()
            });
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasesForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));




  /**
   * getAvailableBasePartsForPrivilegeGroup
   */
  it('getAvailableBasePartsForPrivilegeGroup - all ok', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAvailableBasePartsForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasePartsForPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAvailableBasePartsForPrivilegeGroup - with pageing', fakeAsync(() => {
    mockIBaseGroup.description = undefined;
    mockIBaseGroup.validFrom = undefined;
    mockIBaseGroup.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
      status: Status.OK,
      messages: []
    }

    service.getAvailableBasePartsForPrivilegeGroup(privilegeGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      checkBaseGroupPartWithName(data[0], mockIBaseGroup.identification, mockIBaseGroup.groupName);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasePartsForPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAvailableBasePartsForPrivilegeGroup - with error status', fakeAsync(() => {
    service.getAvailableBasePartsForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasePartsForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAvailableBasePartsForPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getAvailableBasePartsForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllAvailableBasePartsForPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAvailableBasePartsForPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('New sub base group').subscribe({
      next: createdData => {
        expect(createdData).toBeTruthy();
        service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe({
          next: addedData => {
            expect(addedData).toBeTruthy();
            service.getAvailableBasePartsForPrivilegeGroup(privilegeGroupId, undefined, undefined).subscribe({
              next: getAllData => {
                expect(getAllData).toBeTruthy();
                expect(getAllData.length).toEqual(1);
                checkBaseGroupPart(getAllData[0], createdData.identification);
              },
              error: e => expect(e).toBeFalsy()
            });
          },
          error: e => expect(e).toBeFalsy()
        });
      },
      error: e => expect(e).toBeFalsy()
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllAvailableBasePartsForPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));



  /**
   * getBaseGroupHistory
   */
  it('getBaseGroupHistory - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [historyChange],
      status: Status.OK,
      messages: []
    }

    service.getBaseGroupHistory(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].action).toBeUndefined;
      expect(data[0].changeTime).toEqual(new Date(2022, 4, 10, 11, 8, 1));
      expect(data[0].changeType).toEqual(ChangeType.CREATE);
      expect(data[0].editor).toEqual(userId);
      expect(data[0].subjectIdentification).toEqual(baseGroupId);
      expect(data[0].targetIdentification).toBeUndefined;
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getBaseGroupHistory/${baseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroupHistory/${baseGroupId}`);

    tick();
  }));

  it('getBaseGroupHistory - with error status', fakeAsync(() => {
    service.getBaseGroupHistory(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getBaseGroupHistory/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroupHistory/${baseGroupId}`);

    tick();
  }));

  it('getBaseGroupHistory - with fatal status', fakeAsync(() => {
    service.getBaseGroupHistory(baseGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getBaseGroupHistory/${baseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroupHistory/${baseGroupId}`);

    tick();
  }));

  it('getBaseGroupHistory - mock', fakeAsync(() => {
    service.useMock = true;
    service.getBaseGroupHistory(baseGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(2);
      expect(data[0].subjectIdentification).toEqual(baseGroupId);
      expect(data[0].changeType).toEqual(ChangeType.CREATE);
      expect(data[1].subjectIdentification).toEqual(baseGroupId);
      expect(data[1].changeType).toEqual(ChangeType.MODIFY);
    });

    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroupHistory/${baseGroupId}`);

    tick();
  }));
});



function checkBaseGroupPart(user: BaseGroup, identification: string) {
  expect(user.identification).toEqual(identification);
  expect(user.description).toBeUndefined();
  expect(user.validFrom).toBeUndefined();
  expect(user.validTo).toBeUndefined();
  expect(user.isComplete).toBeFalse();
}

function checkBaseGroupPartWithName(baseGroup: BaseGroup, identification: string, groupName: string) {
  checkBaseGroupPart(baseGroup, identification);
  expect(baseGroup.groupName).toEqual(groupName);
}