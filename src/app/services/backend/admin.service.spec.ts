import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Config } from '../../config/config';
import { ConfigService } from '../../config/config.service';
import { AdminGroup, IAdminGroup } from '../../model/admin-group.model';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Status } from '../../model/status.model';
import { IUser, User } from '../../model/user.model';

import { AdminService } from './admin.service';
import { BaseBackendService, RETRIES } from '../base/base-backend.service';
import { ChangeType, IHistoryChange } from 'src/app/model/history-change.model';

describe('AdminService', () => {
  let service: AdminService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  const adminGroupId = 'AGAA00001';
  const adminId = 'UAA00001';
  const firstName = 'Max';
  const lastName = 'Power';


  const mockConfig: Config =
  {
    clientId: 'ape.user.ui',
    backendBaseUrl: '//localhost:8080',
    adminGroupId: adminGroupId
  };

  let mockIAdminGroup: IAdminGroup;
  let modifiedAdminGroup: AdminGroup;
  let mockIUserAdmin: IUser;
  let modifiedUserAdmin: User;
  let historyChange: IHistoryChange;
  let groupHistoryChange: IHistoryChange;

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
    service = TestBed.inject(AdminService);

    initMockData();
  });


  function initMockData() {
    mockIAdminGroup = {
      description: 'some description',
      groupName: 'Name of the group',
      identification: adminGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isComplete: true
    } as IAdminGroup;

    modifiedAdminGroup = AdminGroup.map({
      description: 'some description',
      groupName: 'Name of the group',
      identification: adminGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined
    } as IAdminGroup);

    mockIUserAdmin = {
      identification: adminId,
      firstName: firstName,
      lastName: lastName,
      mail: 'max.power@ma-vin.de',
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      role: undefined,
      isComplete: true
    } as IUser;

    modifiedUserAdmin = User.map({
      identification: adminId,
      firstName: firstName,
      lastName: lastName,
      mail: 'max.power@ma-vin.de',
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: true,
      role: undefined
    } as User);

    historyChange = {
      action: undefined,
      changeTime: new Date(2022, 4, 10, 11, 8, 1),
      changeType: ChangeType.CREATE,
      editor: adminId,
      subjectIdentification: adminId,
      targetIdentification: undefined
    } as IHistoryChange;

    groupHistoryChange = {
      action: undefined,
      changeTime: new Date(2022, 4, 10, 11, 8, 1),
      changeType: ChangeType.CREATE,
      editor: adminId,
      subjectIdentification: adminGroupId,
      targetIdentification: undefined
    } as IHistoryChange;

    BaseBackendService.clearMockData();

    spyOn(configService, 'getConfig').and.returnValue(mockConfig);
  }


  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('getAdminGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIAdminGroup,
      status: Status.OK,
      messages: []
    }

    service.getAdminGroup(adminGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(mockIAdminGroup.description);
      expect(data.groupName).toEqual(mockIAdminGroup.groupName);
      expect(data.identification).toEqual(mockIAdminGroup.identification);
      expect(data.validFrom).toEqual(mockIAdminGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/getAdminGroup/${adminGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/getAdminGroup/${adminGroupId}`);

    tick();
  }));


  it('getAdminGroup - with error status', fakeAsync(() => {
    service.getAdminGroup(adminGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAdminGroup/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAdminGroup/${adminGroupId}`);

    tick();
  }));


  it('getAdminGroup - with fatal status', fakeAsync(() => {
    service.getAdminGroup(adminGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAdminGroup/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAdminGroup/${adminGroupId}`);

    tick();
  }));


  it('getAdminGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAdminGroup(adminGroupId).subscribe(
      data => {
        expect(data).toBeTruthy();
        expect(data.identification).toEqual(adminGroupId);
      });

    httpMock.expectNone(`//localhost:8080/admin/getAdminGroup/${adminGroupId}`);

    tick();
  }));


  it('getAdminGroup - mock with error', fakeAsync(() => {
    service.useMock = true;
    service.getAdminGroup('someId').subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while getting admin group someId from backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/admin/getAdminGroup/someId`);

    tick();
  }));


  it('getAdmin - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIUserAdmin,
      status: Status.OK,
      messages: []
    }

    service.getAdmin(adminId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(mockIUserAdmin.identification);
      expect(data.firstName).toEqual(mockIUserAdmin.firstName);
      expect(data.lastName).toEqual(mockIUserAdmin.lastName);
      expect(data.image).toBeUndefined();
      expect(data.smallImage).toBeUndefined();
      expect(data.lastLogin).toEqual(mockIUserAdmin.lastLogin);
      expect(data.validFrom).toEqual(mockIUserAdmin.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/getAdmin/${adminId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/getAdmin/${adminId}`);

    tick();
  }));


  it('getAdmin - with error status', fakeAsync(() => {
    service.getAdmin(adminId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAdmin/${adminId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAdmin/${adminId}`);

    tick();
  }));


  it('getAdmin - with fatal status', fakeAsync(() => {
    service.getAdmin(adminId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAdmin/${adminId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAdmin/${adminId}`);

    tick();
  }));


  it('getAdmin - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAdmin(adminId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(adminId);
    });

    httpMock.expectNone(`//localhost:8080/admin/getAdmin/${adminId}`);

    tick();
  }));


  it('getAdmin - mock with error', fakeAsync(() => {
    service.useMock = true;
    service.getAdmin('someId').subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`There is not any User with identification "someId"`);
      }
    });

    httpMock.expectNone(`//localhost:8080/admin/getAdmin/someId`);

    tick();
  }));




  /**
   * getAllAdmins
   */
  it('getAllAdmins - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUserAdmin],
      status: Status.OK,
      messages: []
    }

    service.getAllAdmins(adminGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUserAdmin.identification);
      expect(data[0].firstName).toEqual(mockIUserAdmin.firstName);
      expect(data[0].lastName).toEqual(mockIUserAdmin.lastName);
      expect(data[0].image).toBeUndefined();
      expect(data[0].smallImage).toBeUndefined();
      expect(data[0].lastLogin).toEqual(mockIUserAdmin.lastLogin);
      expect(data[0].validFrom).toEqual(mockIUserAdmin.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/getAllAdmins/${adminGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/getAllAdmins/${adminGroupId}`);

    tick();
  }));

  it('getAllAdmins - with pageing', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUserAdmin],
      status: Status.OK,
      messages: []
    }

    service.getAllAdmins(adminGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUserAdmin.identification);
      expect(data[0].firstName).toEqual(mockIUserAdmin.firstName);
      expect(data[0].lastName).toEqual(mockIUserAdmin.lastName);
      expect(data[0].image).toBeUndefined();
      expect(data[0].smallImage).toBeUndefined();
      expect(data[0].lastLogin).toEqual(mockIUserAdmin.lastLogin);
      expect(data[0].validFrom).toEqual(mockIUserAdmin.validFrom);
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/getAllAdmins/${adminGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/getAllAdmins/${adminGroupId}?page=1&size=50`);

    tick();
  }));


  it('getAllAdmins - with error status', fakeAsync(() => {
    service.getAllAdmins(adminGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAllAdmins/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAllAdmins/${adminGroupId}`);

    tick();
  }));


  it('getAllAdmins - with fatal status', fakeAsync(() => {
    service.getAllAdmins(adminGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAllAdmins/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAllAdmins/${adminGroupId}`);

    tick();
  }));


  it('getAllAdmins - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllAdmins(adminGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(adminId);
      expect(data[0].isComplete).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/admin/getAllAdmins/${adminGroupId}`);

    tick();
  }));




  /**
   * getAllAdminParts
   */
  it('getAllAdminParts - all ok', fakeAsync(() => {
    mockIUserAdmin.image = undefined;
    mockIUserAdmin.smallImage = undefined;
    mockIUserAdmin.lastLogin = undefined;
    mockIUserAdmin.validFrom = undefined;
    mockIUserAdmin.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUserAdmin],
      status: Status.OK,
      messages: []
    }

    service.getAllAdminParts(adminGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUserAdmin.identification);
      expect(data[0].firstName).toEqual(mockIUserAdmin.firstName);
      expect(data[0].lastName).toEqual(mockIUserAdmin.lastName);
      expect(data[0].image).toBeUndefined();
      expect(data[0].smallImage).toBeUndefined();
      expect(data[0].lastLogin).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/getAllAdminParts/${adminGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/getAllAdminParts/${adminGroupId}`);

    tick();
  }));

  it('getAllAdminParts - with pageing', fakeAsync(() => {
    mockIUserAdmin.image = undefined;
    mockIUserAdmin.smallImage = undefined;
    mockIUserAdmin.lastLogin = undefined;
    mockIUserAdmin.validFrom = undefined;
    mockIUserAdmin.validTo = undefined;

    let mockResponseWrapper: ResponseWrapper = {
      response: [mockIUserAdmin],
      status: Status.OK,
      messages: []
    }

    service.getAllAdminParts(adminGroupId, 1, 50).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(mockIUserAdmin.identification);
      expect(data[0].firstName).toEqual(mockIUserAdmin.firstName);
      expect(data[0].lastName).toEqual(mockIUserAdmin.lastName);
      expect(data[0].image).toBeUndefined();
      expect(data[0].smallImage).toBeUndefined();
      expect(data[0].lastLogin).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/getAllAdminParts/${adminGroupId}?page=1&size=50`);
    expect(req.request.method).toEqual("GET");
    expect(req.request.params.get('page')).toEqual('1');
    expect(req.request.params.get('size')).toEqual('50');
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/getAllAdminParts/${adminGroupId}?page=1&size=50`);

    tick();
  }));


  it('getAllAdminParts - with error status', fakeAsync(() => {
    service.getAllAdminParts(adminGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAllAdminParts/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAllAdminParts/${adminGroupId}`);

    tick();
  }));


  it('getAllAdminParts - with fatal status', fakeAsync(() => {
    service.getAllAdminParts(adminGroupId, undefined, undefined).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAllAdminParts/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAllAdminParts/${adminGroupId}`);

    tick();
  }));


  it('getAllAdminParts - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAllAdminParts(adminGroupId, undefined, undefined).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].identification).toEqual(adminId);
      expect(data[0].image).toBeUndefined();
      expect(data[0].smallImage).toBeUndefined();
      expect(data[0].lastLogin).toBeUndefined();
      expect(data[0].validFrom).toBeUndefined();
      expect(data[0].validTo).toBeUndefined();
      expect(data[0].isComplete).toBeFalse();
    });

    httpMock.expectNone(`//localhost:8080/admin/getAllAdminParts/${adminGroupId}`);

    tick();
  }));




  /**
   * updateAdminGroup
   */
  it('updateAdminGroup - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIAdminGroup,
      status: Status.OK,
      messages: []
    }

    service.updateAdminGroup(modifiedAdminGroup).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(mockIAdminGroup.description);
      expect(data.groupName).toEqual(mockIAdminGroup.groupName);
      expect(data.identification).toEqual(mockIAdminGroup.identification);
      expect(data.validFrom).toEqual(mockIAdminGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/updateAdminGroup/${adminGroupId}`);
    expect(req.request.method).toEqual("PUT");
    expect(req.request.body).toEqual(modifiedAdminGroup);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/updateAdminGroup/${adminGroupId}`);

    tick();
  }));


  it('updateAdminGroup - with error status', fakeAsync(() => {
    service.updateAdminGroup(modifiedAdminGroup).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/updateAdminGroup/${adminGroupId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/updateAdminGroup/${adminGroupId}`);

    tick();
  }));


  it('updateAdminGroup - with fatal status', fakeAsync(() => {
    service.updateAdminGroup(modifiedAdminGroup).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/updateAdminGroup/${adminGroupId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/updateAdminGroup/${adminGroupId}`);

    tick();
  }));



  it('updateAdminGroup - mock', fakeAsync(() => {
    service.useMock = true;
    service.updateAdminGroup(modifiedAdminGroup).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.description).toEqual(modifiedAdminGroup.description);
      expect(data.groupName).toEqual(modifiedAdminGroup.groupName);
      expect(data.identification).toEqual(modifiedAdminGroup.identification);
      expect(data.validFrom).toEqual(modifiedAdminGroup.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    httpMock.expectNone(`//localhost:8080/admin/updateAdminGroup/${adminGroupId}`);

    tick();
  }));


  it('updateAdminGroup - mock with error', fakeAsync(() => {
    service.useMock = true;
    let otherModifiedAdminGroup: AdminGroup = Object.assign({}, modifiedAdminGroup);
    otherModifiedAdminGroup.identification = 'someId';
    service.updateAdminGroup(otherModifiedAdminGroup).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating admin group someId at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/admin/updateAdminGroup/someId`);

    tick();
  }));


  it('updateAdmin - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIUserAdmin,
      status: Status.OK,
      messages: []
    }

    service.updateAdmin(modifiedUserAdmin).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(mockIUserAdmin.identification);
      expect(data.firstName).toEqual(mockIUserAdmin.firstName);
      expect(data.lastName).toEqual(mockIUserAdmin.lastName);
      expect(data.image).toBeUndefined();
      expect(data.smallImage).toBeUndefined();
      expect(data.lastLogin).toEqual(mockIUserAdmin.lastLogin);
      expect(data.validFrom).toEqual(mockIUserAdmin.validFrom);
      expect(data.validTo).toBeUndefined();
    });


    const req = httpMock.expectOne(`//localhost:8080/admin/updateAdmin/${adminId}`);
    expect(req.request.method).toEqual("PUT");
    expect(req.request.body).toEqual(modifiedUserAdmin);
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/updateAdmin/${adminId}`);

    tick();
  }));


  it('updateAdmin - with error status', fakeAsync(() => {
    service.updateAdmin(modifiedUserAdmin).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/updateAdmin/${adminId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/updateAdmin/${adminId}`);

    tick();
  }));


  it('updateAdmin - with fatal status', fakeAsync(() => {
    service.updateAdmin(modifiedUserAdmin).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/updateAdmin/${adminId}`);
      expect(req.request.method).toEqual("PUT");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/updateAdmin/${adminId}`);

    tick();
  }));



  it('updateAdmin - mock', fakeAsync(() => {
    service.useMock = true;
    service.updateAdmin(modifiedUserAdmin).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(modifiedUserAdmin.identification);
      expect(data.firstName).toEqual(modifiedUserAdmin.firstName);
      expect(data.lastName).toEqual(modifiedUserAdmin.lastName);
      expect(data.image).toBeUndefined();
      expect(data.smallImage).toBeUndefined();
      expect(data.lastLogin).toEqual(modifiedUserAdmin.lastLogin);
      expect(data.validFrom).toEqual(modifiedUserAdmin.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    httpMock.expectNone(`//localhost:8080/admin/updateAdmin/${adminId}`);

    tick();
  }));


  it('updateAdmin - mock with error', fakeAsync(() => {
    service.useMock = true;
    let otherModifiedUserAdmin: User = Object.assign({}, modifiedUserAdmin);
    otherModifiedUserAdmin.identification = 'someId';
    service.updateAdmin(otherModifiedUserAdmin).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while updating admin someId at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/admin/updateAdmin/someId`);

    tick();
  }));


  it('createAdmin - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIUserAdmin,
      status: Status.OK,
      messages: []
    }

    service.createAdmin(adminGroupId, firstName, lastName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(mockIUserAdmin.identification);
      expect(data.firstName).toEqual(mockIUserAdmin.firstName);
      expect(data.lastName).toEqual(mockIUserAdmin.lastName);
      expect(data.image).toBeUndefined();
      expect(data.smallImage).toBeUndefined();
      expect(data.lastLogin).toEqual(mockIUserAdmin.lastLogin);
      expect(data.validFrom).toEqual(mockIUserAdmin.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/createAdmin`);
    expect(req.request.method).toEqual("POST");
    expect(req.request.body).toEqual(`firstName=${firstName}&lastName=${lastName}&adminGroupIdentification=${adminGroupId}`)
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/createAdmin`);

    tick();
  }));


  it('createAdmin - with error status', fakeAsync(() => {
    service.createAdmin(adminGroupId, firstName, lastName).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/createAdmin`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`firstName=${firstName}&lastName=${lastName}&adminGroupIdentification=${adminGroupId}`)
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/createAdmin`);

    tick();
  }));


  it('createAdmin - with fatal status', fakeAsync(() => {
    service.createAdmin(adminGroupId, firstName, lastName).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/createAdmin`);
      expect(req.request.method).toEqual("POST");
      expect(req.request.body).toEqual(`firstName=${firstName}&lastName=${lastName}&adminGroupIdentification=${adminGroupId}`)
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/createAdmin`);

    tick();
  }));


  it('createAdmin - mock', fakeAsync(() => {
    service.useMock = true;
    service.createAdmin(adminGroupId, firstName, lastName).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual('UAA00003');
      expect(data.firstName).toEqual(firstName);
      expect(data.lastName).toEqual(lastName);
    });

    httpMock.expectNone(`//localhost:8080/admin/createAdmin`);

    tick();
  }));


  it('deleteAdmin - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    service.deleteAdmin(adminId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/deleteAdmin/${adminId}`);
    expect(req.request.method).toEqual("DELETE");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/deleteAdmin/${adminId}`);

    tick();
  }));


  it('deleteAdmin - with error status', fakeAsync(() => {
    service.deleteAdmin(adminId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/deleteAdmin/${adminId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/deleteAdmin/${adminId}`);

    tick();
  }));


  it('deleteAdmin - with fatal status', fakeAsync(() => {
    service.deleteAdmin(adminId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/deleteAdmin/${adminId}`);
      expect(req.request.method).toEqual("DELETE");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/deleteAdmin/${adminId}`);

    tick();
  }));


  it('deleteAdmin - mock', fakeAsync(() => {
    service.useMock = true;
    service.deleteAdmin(adminId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/admin/deleteAdmin/${adminId}`);

    tick();
  }));


  it('deleteAdmin - mock non existing', fakeAsync(() => {
    service.useMock = true;
    service.deleteAdmin('someId').subscribe(data => {
      expect(data).toBeFalse();
    });

    httpMock.expectNone(`//localhost:8080/admin/deleteAdmin/someId`);

    tick();
  }));


  it('countAdmins - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: 42,
      status: Status.OK,
      messages: []
    }

    service.countAdmins(adminGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(42);
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/countAdmins/${adminGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/countAdmins/${adminGroupId}`);

    tick();
  }));


  it('countAdmins - with error status', fakeAsync(() => {
    service.countAdmins(adminGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/countAdmins/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/countAdmins/${adminGroupId}`);

    tick();
  }));


  it('countAdmins - with fatal status', fakeAsync(() => {
    service.countAdmins(adminGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/countAdmins/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/countAdmins/${adminGroupId}`);

    tick();
  }));


  it('countAdmins - mock', fakeAsync(() => {
    service.useMock = true;
    service.countAdmins(adminGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toEqual(1);
    });

    httpMock.expectNone(`//localhost:8080/admin/countAdmins/${adminGroupId}`);

    tick();
  }));


  it('setPassword - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: true,
      status: Status.OK,
      messages: []
    }

    let newPwd = 'somePwd';

    service.setPassword(adminId, newPwd).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/setAdminPassword/${adminId}`);
    expect(req.request.method).toEqual("PATCH");
    expect(req.request.body).toEqual({ rawPassword: newPwd });
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/setAdminPassword/${adminId}`);

    tick();
  }));


  it('setPassword - with error status', fakeAsync(() => {
    let newPwd = 'somePwd';

    service.setPassword(adminId, newPwd).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/setAdminPassword/${adminId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ rawPassword: newPwd });
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/setAdminPassword/${adminId}`);

    tick();
  }));


  it('setPassword - with fatal status', fakeAsync(() => {
    let newPwd = 'somePwd';

    service.setPassword(adminId, newPwd).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/setAdminPassword/${adminId}`);
      expect(req.request.method).toEqual("PATCH");
      expect(req.request.body).toEqual({ rawPassword: newPwd });
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/setAdminPassword/${adminId}`);

    tick();
  }));


  it('setPassword - mock', fakeAsync(() => {
    let newPwd = 'somePwd';

    service.useMock = true;
    service.setPassword(adminId, newPwd).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data).toBeTrue();
    });

    httpMock.expectNone(`//localhost:8080/admin/setAdminPassword/${adminId}`);

    tick();
  }));


  it('setPassword - mock with error', fakeAsync(() => {
    let newPwd = 'somePwd';

    service.useMock = true;
    service.setPassword('someId', newPwd).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual(`${Status.ERROR} occurs while setting password of admin someId at backend`);
      }
    });

    httpMock.expectNone(`//localhost:8080/admin/setAdminPassword/someId`);

    tick();
  }));




  /**
   * getAdminGroupHistory
   */
  it('getAdminGroupHistory - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [groupHistoryChange],
      status: Status.OK,
      messages: []
    }

    service.getAdminGroupHistory(adminGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].action).toBeUndefined;
      expect(data[0].changeTime).toEqual(new Date(2022, 4, 10, 11, 8, 1));
      expect(data[0].changeType).toEqual(ChangeType.CREATE);
      expect(data[0].editor).toEqual(adminId);
      expect(data[0].subjectIdentification).toEqual(adminGroupId);
      expect(data[0].targetIdentification).toBeUndefined;
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/getAdminGroupHistory/${adminGroupId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/getAdminGroupHistory/${adminGroupId}`);

    tick();
  }));

  it('getAdminGroupHistory - with error status', fakeAsync(() => {
    service.getAdminGroupHistory(adminGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAdminGroupHistory/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAdminGroupHistory/${adminGroupId}`);

    tick();
  }));

  it('getAdminGroupHistory - with fatal status', fakeAsync(() => {
    service.getAdminGroupHistory(adminGroupId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAdminGroupHistory/${adminGroupId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAdminGroupHistory/${adminGroupId}`);

    tick();
  }));

  it('getAdminGroupHistory - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAdminGroupHistory(adminGroupId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(2);
      expect(data[0].subjectIdentification).toEqual(adminGroupId);
      expect(data[0].changeType).toEqual(ChangeType.CREATE);
      expect(data[1].subjectIdentification).toEqual(adminGroupId);
      expect(data[1].changeType).toEqual(ChangeType.MODIFY);
    });

    httpMock.expectNone(`//localhost:8080/admin/getAdminGroupHistory/${adminGroupId}`);

    tick();
  }));




  /**
   * getAdminHistory
   */
  it('getAdminHistory - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: [historyChange],
      status: Status.OK,
      messages: []
    }

    service.getAdminHistory(adminId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(1);
      expect(data[0].action).toBeUndefined;
      expect(data[0].changeTime).toEqual(new Date(2022, 4, 10, 11, 8, 1));
      expect(data[0].changeType).toEqual(ChangeType.CREATE);
      expect(data[0].editor).toEqual(adminId);
      expect(data[0].subjectIdentification).toEqual(adminId);
      expect(data[0].targetIdentification).toBeUndefined;
    });

    const req = httpMock.expectOne(`//localhost:8080/admin/getAdminHistory/${adminId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/admin/getAdminHistory/${adminId}`);

    tick();
  }));

  it('getAdminHistory - with error status', fakeAsync(() => {
    service.getAdminHistory(adminId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAdminHistory/${adminId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAdminHistory/${adminId}`);

    tick();
  }));

  it('getAdminHistory - with fatal status', fakeAsync(() => {
    service.getAdminHistory(adminId).subscribe({
      next: data => { expect(data).toBeFalsy(); },
      error: e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      }
    });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/admin/getAdminHistory/${adminId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/admin/getAdminHistory/${adminId}`);

    tick();
  }));

  it('getAdminHistory - mock', fakeAsync(() => {
    service.useMock = true;
    service.getAdminHistory(adminId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.length).toEqual(2);
      expect(data[0].subjectIdentification).toEqual(adminId);
      expect(data[0].changeType).toEqual(ChangeType.CREATE);
      expect(data[1].subjectIdentification).toEqual(adminId);
      expect(data[1].changeType).toEqual(ChangeType.MODIFY);
    });

    httpMock.expectNone(`//localhost:8080/admin/getAdminHistory/${adminId}`);

    tick();
  }));
});
