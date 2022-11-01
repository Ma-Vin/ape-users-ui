import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { AdminGroup, IAdminGroup } from '../../model/admin-group.model';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { Role } from '../../model/role.model';
import { User } from '../../model/user.model';
import { AdminService } from '../backend/admin.service';
import { CommonGroupService } from '../backend/common-group.service';
import { SelectionService } from './selection.service';
import { UserService } from '../backend/user.service';

describe('SelectionService', () => {
  let service: SelectionService;
  let commonGroupService: CommonGroupService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;


  const adminId = 'UAA00001';
  const userId = 'UAA00002';
  const firstName = 'Max';
  const lastName = 'Power';

  const admin = User.map({
    identification: adminId,
    firstName: firstName,
    lastName: lastName,
    mail: 'max.power@ma-vin.de',
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    isGlobalAdmin: true
  } as User);

  const user = User.map({
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

  const adminGroup = AdminGroup.map({
    description: 'description of admin group',
    groupName: 'Admins',
    identification: 'AGAA00001',
    validFrom: new Date(2021, 1, 1),
    validTo: undefined
  } as IAdminGroup)

  const commonGroup = CommonGroup.map({
    defaultRole: Role.VISITOR,
    description: 'description of common group',
    groupName: 'Common',
    identification: 'CGAA00001',
    validFrom: new Date(2021, 1, 1),
    validTo: undefined
  } as ICommonGroup);



  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    commonGroupService = TestBed.inject(CommonGroupService);

    service = TestBed.inject(SelectionService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('setActiveUser - user', fakeAsync(() => {
    let commonGroupServiceSpy = spyOn(commonGroupService, 'getParentCommonGroupOfUser').and.returnValue(of(commonGroup));

    service.setActiveUser(user);

    expect(commonGroupServiceSpy).toHaveBeenCalled();

    tick();

    expect(service.getActiveUser()).toBeTruthy();
    expect(service.getActiveUser()).toEqual(user);
    expect(service.getSelectedCommonGroup()).toBeTruthy();
    expect(service.getSelectedCommonGroup()).toEqual(commonGroup);
  }));


  it('setActiveUser - admin', fakeAsync(() => {
    let commonGroupServiceSpy = spyOn(commonGroupService, 'getParentCommonGroupOfUser').and.callFake(userId => throwError(()=>new Error(`The parent common group of user "${userId}" was not found`)));

    service.setActiveUser(admin);

    expect(commonGroupServiceSpy).not.toHaveBeenCalled();

    tick();

    expect(service.getActiveUser()).toBeTruthy();
    expect(service.getActiveUser()).toEqual(admin);
    expect(service.getSelectedCommonGroup()).toBeFalsy();
  }));


  it('setActiveUser - undefined', fakeAsync(() => {
    let commonGroupServiceSpy = spyOn(commonGroupService, 'getParentCommonGroupOfUser').and.callFake(userId => throwError(() => new Error(`The parent common group of user "${userId}" was not found`)));

    service.setActiveUser(undefined);

    expect(commonGroupServiceSpy).not.toHaveBeenCalled();

    tick();

    expect(service.getActiveUser()).toBeFalsy();
    expect(service.getSelectedCommonGroup()).toBeFalsy();
  }));


  it('removeActiveUser - user', fakeAsync(() => {

    service.setActiveUser(user);

    tick();

    service.removeActiveUser();
    expect(service.getActiveUser()).not.toBeDefined();
  }));



  it('get-/setSelectedAdminGroup', () => {
    service.setSelectedAdminGroup(adminGroup);
    expect(service.getSelectedAdminGroup()).toEqual(adminGroup);
  });


  it('get-/setSelectedCommonGroup', () => {
    service.setSelectedCommonGroup(commonGroup);
    expect(service.getSelectedCommonGroup()).toEqual(commonGroup);
  });


});
