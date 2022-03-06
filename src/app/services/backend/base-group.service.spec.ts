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
import { UserService } from './user.service';
import { SelectionService } from '../util/selection.service';

import { BaseGroupService } from './base-group.service';


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

  const mockConfig: Config =
  {
    clientId: 'ape.user.ui',
    clientSecret: 'changeIt',
    backendBaseUrl: '//localhost:8080',
    adminGroupId: 'AGAA00001'
  };

  let mockIBaseGroup: IBaseGroup;
  let modifiedBaseGroup: BaseGroup;
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

    mockCommonGroup = CommonGroup.map({
      description: 'some description',
      groupName: 'commonGroupName',
      identification: commonGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      defaultRole: Role.VISITOR
    } as ICommonGroup);


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
    service.getBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.getBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.getBaseGroup(baseGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while getting base group ${baseGroupId} from backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/base/getBaseGroup/someId`);

    tick();
  }));

  it('getBaseGroup - mock with error', fakeAsync(() => {
    service.useMock = true;
    service.getBaseGroup('someId').subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while getting base group someId from backend`);
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

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroups`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups`);

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

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroups?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups?page=1&size=50`);

    tick();
  }));

  it('getAllBaseGroups - with error status', fakeAsync(() => {
    service.getAllBaseGroups(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroups`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups`);

    tick();
  }));

  it('getAllBaseGroups - with fatal status', fakeAsync(() => {
    service.getAllBaseGroups(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroups`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups`);

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

    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroups`);

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
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroupParts`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts`);

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
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroupParts?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts?page=1&size=50`);

    tick();
  }));

  it('getAllBaseGroupParts - with error status', fakeAsync(() => {
    service.getAllBaseGroupParts(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroupParts`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts`);

    tick();
  }));

  it('getAllBaseGroupParts - with fatal status', fakeAsync(() => {
    service.getAllBaseGroupParts(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/getAllBaseGroupParts`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts`);

    tick();
  }));

  it('getAllBaseGroupParts - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllBaseGroupParts(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(baseGroupId);
      expect(data[0].description).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    httpMock.expectNone(`//localhost:8080/group/base/getAllBaseGroupParts`);

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
    service.countBaseGroups(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.countBaseGroups(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    expect(req.request.body).toEqual(`groupName=${baseGroupName}`)
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/createBaseGroup`);

    tick();
  }));

  it('createBaseGroup - with error status', fakeAsync(() => {
    service.createBaseGroup(baseGroupName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/createBaseGroup`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`groupName=${baseGroupName}`)
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/createBaseGroup`);

    tick();
  }));

  it('createBaseGroup - with fatal status', fakeAsync(() => {
    service.createBaseGroup(baseGroupName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/createBaseGroup`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`groupName=${baseGroupName}`)
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
    service.createBaseGroup(baseGroupName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while creating base group at backend`);
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
    service.deleteBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.deleteBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.deleteBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while deleting base group ${baseGroupId} at backend`);
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
    service.updateBaseGroup(modifiedBaseGroup).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.updateBaseGroup(modifiedBaseGroup).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.updateBaseGroup(otherModifiedBaseGroup).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating base group someId at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/base/updateBaseGroup/someId`);

    tick();
  }));

  it('updateBaseGroup - mock, but no common group selected', fakeAsync(() => {
    service.useMock = true;
    getSelectedCommonGroupSpy.and.returnValue(undefined);

    service.updateBaseGroup(modifiedBaseGroup).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating base group ${baseGroupId} at backend`);
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
    expect(req.request.body).toEqual({ baseGroupIdentification: otherBaseGroupId });
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - with error status', fakeAsync(() => {
    service.addBaseToBaseGroup(otherBaseGroupId, baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ baseGroupIdentification: otherBaseGroupId });
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - with fatal status', fakeAsync(() => {
    service.addBaseToBaseGroup(otherBaseGroupId, baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ baseGroupIdentification: otherBaseGroupId });
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('another group').subscribe(
      createData => {
        expect(createData).toBeTruthy();

        service.addBaseToBaseGroup(createData.identification, baseGroupId).subscribe(
          firstAddData => {
            expect(firstAddData).toBeTruthy();
            expect(firstAddData).toBeTrue();

            service.addBaseToBaseGroup(createData.identification, baseGroupId).subscribe(
              secondAddData => {
                expect(secondAddData).toBeFalse();
              },
              e => expect(e).toBeFalsy());
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToBaseGroup(otherBaseGroupId, baseGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding base group ${otherBaseGroupId} to base group ${baseGroupId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/base/addBaseToBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('addBaseToBaseGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToBaseGroup(baseGroupId, otherBaseGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding base group ${baseGroupId} to base group ${otherBaseGroupId} at backend`);
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
    expect(req.request.body).toEqual({ baseGroupIdentification: otherBaseGroupId });
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - with error status', fakeAsync(() => {
    service.removeBaseFromBaseGroup(otherBaseGroupId, baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ baseGroupIdentification: otherBaseGroupId });
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - with fatal status', fakeAsync(() => {
    service.removeBaseFromBaseGroup(otherBaseGroupId, baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ baseGroupIdentification: otherBaseGroupId });
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('another group').subscribe(
      createData => {
        expect(createData).toBeTruthy();

        service.addBaseToBaseGroup(createData.identification, baseGroupId).subscribe(
          addData => {
            expect(addData).toBeTruthy();
            expect(addData).toBeTrue();

            service.removeBaseFromBaseGroup(createData.identification, baseGroupId).subscribe(
              firstRemoveData => {
                expect(firstRemoveData).toBeTruthy();
                expect(firstRemoveData).toBeTrue();

                service.removeBaseFromBaseGroup(createData.identification, baseGroupId).subscribe(
                  secondRemoveData => {
                    expect(secondRemoveData).toBeFalse();
                  },
                  e => expect(e).toBeFalsy());
              },
              e => expect(e).toBeFalsy());
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.removeBaseFromBaseGroup(otherBaseGroupId, baseGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing base group ${otherBaseGroupId} from base group ${baseGroupId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromBaseGroup/${baseGroupId}`);

    tick();
  }));

  it('removeBaseFromBaseGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.removeBaseFromBaseGroup(baseGroupId, otherBaseGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing base group ${baseGroupId} from base group ${otherBaseGroupId} at backend`);
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
    service.countBasesAtBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.countBasesAtBaseGroup(baseGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.createBaseGroup('A new sub base group').subscribe(
      createdData => {
        expect(createdData).toBeTruthy();

        service.addBaseToBaseGroup(createdData.identification, baseGroupId).subscribe(
          addedData => {
            service.countBasesAtBaseGroup(baseGroupId).subscribe(
              data => {
                expect(data).toEqual(1);
              },
              e => expect(e).toBeFalsy());
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy());

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

    const req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtBaseGroup/${otherBaseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtBaseGroup/${otherBaseGroupId}`);

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

    const req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtBaseGroup/${otherBaseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtBaseGroup/${otherBaseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllBasesAtBaseGroup - with error status', fakeAsync(() => {
    service.getAllBasesAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasesAtBaseGroup - with fatal status', fakeAsync(() => {
    service.getAllBasesAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasesAtBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('New sub base group').subscribe(
      createdData => {
        expect(createdData).toBeTruthy();
        service.addBaseToBaseGroup(createdData.identification, baseGroupId).subscribe(
          addedData => {
            expect(addedData).toBeTruthy();
            service.getAllBasesAtBaseGroup(baseGroupId, undefined, undefined).subscribe(
              getAllData => {
                expect(getAllData).toBeTruthy();
                expect(getAllData.length).toEqual(1);
                expect(getAllData[0].identification).toEqual(createdData.identification);
                expect(getAllData[0].isComplete).toBeTrue();
              },
              e => expect(e).toBeFalsy());
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy());

    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtBaseGroup/${baseGroupId}`);

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
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/findAllBasePartAtBaseGroup/${otherBaseGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/findAllBasePartAtBaseGroup/${otherBaseGroupId}`);

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
      expect(data[0].identification).toEqual(mockIBaseGroup.identification);
      expect(data[0].groupName).toEqual(mockIBaseGroup.groupName);
      expect(data[0].description).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/base/findAllBasePartAtBaseGroup/${otherBaseGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/findAllBasePartAtBaseGroup/${otherBaseGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllBasePartsAtBaseGroup - with error status', fakeAsync(() => {
    service.getAllBasePartsAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/findAllBasePartAtBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/findAllBasePartAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasePartsAtBaseGroup - with fatal status', fakeAsync(() => {
    service.getAllBasePartsAtBaseGroup(otherBaseGroupId, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/findAllBasePartAtBaseGroup/${otherBaseGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/findAllBasePartAtBaseGroup/${otherBaseGroupId}`);

    tick();
  }));

  it('getAllBasePartsAtBaseGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createBaseGroup('New sub base group').subscribe(
      createdData => {
        expect(createdData).toBeTruthy();
        service.addBaseToBaseGroup(createdData.identification, baseGroupId).subscribe(
          addedData => {
            expect(addedData).toBeTruthy();
            service.getAllBasePartsAtBaseGroup(baseGroupId, undefined, undefined).subscribe(
              getAllData => {
                expect(getAllData).toBeTruthy();
                expect(getAllData.length).toEqual(1);
                expect(getAllData[0].identification).toEqual(createdData.identification);
                expect(getAllData[0].description).toBeUndefined();
                expect(getAllData[0].validFrom).toBeUndefined();
                expect(getAllData[0].validTo).toBeUndefined();
                expect(getAllData[0].isComplete).toBeFalse();
              },
              e => expect(e).toBeFalsy());
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy());

    httpMock.expectNone(`//localhost:8080/group/base/findAllBasePartAtBaseGroup/${baseGroupId}`);

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
    expect(req.request.body).toEqual({ baseGroupRole: baseGroupIdRole });
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - with error status', fakeAsync(() => {
    let baseGroupIdRole = new BaseGroupIdRole(baseGroupId, Role.CONTRIBUTOR);

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ baseGroupRole: baseGroupIdRole });
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - with fatal status', fakeAsync(() => {
    let baseGroupIdRole = new BaseGroupIdRole(baseGroupId, Role.CONTRIBUTOR);

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ baseGroupRole: baseGroupIdRole });
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      firstAddData => {
        expect(firstAddData).toBeTruthy();
        expect(firstAddData).toBeTrue();

        service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
          secondAddData => {
            expect(secondAddData).toBeFalse();
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );


    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToPrivilegeGroup('anyId', privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding base group anyId to privilege group ${privilegeGroupId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/base/addBaseToPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('addBaseToPrivilegeGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToPrivilegeGroup(baseGroupId, 'anyId', Role.CONTRIBUTOR).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while adding base group ${baseGroupId} to privilege group anyId at backend`);
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
    expect(req.request.body).toEqual({ baseGroupIdentification: baseGroupId });
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - with error status', fakeAsync(() => {
    service.removeBaseFromPrivilegeGroup(baseGroupId, privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ baseGroupIdentification: baseGroupId });
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.removeBaseFromPrivilegeGroup(baseGroupId, privilegeGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ baseGroupIdentification: baseGroupId });
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.MANAGER).subscribe(
      addData => {
        expect(addData).toBeTruthy();
        expect(addData).toBeTrue();

        service.removeBaseFromPrivilegeGroup(baseGroupId, privilegeGroupId).subscribe(
          firstRemoveData => {
            expect(firstRemoveData).toBeTruthy();
            expect(firstRemoveData).toBeTrue();

            service.removeBaseFromPrivilegeGroup(baseGroupId, privilegeGroupId).subscribe(
              secondRemoveData => {
                expect(secondRemoveData).toBeFalse();
              },
              e => expect(e).toBeFalsy());
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy());


    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - mock with error because unknown child', fakeAsync(() => {
    service.useMock = true;
    service.removeBaseFromPrivilegeGroup('anyId', privilegeGroupId).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing base group anyId from privilege group ${privilegeGroupId} at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/base/removeBaseFromPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('removeBaseFromPrivilegeGroup - mock with error because unknown parent', fakeAsync(() => {
    service.useMock = true;
    service.removeBaseFromPrivilegeGroup(baseGroupId, 'anyId').subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while removing base group ${baseGroupId} from privilege group anyId at backend`);
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
    service.countBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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
    service.countBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
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

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      addedData => {
        expect(addedData).toBeTrue();

        service.countBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR).subscribe(
          data => {
            expect(data).toEqual(1);
          },
          e => expect(e).toBeFalsy());

        service.countBasesAtPrivilegeGroup(privilegeGroupId, Role.MANAGER).subscribe(
          data => {
            expect(data).toEqual(0);
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );


    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.MANAGER}`);

    tick();
  }));

  it('countBasesAtPrivilegeGroup - mock without role', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      addedData => {
        expect(addedData).toBeTrue();
        service.countBasesAtPrivilegeGroup(privilegeGroupId, undefined).subscribe(
          data => {
            expect(data).toEqual(1);
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );


    httpMock.expectNone(`//localhost:8080/group/base/countBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));




  /**
   * getAllBasesAtPrivilegeGroup
   */
  it('getAllBasesAtPrivilegeGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
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

    const req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
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

    const req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - with pageing and role', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
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

    const req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}?page=1&size=50&role=${Role.CONTRIBUTOR}`);

    tick();
  }));


  it('getAllBasesAtPrivilegeGroup - with role', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIBaseGroup],
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

    const req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('role')).toEqual(Role.CONTRIBUTOR);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - with error status', fakeAsync(() => {
    service.getAllBasesAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - with fatal status', fakeAsync(() => {
    service.getAllBasesAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - mock with role', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      addedData => {
        expect(addedData).toBeTruthy();

        service.getAllBasesAtPrivilegeGroup(privilegeGroupId, Role.CONTRIBUTOR, undefined, undefined).subscribe(
          getAllData => {
            expect(getAllData).toBeTruthy();
            expect(getAllData.length).toEqual(1);
            expect(getAllData[0].identification).toEqual(baseGroupId);
          },
          e => expect(e).toBeFalsy());

        service.getAllBasesAtPrivilegeGroup(privilegeGroupId, Role.MANAGER, undefined, undefined).subscribe(
          getAllData => {
            expect(getAllData).toBeTruthy();
            expect(getAllData.length).toEqual(0);
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}?role=${Role.CONTRIBUTOR}`);

    tick();
  }));

  it('getAllBasesAtPrivilegeGroup - mock without role', fakeAsync(() => {
    service.useMock = true;

    service.addBaseToPrivilegeGroup(baseGroupId, privilegeGroupId, Role.CONTRIBUTOR).subscribe(
      addedData => {
        expect(addedData).toBeTruthy();
        service.getAllBasesAtPrivilegeGroup(privilegeGroupId, undefined, undefined, undefined).subscribe(
          getAllData => {
            expect(getAllData).toBeTruthy();
            expect(getAllData.length).toEqual(1);
            expect(getAllData[0].identification).toEqual(baseGroupId);
          },
          e => expect(e).toBeFalsy());
      },
      e => expect(e).toBeFalsy()
    );

    httpMock.expectNone(`//localhost:8080/group/base/findAllBaseAtPrivilegeGroup/${privilegeGroupId}`);

    tick();
  }));


});
