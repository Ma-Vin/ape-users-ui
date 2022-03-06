import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Role } from '../../model/role.model';
import { ConfigService } from '../../config/config.service';
import { IUser, User } from '../../model/user.model';
import { AdminService } from '../backend/admin.service';
import { UserService } from '../backend/user.service';
import { SelectionService } from '../util/selection.service';

import { AdminPermissionsService } from './admin-permissions.service';

describe('AdminPermissionsService', () => {
  let service: AdminPermissionsService;
  let adminService: AdminService;
  let userService: UserService;
  let selectionService: SelectionService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  let getActiveUserSpy: jasmine.Spy<() => User | undefined>;

  let activeUser: User;
  const userId = 'UAA00001';
  const firstName = 'Max';
  const lastName = 'Power';


  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    selectionService = TestBed.inject(SelectionService);

    initMockData();

    getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(activeUser);

    service = TestBed.inject(AdminPermissionsService);
  });

  function initMockData() {
    activeUser = User.map({
      identification: userId,
      firstName: firstName,
      lastName: lastName,
      mail: `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}@ma-vin.de`,
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      role: Role.VISITOR,
      isGlobalAdmin: false,
      isComplete: true
    } as IUser);
  }


  it('should be created', () => {
    expect(service).toBeTruthy();
  });



  /**
   * isAllowedToUseAnyMethod
   */
  it('isAllowedToUseAnyMethod - global admin', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToUseAnyMethod()).toBeTrue();
  });

  it('isAllowedToUseAnyMethod - non global admin', () => {
    activeUser.isGlobalAdmin = false;
    expect(service.isAllowedToUseAnyMethod()).toBeFalse();
  });

  it('isAllowedToUseAnyMethod - undefined active user', () => {
    activeUser.isGlobalAdmin = true;
    getActiveUserSpy.and.returnValue(undefined);
    expect(service.isAllowedToUseAnyMethod()).toBeFalse();
  });
});
