import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Config } from '../../config/config';
import { ConfigService } from '../../config/config.service';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Role } from '../../model/role.model';
import { Status } from '../../model/status.model';
import { BaseBackendService, RETRIES } from '../base/base-backend.service';
import { INITIAL_USER_ID_AT_MOCK } from './user.service';

import { CommonGroupService, INITIAL_COMMON_GROUP_ID_AT_MOCK } from './common-group.service';

describe('CommonGroupService', () => {
  let service: CommonGroupService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;


  const commonGroupId = INITIAL_COMMON_GROUP_ID_AT_MOCK;
  const commonGroupName = 'Name of the group';
  const userId = INITIAL_USER_ID_AT_MOCK;

  const mockConfig: Config =
  {
    clientId: 'ape.user.ui',
    clientSecret: 'changeIt',
    backendBaseUrl: '//localhost:8080',
    adminGroupId: 'AGAA00001'
  };

  const mockICommonGroup: ICommonGroup = {
    description: 'some description',
    groupName: commonGroupName,
    identification: commonGroupId,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    defaultRole: Role.VISITOR,
    isComplete: true
  }

  const modifiedCommonGroup = CommonGroup.map({
    description: 'some description',
    groupName: commonGroupName,
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
    service = TestBed.inject(CommonGroupService);

    BaseBackendService.clearMockData();

    spyOn(configService, 'getConfig').and.returnValue(mockConfig);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });



  /**
   * getCommonGroup
   */
  it('getCommonGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockICommonGroup,
      status: Status.OK,
      messages: []
    }

    service.getCommonGroup(commonGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(mockICommonGroup.description);
      expect(data.groupName).toEqual(mockICommonGroup.groupName);
      expect(data.identification).toEqual(mockICommonGroup.identification);
      expect(data.validFrom).toEqual(mockICommonGroup.validFrom);
      expect(data.validTo).toBeUndefined();
      expect(data.defaultRole).toEqual(mockICommonGroup.defaultRole);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/common/getCommonGroup/${commonGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/common/getCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('getCommonGroup - with error status', fakeAsync(() => {
    service.getCommonGroup(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/getCommonGroup/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/getCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('getCommonGroup - with fatal status', fakeAsync(() => {
    service.getCommonGroup(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/getCommonGroup/${commonGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/getCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('getCommonGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getCommonGroup(commonGroupId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data.identification).toEqual(commonGroupId);
      });

    httpMock.expectNone(`//localhost:8080/group/common/getCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('getCommonGroup - mock with error', fakeAsync(() => {
    service.useMock = true;
    service.getCommonGroup('someId').subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while getting common group someId from backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/common/getCommonGroup/someId`);

    tick();
  }));



  /**
   * getAllCommonGroups
   */
  it('getAllCommonGroups - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockICommonGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllCommonGroups(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockICommonGroup.identification);
      expect(data[0].groupName).toEqual(mockICommonGroup.groupName);
      expect(data[0].description).toEqual(mockICommonGroup.description);
      expect(data[0].validFrom).toEqual(mockICommonGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].defaultRole).toEqual(mockICommonGroup.defaultRole);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/common/getAllCommonGroups`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/common/getAllCommonGroups`);

    tick();
  }));

  it('getAllCommonGroups - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockICommonGroup],
      status: Status.OK,
      messages: []
    }

    service.getAllCommonGroups(1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockICommonGroup.identification);
      expect(data[0].groupName).toEqual(mockICommonGroup.groupName);
      expect(data[0].description).toEqual(mockICommonGroup.description);
      expect(data[0].validFrom).toEqual(mockICommonGroup.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].defaultRole).toEqual(mockICommonGroup.defaultRole);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/common/getAllCommonGroups?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/common/getAllCommonGroups?page=1&size=50`);

    tick();
  }));

  it('getAllCommonGroups - with error status', fakeAsync(() => {
    service.getAllCommonGroups(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/getAllCommonGroups`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/getAllCommonGroups`);

    tick();
  }));

  it('getAllCommonGroups - with fatal status', fakeAsync(() => {
    service.getAllCommonGroups(undefined, undefined).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/getAllCommonGroups`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/getAllCommonGroups`);

    tick();
  }));

  it('getAllCommonGroups - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllCommonGroups(undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(commonGroupId);
    });

    httpMock.expectNone(`//localhost:8080/group/common/getAllCommonGroups`);

    tick();
  }));



  /**
   * getParentCommonGroupOfUser
   */
  it('getParentCommonGroupOfUser - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockICommonGroup,
      status: Status.OK,
      messages: []
    }

    service.getParentCommonGroupOfUser(userId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(mockICommonGroup.description);
      expect(data.groupName).toEqual(mockICommonGroup.groupName);
      expect(data.identification).toEqual(mockICommonGroup.identification);
      expect(data.validFrom).toEqual(mockICommonGroup.validFrom);
      expect(data.validTo).toBeUndefined();
      expect(data.defaultRole).toEqual(mockICommonGroup.defaultRole);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/common/getParentCommonGroupOfUser/${userId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/common/getParentCommonGroupOfUser/${userId}`);

    tick();
  }));

  it('getParentCommonGroupOfUser - with error status', fakeAsync(() => {
    service.getParentCommonGroupOfUser(userId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/getParentCommonGroupOfUser/${userId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/getParentCommonGroupOfUser/${userId}`);

    tick();
  }));

  it('getParentCommonGroupOfUser - with fatal status', fakeAsync(() => {
    service.getParentCommonGroupOfUser(userId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/getParentCommonGroupOfUser/${userId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/getParentCommonGroupOfUser/${userId}`);

    tick();
  }));

  it('getParentCommonGroupOfUser - mock', fakeAsync(() => {
    service.useMock = true;
    service.getParentCommonGroupOfUser(userId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data.identification).toEqual(commonGroupId);
      });

    httpMock.expectNone(`//localhost:8080/group/common/getParentCommonGroupOfUser/${userId}`);

    tick();
  }));

  it('getParentCommonGroupOfUser - mock with error', fakeAsync(() => {
    service.useMock = true;
    service.getParentCommonGroupOfUser('someId').subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while getting parent common group of user someId from backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/common/getParentCommonGroupOfUser/someId`);

    tick();
  }));




  /**
   * createCommonGroup
   */
  it('createCommonGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockICommonGroup,
      status: Status.OK,
      messages: []
    }

    service.createCommonGroup(commonGroupName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(mockICommonGroup.description);
      expect(data.groupName).toEqual(mockICommonGroup.groupName);
      expect(data.identification).toEqual(mockICommonGroup.identification);
      expect(data.validFrom).toEqual(mockICommonGroup.validFrom);
      expect(data.validTo).toBeUndefined();
      expect(data.defaultRole).toEqual(mockICommonGroup.defaultRole);
    });

    const req = httpMock.expectOne(`//localhost:8080/group/common/createCommonGroup`);
    expect(req.request.method).toEqual("POST");
    expect(req.request.body).toEqual(`groupName=${commonGroupName}`)
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/common/createCommonGroup`);

    tick();
  }));

  it('createCommonGroup - with error status', fakeAsync(() => {
    service.createCommonGroup(commonGroupName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/createCommonGroup`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`groupName=${commonGroupName}`)
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/createCommonGroup`);

    tick();
  }));

  it('createCommonGroup - with fatal status', fakeAsync(() => {
    service.createCommonGroup(commonGroupName).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/createCommonGroup`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`groupName=${commonGroupName}`)
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/createCommonGroup`);

    tick();
  }));

  it('createCommonGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.createCommonGroup(commonGroupName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual('CGAA00002');
      expect(data.groupName).toEqual(commonGroupName);
    });

    httpMock.expectNone(`//localhost:8080/group/common/createCommonGroup`);

    tick();
  }));



  /**
   * deleteCommonGroup
   */
  it('deleteCommonGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.deleteCommonGroup(commonGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/group/common/deleteCommonGroup/${commonGroupId}`);
    expect(req.request.method).toEqual("DELETE");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/common/deleteCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('deleteCommonGroup - with error status', fakeAsync(() => {
    service.deleteCommonGroup(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/deleteCommonGroup/${commonGroupId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/deleteCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('deleteCommonGroup - with fatal status', fakeAsync(() => {
    service.deleteCommonGroup(commonGroupId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/deleteCommonGroup/${commonGroupId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/deleteCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('deleteCommonGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.deleteCommonGroup(commonGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/group/common/deleteCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('deleteCommonGroup - mock non existing', fakeAsync(() => {
    service.useMock = true;
    service.deleteCommonGroup('someId').subscribe(data => {
      expect(data).toBeFalse();
    });

    httpMock.expectNone(`//localhost:8080/group/common/deleteCommonGroup/someId`);

    tick();
  }));



  /**
   * updateCommonGroup
   */
  it('updateCommonGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockICommonGroup,
      status: Status.OK,
      messages: []
    }

    service.updateCommonGroup(modifiedCommonGroup).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(modifiedCommonGroup.description);
      expect(data.groupName).toEqual(modifiedCommonGroup.groupName);
      expect(data.identification).toEqual(modifiedCommonGroup.identification);
      expect(data.validFrom).toEqual(modifiedCommonGroup.validFrom);
      expect(data.validTo).toBeUndefined();
      expect(data.defaultRole).toEqual(modifiedCommonGroup.defaultRole);
    });


    const req = httpMock.expectOne(`//localhost:8080/group/common/updateCommonGroup/${commonGroupId}`);
    expect(req.request.method).toEqual("PUT");
    expect(req.request.body).toEqual(modifiedCommonGroup);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/group/common/updateCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('updateCommonGroup - with error status', fakeAsync(() => {
    service.updateCommonGroup(modifiedCommonGroup).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/updateCommonGroup/${commonGroupId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/updateCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('updateCommonGroup - with fatal status', fakeAsync(() => {
    service.updateCommonGroup(modifiedCommonGroup).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/group/common/updateCommonGroup/${commonGroupId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/group/common/updateCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('updateCommonGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.updateCommonGroup(modifiedCommonGroup).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(modifiedCommonGroup.identification);
      expect(data.description).toEqual(modifiedCommonGroup.description);
      expect(data.groupName).toEqual(modifiedCommonGroup.groupName);
      expect(data.identification).toEqual(modifiedCommonGroup.identification);
      expect(data.validFrom).toEqual(modifiedCommonGroup.validFrom);
      expect(data.validTo).toBeUndefined();
      expect(data.defaultRole).toEqual(modifiedCommonGroup.defaultRole);
    });

    httpMock.expectNone(`//localhost:8080/group/common/updateCommonGroup/${commonGroupId}`);

    tick();
  }));

  it('updateCommonGroup - mock with error', fakeAsync(() => {
    service.useMock = true;
    let othermodifiedCommonGroup: CommonGroup = Object.assign({}, modifiedCommonGroup);
    othermodifiedCommonGroup.identification = 'someId';
    service.updateCommonGroup(othermodifiedCommonGroup).subscribe(
      data => {
        expect(data).toBeFalsy();
      },
      e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating common group someId at backend`);
      });

    httpMock.expectNone(`//localhost:8080/group/common/updateCommonGroup/someId`);

    tick();
  }));

});
