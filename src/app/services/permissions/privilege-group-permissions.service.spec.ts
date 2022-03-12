import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from 'src/app/config/config.service';
import { Role } from 'src/app/model/role.model';
import { IUser, User } from 'src/app/model/user.model';
import { AdminService } from '../backend/admin.service';
import { UserService } from '../backend/user.service';
import { SelectionService } from '../util/selection.service';

import { PrivilegeGroupPermissionsService } from './privilege-group-permissions.service';

describe('PrivilegeGroupPermissionsService', () => {
  let service: PrivilegeGroupPermissionsService;
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

    service = TestBed.inject(PrivilegeGroupPermissionsService);

    getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(activeUser);
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
   * isAllowedCreatePrivilegeGroup
   */
  it('isAllowedCreatePrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedCreatePrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedCreatePrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedCreatePrivilegeGroup()).toBeTrue();
  });

  it('isAllowedCreatePrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedCreatePrivilegeGroup()).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedCreatePrivilegeGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedCreatePrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedCreatePrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToDeletePrivilegeGroup
   */
  it('isAllowedToDeletePrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToDeletePrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToDeletePrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToDeletePrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToDeletePrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToDeletePrivilegeGroup()).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToDeletePrivilegeGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToDeletePrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToDeletePrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetPrivilegeGroup
   */
  it('isAllowedToGetPrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetPrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetPrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToGetPrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetPrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToUpdatePrivilegeGroup
   */
  it('isAllowedToUpdatePrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToUpdatePrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToUpdatePrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToUpdatePrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToUpdatePrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToUpdatePrivilegeGroup()).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToUpdatePrivilegeGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToUpdatePrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToUpdatePrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToCountPrivilegeGroups
   */
  it('isAllowedToCountPrivilegeGroups - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToCountPrivilegeGroups()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToCountPrivilegeGroups()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToCountPrivilegeGroups()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToCountPrivilegeGroups()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToCountPrivilegeGroups()).toBeTrue();
  });

  it('isAllowedToCountPrivilegeGroups - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToCountPrivilegeGroups()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToCountPrivilegeGroups()).toBeFalse();
  });




  /**
   * isAllowedToGetAllPrivilegeGroups
   */
  it('isAllowedToGetAllPrivilegeGroups - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllPrivilegeGroups()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAllPrivilegeGroups()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAllPrivilegeGroups()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAllPrivilegeGroups()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAllPrivilegeGroups()).toBeTrue();
  });

  it('isAllowedToGetAllPrivilegeGroups - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAllPrivilegeGroups()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAllPrivilegeGroups()).toBeFalse();
  });




  /**
   * isAllowedToGetAllPrivilegeGroupParts
   */
  it('isAllowedToGetAllPrivilegeGroupParts - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllPrivilegeGroupParts()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAllPrivilegeGroupParts()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAllPrivilegeGroupParts()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAllPrivilegeGroupParts()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAllPrivilegeGroupParts()).toBeTrue();
  });

  it('isAllowedToGetAllPrivilegeGroupParts - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAllPrivilegeGroupParts()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAllPrivilegeGroupParts()).toBeFalse();
  });

});