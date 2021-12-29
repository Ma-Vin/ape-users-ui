import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '../../config/config.service';
import { Role } from '../../model/role.model';
import { IUser, User } from '../../model/user.model';
import { AdminService } from '../backend/admin.service';
import { SelectionService } from '../util/selection.service';

import { UserPermissionsService } from './user-permissions.service';
import { UserService } from '../backend/user.service';

describe('PermissionsService', () => {
  let service: UserPermissionsService;
  let adminService: AdminService;
  let userService: UserService;
  let selectionService: SelectionService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  let selectionServiceSpy: jasmine.Spy<() => User | undefined>;

  const userId = 'UAA00001';
  const otherUserId = 'UAA00002';
  const firstName = 'Max';
  const otherFirstName = 'Lower';
  const lastName = 'Power';
  const otherLastName = 'Power';

  let activeUser: User;
  let otherUser: User;

  const allRoles = [Role.ADMIN, Role.MANAGER, Role.CONTRIBUTOR, Role.VISITOR, Role.NOT_RELEVANT, Role.BLOCKED, undefined];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    selectionService = TestBed.inject(SelectionService);

    service = TestBed.inject(UserPermissionsService);

    initMockData();

    selectionServiceSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(activeUser);
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
      isGlobalAdmin: false
    } as IUser);

    otherUser = User.map({
      identification: otherUserId,
      firstName: otherFirstName,
      lastName: otherLastName,
      mail: `${otherFirstName.toLocaleLowerCase()}.${otherLastName.toLocaleLowerCase()}@ma-vin.de`,
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 10, 30, 20, 15, 1),
      validFrom: new Date(2021, 10, 1),
      validTo: undefined,
      role: Role.VISITOR,
      isGlobalAdmin: false
    } as IUser);
  }


  it('should be created', () => {
    expect(service).toBeTruthy();
  });



  /**
   * isAllowedToCreateUser
   */
  it('isAllowedToCreateUser - authorized', () => {
    // VISITOR
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToCreateUser()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToCreateUser()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToCreateUser()).toBeTrue();
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToCreateUser()).toBeTrue();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(4);
  });

  it('isAllowedToCreateUser -  unauthorized', () => {
    // VISITOR
    expect(service.isAllowedToCreateUser()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToCreateUser()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToCreateUser()).toBeFalse();
    activeUser.role = undefined;
    expect(service.isAllowedToCreateUser()).toBeFalse();
    selectionServiceSpy.and.returnValue(undefined);
    expect(service.isAllowedToCreateUser()).toBeFalse();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(5);
  });



  /**
   * isAllowedToDeleteUser
   */
  it('isAllowedToDeleteUser - authorized', () => {
    // VISITOR
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToDeleteUser(otherUser)).toBeTrue();
    let expectedCalls = 1;
    activeUser.isGlobalAdmin = false;

    expectedCalls += checkIsAllowedToDeleteUser(Role.ADMIN, Role.ADMIN);
    expectedCalls += checkIsAllowedToDeleteUser(Role.MANAGER, Role.CONTRIBUTOR);

    expect(selectionServiceSpy).toHaveBeenCalledTimes(expectedCalls);
  });

  function checkIsAllowedToDeleteUser(roleOfActiveUser: Role, stopAtRoleOfUserToDelete: Role): number {
    activeUser.role = roleOfActiveUser;
    let expectedCalls = 0;
    for (let i = allRoles.length - 1; i >= 0; i--) {
      expectedCalls++;
      otherUser.role = allRoles[i];
      expect(service.isAllowedToDeleteUser(otherUser)).toBeTrue();
      if (stopAtRoleOfUserToDelete == allRoles[i]) {
        break;
      }
    }
    return expectedCalls;
  }

  it('isAllowedToDeleteUser -  unauthorized', () => {
    let expectedCalls = 0;

    expectedCalls += checkIsNotAllowedToDeleteUser(Role.MANAGER, Role.MANAGER);
    expectedCalls += checkIsNotAllowedToDeleteUser(Role.CONTRIBUTOR, undefined);
    expectedCalls += checkIsNotAllowedToDeleteUser(Role.VISITOR, undefined);
    expectedCalls += checkIsNotAllowedToDeleteUser(Role.NOT_RELEVANT, undefined);
    expectedCalls += checkIsNotAllowedToDeleteUser(Role.BLOCKED, undefined);
    expectedCalls += checkIsNotAllowedToDeleteUser(undefined, undefined);

    selectionServiceSpy.and.returnValue(undefined);
    expect(service.isAllowedToDeleteUser(otherUser)).toBeFalse();
    expectedCalls++;

    expect(selectionServiceSpy).toHaveBeenCalledTimes(expectedCalls);
  });

  function checkIsNotAllowedToDeleteUser(roleOfActiveUser: Role | undefined, startAtRoleOfUserToDelete: Role | undefined): number {
    activeUser.role = roleOfActiveUser;
    let expectedCalls = 0;
    let startCheck = false;
    for (let i = allRoles.length - 1; i >= 0; i--) {
      if (startAtRoleOfUserToDelete == allRoles[i]) {
        startCheck = true;
      }
      if (startCheck) {
        expectedCalls++;
        otherUser.role = allRoles[i];
        expect(service.isAllowedToDeleteUser(otherUser)).toBeFalse();
      }
    }
    return expectedCalls;
  }



  /**
   * isAllowedToGetUser
   */
  it('isAllowedToGetUser - authorized', () => {
    activeUser.isGlobalAdmin = true;
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetUser()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = undefined;
    expect(service.isAllowedToGetUser()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetUser()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetUser()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetUser()).toBeTrue();
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetUser()).toBeTrue();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(6);
  });

  it('isAllowedToGetUser -  unauthorized', () => {
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetUser()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetUser()).toBeFalse();
    selectionServiceSpy.and.returnValue(undefined);
    expect(service.isAllowedToGetUser()).toBeFalse();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(3);
  });



  /**
   * isAllowedToUpdateUser
   */
  it('isAllowedToUpdateUser - authorized', () => {
    // Global Admin
    // VISITOR
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToUpdateUser(otherUser)).toBeTrue();
    activeUser.isGlobalAdmin = false;

    // Itself
    // VISITOR
    expect(service.isAllowedToUpdateUser(activeUser)).toBeTrue();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToUpdateUser(activeUser)).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToUpdateUser(activeUser)).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToUpdateUser(activeUser)).toBeTrue();

    // Other
    let expectedCalls = 5;
    expectedCalls += checkIsAllowedToUpdateUser(Role.ADMIN, Role.ADMIN);
    expectedCalls += checkIsAllowedToUpdateUser(Role.MANAGER, Role.CONTRIBUTOR);

    expect(selectionServiceSpy).toHaveBeenCalledTimes(expectedCalls);
  });

  function checkIsAllowedToUpdateUser(roleOfActiveUser: Role, stopAtRoleOfUserToUpdate: Role): number {
    activeUser.role = roleOfActiveUser;
    let expectedCalls = 0;
    for (let i = allRoles.length - 1; i >= 0; i--) {
      expectedCalls++;
      otherUser.role = allRoles[i];
      expect(service.isAllowedToUpdateUser(otherUser)).toBeTrue();
      if (stopAtRoleOfUserToUpdate == allRoles[i]) {
        break;
      }
    }
    return expectedCalls;
  }

  it('isAllowedToUpdateUser -  unauthorized', () => {
    // Itself
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToUpdateUser(activeUser)).toBeFalse();
    let expectedCalls = 1;

    // Other
    expectedCalls += checkIsNotAllowedToUpdateUser(Role.MANAGER, Role.MANAGER);
    expectedCalls += checkIsNotAllowedToUpdateUser(Role.CONTRIBUTOR, undefined);
    expectedCalls += checkIsNotAllowedToUpdateUser(Role.VISITOR, undefined);
    expectedCalls += checkIsNotAllowedToUpdateUser(Role.NOT_RELEVANT, undefined);
    expectedCalls += checkIsNotAllowedToUpdateUser(Role.BLOCKED, undefined);
    expectedCalls += checkIsNotAllowedToUpdateUser(undefined, undefined);

    selectionServiceSpy.and.returnValue(undefined);
    expect(service.isAllowedToUpdateUser(otherUser)).toBeFalse();
    expectedCalls++;

    expect(selectionServiceSpy).toHaveBeenCalledTimes(expectedCalls);
  });

  function checkIsNotAllowedToUpdateUser(roleOfActiveUser: Role | undefined, startAtRoleOfUserToUpdate: Role | undefined): number {
    activeUser.role = roleOfActiveUser;
    let expectedCalls = 0;
    let startCheck = false;
    for (let i = allRoles.length - 1; i >= 0; i--) {
      if (startAtRoleOfUserToUpdate == allRoles[i]) {
        startCheck = true;
      }
      if (startCheck) {
        expectedCalls++;
        otherUser.role = allRoles[i];
        expect(service.isAllowedToUpdateUser(otherUser)).toBeFalse();
      }
    }
    return expectedCalls;
  }



  /**
   * isAllowedToSetPasswordOfUser
   */
  it('isAllowedToSetPasswordOfUser - authorized', () => {
    // Global Admin
    // VISITOR
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToSetPasswordOfUser(otherUser)).toBeTrue();
    activeUser.isGlobalAdmin = false;

    // Itself
    // VISITOR
    expect(service.isAllowedToSetPasswordOfUser(activeUser)).toBeTrue();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToSetPasswordOfUser(activeUser)).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToSetPasswordOfUser(activeUser)).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToSetPasswordOfUser(activeUser)).toBeTrue();

    // Other
    let expectedCalls = 5;
    expectedCalls += checkIsAllowedToSetPasswordOfUser(Role.ADMIN, Role.ADMIN);

    expect(selectionServiceSpy).toHaveBeenCalledTimes(expectedCalls);
  });

  function checkIsAllowedToSetPasswordOfUser(roleOfActiveUser: Role, stopAtRoleOfUserToUpdate: Role): number {
    activeUser.role = roleOfActiveUser;
    let expectedCalls = 0;
    for (let i = allRoles.length - 1; i >= 0; i--) {
      expectedCalls++;
      otherUser.role = allRoles[i];
      expect(service.isAllowedToSetPasswordOfUser(otherUser)).toBeTrue();
      if (stopAtRoleOfUserToUpdate == allRoles[i]) {
        break;
      }
    }
    return expectedCalls;
  }

  it('isAllowedToSetPasswordOfUser -  unauthorized', () => {
    // Itself
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToSetPasswordOfUser(activeUser)).toBeFalse();
    let expectedCalls = 1;

    // Other
    expectedCalls += checkIsNotAllowedToSetPasswordOfUser(Role.MANAGER, undefined);
    expectedCalls += checkIsNotAllowedToSetPasswordOfUser(Role.CONTRIBUTOR, undefined);
    expectedCalls += checkIsNotAllowedToSetPasswordOfUser(Role.VISITOR, undefined);
    expectedCalls += checkIsNotAllowedToSetPasswordOfUser(Role.NOT_RELEVANT, undefined);
    expectedCalls += checkIsNotAllowedToSetPasswordOfUser(Role.BLOCKED, undefined);
    expectedCalls += checkIsNotAllowedToSetPasswordOfUser(undefined, undefined);

    selectionServiceSpy.and.returnValue(undefined);
    expect(service.isAllowedToSetPasswordOfUser(otherUser)).toBeFalse();
    expectedCalls++;

    expect(selectionServiceSpy).toHaveBeenCalledTimes(expectedCalls);
  });

  function checkIsNotAllowedToSetPasswordOfUser(roleOfActiveUser: Role | undefined, startAtRoleOfUserToUpdate: Role | undefined): number {
    activeUser.role = roleOfActiveUser;
    let expectedCalls = 0;
    let startCheck = false;
    for (let i = allRoles.length - 1; i >= 0; i--) {
      if (startAtRoleOfUserToUpdate == allRoles[i]) {
        startCheck = true;
      }
      if (startCheck) {
        expectedCalls++;
        otherUser.role = allRoles[i];
        expect(service.isAllowedToSetPasswordOfUser(otherUser)).toBeFalse();
      }
    }
    return expectedCalls;
  }



  /**
   * isAllowedToSetRoleOfUser
   */
  it('isAllowedToSetRoleOfUser - authorized', () => {
    // VISITOR
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToSetRoleOfUser()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToSetRoleOfUser()).toBeTrue();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(2);
  });

  it('isAllowedToSetRoleOfUser -  unauthorized', () => {
    // VISITOR
    expect(service.isAllowedToSetRoleOfUser()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToSetRoleOfUser()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToSetRoleOfUser()).toBeFalse();
    activeUser.role = undefined;
    expect(service.isAllowedToSetRoleOfUser()).toBeFalse();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToSetRoleOfUser()).toBeFalse();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToSetRoleOfUser()).toBeFalse();
    selectionServiceSpy.and.returnValue(undefined);
    expect(service.isAllowedToSetRoleOfUser()).toBeFalse();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(7);
  });



  /**
   * isAllowedToGetAllUsers
   */
  it('isAllowedToGetAllUsers - authorized', () => {
    activeUser.role = Role.NOT_RELEVANT;
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllUsers()).toBeTrue();
    activeUser.role = Role.VISITOR;
    activeUser.isGlobalAdmin = false;
    expect(service.isAllowedToGetAllUsers()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAllUsers()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAllUsers()).toBeTrue();
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAllUsers()).toBeTrue();
    activeUser.role = undefined;
    expect(service.isAllowedToGetAllUsers()).toBeTrue();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(6);
  });

  it('isAllowedToGetAllUsers -  unauthorized', () => {
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAllUsers()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAllUsers()).toBeFalse();
    selectionServiceSpy.and.returnValue(undefined);
    expect(service.isAllowedToGetAllUsers()).toBeFalse();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(3);
  });



  /**
   * isAllowedToCountUsers
   */
  it('isAllowedToCountUsers - authorized', () => {
    activeUser.role = Role.NOT_RELEVANT;
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToCountUsers()).toBeTrue();
    activeUser.role = Role.VISITOR;
    activeUser.isGlobalAdmin = false;
    expect(service.isAllowedToCountUsers()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToCountUsers()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToCountUsers()).toBeTrue();
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToCountUsers()).toBeTrue();
    activeUser.role = undefined;
    expect(service.isAllowedToCountUsers()).toBeTrue();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(6);
  });

  it('isAllowedToCountUsers -  unauthorized', () => {
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToCountUsers()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToCountUsers()).toBeFalse();
    selectionServiceSpy.and.returnValue(undefined);
    expect(service.isAllowedToCountUsers()).toBeFalse();

    expect(selectionServiceSpy).toHaveBeenCalledTimes(3);
  });


});
