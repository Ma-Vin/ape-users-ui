import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConfigService } from 'src/app/config/config.service';
import { AdminService } from '../backend/admin.service';
import { CommonGroupService } from '../backend/common-group.service';
import { UserService } from '../backend/user.service';
import { PrivilegeGroupPermissionsService } from '../permissions/privilege-group-permissions.service';
import { SelectionService } from '../util/selection.service';

import { PrivilegeGroupGuardService } from './privilege-group-guard.service';

describe('PrivilegeGroupGuardService', () => {
  let service: PrivilegeGroupGuardService;
  let privilegeGroupPermissionService: PrivilegeGroupPermissionsService;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let configService: ConfigService;
  let selectionService: SelectionService;
  let httpMock: HttpTestingController;
  let http: HttpClient;


  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    commonGroupService = TestBed.inject(CommonGroupService);
    selectionService = TestBed.inject(SelectionService);
    privilegeGroupPermissionService = TestBed.inject(PrivilegeGroupPermissionsService);

    service = TestBed.inject(PrivilegeGroupGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  /**
   * canActivate
   */
  it('canActivate - allowed to get all privilege groups and parts', fakeAsync(() => {
    let isAllowedToGetAllPrivilegeGroupsSpy = spyOn(privilegeGroupPermissionService, 'isAllowedToGetAllPrivilegeGroups').and.returnValue(true);
    let isAllowedToGetAllPrivilegeGroupPartsSpy = spyOn(privilegeGroupPermissionService, 'isAllowedToGetAllPrivilegeGroupParts').and.returnValue(true);

    service.canActivate().subscribe(data => expect(data).toBeTrue());

    expect(isAllowedToGetAllPrivilegeGroupsSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllPrivilegeGroupPartsSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - not allowed to get all privilege groups, but parts', fakeAsync(() => {
    let isAllowedToGetAllPrivilegeGroupsSpy = spyOn(privilegeGroupPermissionService, 'isAllowedToGetAllPrivilegeGroups').and.returnValue(false);
    let isAllowedToGetAllPrivilegeGroupPartsSpy = spyOn(privilegeGroupPermissionService, 'isAllowedToGetAllPrivilegeGroupParts').and.returnValue(true);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllPrivilegeGroupsSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllPrivilegeGroupPartsSpy).not.toHaveBeenCalled();

    tick();
  }));

  it('canActivate - not allowed to get all privilege group parts, but base groups', fakeAsync(() => {
    let isAllowedToGetAllPrivilegeGroupsSpy = spyOn(privilegeGroupPermissionService, 'isAllowedToGetAllPrivilegeGroups').and.returnValue(true);
    let isAllowedToGetAllPrivilegeGroupPartsSpy = spyOn(privilegeGroupPermissionService, 'isAllowedToGetAllPrivilegeGroupParts').and.returnValue(false);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllPrivilegeGroupsSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllPrivilegeGroupPartsSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - not allowed to get all privilege group and parts', fakeAsync(() => {
    let isAllowedToGetAllPrivilegeGroupsSpy = spyOn(privilegeGroupPermissionService, 'isAllowedToGetAllPrivilegeGroups').and.returnValue(false);
    let isAllowedToGetAllPrivilegeGroupPartsSpy = spyOn(privilegeGroupPermissionService, 'isAllowedToGetAllPrivilegeGroupParts').and.returnValue(false);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllPrivilegeGroupsSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllPrivilegeGroupPartsSpy).not.toHaveBeenCalled();

    tick();
  }));
});
