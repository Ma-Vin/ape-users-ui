import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConfigService } from '../../config/config.service';
import { AdminService } from '../backend/admin.service';
import { SelectionService } from '../util/selection.service';
import { UserService } from '../backend/user.service';
import { UserPermissionsService } from '../permissions/user-permissions.service';

import { UsersGuardService } from './users-guard.service';

describe('UsersGuardService', () => {
  let service: UsersGuardService;
  let adminService: AdminService;
  let userService: UserService;
  let selectionService: SelectionService;
  let userPermissionsService: UserPermissionsService
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
    userPermissionsService = TestBed.inject(UserPermissionsService);


    service = TestBed.inject(UsersGuardService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });




  /**
   * canActivate
   */
  it('canActivate - allowed to get all users and parts', fakeAsync(() => {
    let isAllowedToGetAllUsersSpy = spyOn(userPermissionsService, 'isAllowedToGetAllUsers').and.returnValue(true);
    let isAllowedToGetAllUserPartsSpy = spyOn(userPermissionsService, 'isAllowedToGetAllUserParts').and.returnValue(true);

    service.canActivate().subscribe(data => expect(data).toBeTrue());

    expect(isAllowedToGetAllUsersSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllUserPartsSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - not allowed to get all users, but parts', fakeAsync(() => {
    let isAllowedToGetAllUsersSpy = spyOn(userPermissionsService, 'isAllowedToGetAllUsers').and.returnValue(false);
    let isAllowedToGetAllUserPartsSpy = spyOn(userPermissionsService, 'isAllowedToGetAllUserParts').and.returnValue(true);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllUsersSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllUserPartsSpy).not.toHaveBeenCalled();

    tick();
  }));

  it('canActivate - not allowed to get all user parts, but users', fakeAsync(() => {
    let isAllowedToGetAllUsersSpy = spyOn(userPermissionsService, 'isAllowedToGetAllUsers').and.returnValue(true);
    let isAllowedToGetAllUserPartsSpy = spyOn(userPermissionsService, 'isAllowedToGetAllUserParts').and.returnValue(false);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllUsersSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllUserPartsSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - not allowed to get all users and parts', fakeAsync(() => {
    let isAllowedToGetAllUsersSpy = spyOn(userPermissionsService, 'isAllowedToGetAllUsers').and.returnValue(false);
    let isAllowedToGetAllUserPartsSpy = spyOn(userPermissionsService, 'isAllowedToGetAllUserParts').and.returnValue(false);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(isAllowedToGetAllUsersSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllUserPartsSpy).not.toHaveBeenCalled();

    tick();
  }));
});
