import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConfigService } from '../../config/config.service';
import { AdminService } from '../backend/admin.service';
import { SelectionService } from '../util/selection.service';
import { UserService } from '../backend/user.service';


import { CommonGroupsGuardService } from './common-groups-guard.service';
import { CommonGroupPermissionsService } from '../permissions/common-group-permissions.service';

describe('CommonGroupGuardService', () => {
  let service: CommonGroupsGuardService;
  let adminService: AdminService;
  let userService: UserService;
  let selectionService: SelectionService;
  let commonGroupPermissionsService: CommonGroupPermissionsService
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;


  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    selectionService = TestBed.inject(SelectionService);
    commonGroupPermissionsService = TestBed.inject(CommonGroupPermissionsService);


    service = TestBed.inject(CommonGroupsGuardService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });




  /**
   * canActivate
   */
  it('canActivate - allowed to get all common groups and parts', fakeAsync(() => {
    let isAllowedToGetAllCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToGetAllCommonGroup').and.returnValue(true);
    let isAllowedToGetAllCommonGroupPartsSpy = spyOn(commonGroupPermissionsService, 'isAllowedToGetAllCommonGroupParts').and.returnValue(true);

    service.canActivate().subscribe(data => expect(data).toBeTrue());

    expect(isAllowedToGetAllCommonGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllCommonGroupPartsSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - not allowed to get all common groups, but parts', fakeAsync(() => {
    let isAllowedToGetAllCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToGetAllCommonGroup').and.returnValue(false);
    let isAllowedToGetAllCommonGroupPartsSpy = spyOn(commonGroupPermissionsService, 'isAllowedToGetAllCommonGroupParts').and.returnValue(true);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllCommonGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllCommonGroupPartsSpy).not.toHaveBeenCalled();

    tick();
  }));

  it('canActivate - not allowed to get all common group parts, but base groups', fakeAsync(() => {
    let isAllowedToGetAllCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToGetAllCommonGroup').and.returnValue(true);
    let isAllowedToGetAllCommonGroupPartsSpy = spyOn(commonGroupPermissionsService, 'isAllowedToGetAllCommonGroupParts').and.returnValue(false);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllCommonGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllCommonGroupPartsSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - not allowed to get all common group and parts', fakeAsync(() => {
    let isAllowedToGetAllCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToGetAllCommonGroup').and.returnValue(false);
    let isAllowedToGetAllCommonGroupPartsSpy = spyOn(commonGroupPermissionsService, 'isAllowedToGetAllCommonGroupParts').and.returnValue(false);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllCommonGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllCommonGroupPartsSpy).not.toHaveBeenCalled();

    tick();
  }));
});
