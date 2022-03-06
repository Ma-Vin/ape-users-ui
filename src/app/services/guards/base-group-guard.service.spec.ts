import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConfigService } from '../../config/config.service';
import { AdminService } from '../backend/admin.service';
import { CommonGroupService } from '../backend/common-group.service';
import { UserService } from '../backend/user.service';
import { BaseGroupPermissionsService } from '../permissions/base-group-permissions.service';
import { SelectionService } from '../util/selection.service';

import { BaseGroupGuardService } from './base-group-guard.service';

describe('BaseGroupGuardService', () => {
  let service: BaseGroupGuardService;
  let baseGroupPermissionsService: BaseGroupPermissionsService
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
    baseGroupPermissionsService = TestBed.inject(BaseGroupPermissionsService);

    service = TestBed.inject(BaseGroupGuardService);
  });



  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  /**
   * canActivate
   */
  it('canActivate - allowed to get all base groups and parts', fakeAsync(() => {
    let isAllowedToGetAllBaseGroupsSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBaseGroups').and.returnValue(true);
    let isAllowedToGetAllBaseGroupPartsSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBaseGroupParts').and.returnValue(true);

    service.canActivate().subscribe(data => expect(data).toBeTrue());

    expect(isAllowedToGetAllBaseGroupsSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBaseGroupPartsSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - not allowed to get all base groups, but parts', fakeAsync(() => {
    let isAllowedToGetAllBaseGroupsSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBaseGroups').and.returnValue(false);
    let isAllowedToGetAllBaseGroupPartsSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBaseGroupParts').and.returnValue(true);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllBaseGroupsSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBaseGroupPartsSpy).not.toHaveBeenCalled();

    tick();
  }));


  it('canActivate - not allowed to get all base group parts, but base groups', fakeAsync(() => {
    let isAllowedToGetAllBaseGroupsSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBaseGroups').and.returnValue(true);
    let isAllowedToGetAllBaseGroupPartsSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBaseGroupParts').and.returnValue(false);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllBaseGroupsSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBaseGroupPartsSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - not allowed to get all base group and parts', fakeAsync(() => {
    let isAllowedToGetAllBaseGroupsSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBaseGroups').and.returnValue(false);
    let isAllowedToGetAllBaseGroupPartsSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBaseGroupParts').and.returnValue(false);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllBaseGroupsSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBaseGroupPartsSpy).not.toHaveBeenCalled();

    tick();
  }));
});
