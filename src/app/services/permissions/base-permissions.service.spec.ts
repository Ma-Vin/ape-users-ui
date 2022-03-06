import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Role } from '../../model/role.model';
import { IUser, User } from '../../model/user.model';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { ConfigService } from '../../config/config.service';
import { AdminService } from '../backend/admin.service';
import { CommonGroupService } from '../backend/common-group.service';
import { UserService } from '../backend/user.service';
import { SelectionService } from '../util/selection.service';

import { BasePermissionsService } from './base-permissions.service';

describe('BasePermissionsService', () => {
  let service: TestBasePermissionsService;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let configService: ConfigService;
  let selectionService: SelectionService;
  let httpMock: HttpTestingController;
  let http: HttpClient;


  let user: User;
  let otherUser: User;
  const userId = 'UAA00001';
  const otherUserId = 'UAA00002';
  const firstName = 'Max';
  const otherFirstName = 'Lower';
  const lastName = 'Power';
  const otherLastName = 'Power';

  let commonGroup: CommonGroup;
  const commonGroupId = 'CGAA00001';
  const commonGroupName = 'Name of the group';

  let roles = [Role.ADMIN, Role.MANAGER, Role.CONTRIBUTOR, Role.VISITOR, Role.NOT_RELEVANT, Role.BLOCKED];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    commonGroupService = TestBed.inject(CommonGroupService);
    selectionService = TestBed.inject(SelectionService);

    initMockData();

    service = new TestBasePermissionsService(selectionService);
  });


  function initMockData() {
    user = User.map({
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
      isGlobalAdmin: false,
      isComplete: true
    } as IUser);

    commonGroup = CommonGroup.map({
      description: 'some description',
      groupName: commonGroupName,
      identification: commonGroupId,
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      defaultRole: Role.VISITOR
    } as ICommonGroup);
  }



  it('should be created', () => {
    expect(service).toBeTruthy();
  });



  /**
   * getRoleWorth
   */
  it('getRoleWorth - existing roles', () => {
    let adminValue = service.getRoleWorth(Role.ADMIN);
    let managerValue = service.getRoleWorth(Role.MANAGER);
    let contributorValue = service.getRoleWorth(Role.CONTRIBUTOR);
    let visitorValue = service.getRoleWorth(Role.VISITOR);
    let notRelevantValue = service.getRoleWorth(Role.NOT_RELEVANT);
    let blockedValue = service.getRoleWorth(Role.BLOCKED);

    expect(adminValue).toBeGreaterThan(managerValue);
    expect(managerValue).toBeGreaterThan(contributorValue);
    expect(contributorValue).toBeGreaterThan(visitorValue);
    expect(visitorValue).toBeGreaterThan(notRelevantValue);
    expect(notRelevantValue).toBeGreaterThan(blockedValue);
  });

  it('getRoleWorth - not existing role', () => {
    let blockedValue = service.getRoleWorth(Role.BLOCKED);
    let notExistingValue = service.getRoleWorth("anything" as Role);

    expect(blockedValue).toBeGreaterThan(notExistingValue);
  });



  /**
   * isSameRoleOrHigher
   */
  it('isSameRoleOrHigher - is equal or higher with roles', () => {
    for (let i = 0; i < roles.length; i++) {
      user.role = roles[i];
      for (let j = i; j < roles.length; j++) {
        expect(service.isSameRoleOrHigher(roles[j], user)).toBeTrue();
      }
      for (let j = 0; j < i; j++) {
        expect(service.isSameRoleOrHigher(roles[j], user)).toBeFalse();
      }
    }
  });

  it('isSameRoleOrHigher - is equal or higher global', () => {
    user.isGlobalAdmin = true;
    for (let i = 0; i < roles.length; i++) {
      user.role = roles[i];
      for (let j = 0; j < roles.length; j++) {
        expect(service.isSameRoleOrHigher(roles[j], user)).toBeTrue();
      }
    }
  });

  it('isSameRoleOrHigher - is equal or higher with undefined role', () => {
    user.role = undefined;

    expect(service.isSameRoleOrHigher(Role.ADMIN, user)).toBeFalse();
    expect(service.isSameRoleOrHigher(Role.MANAGER, user)).toBeFalse();
    expect(service.isSameRoleOrHigher(Role.CONTRIBUTOR, user)).toBeFalse();

    expect(service.isSameRoleOrHigher(Role.VISITOR, user)).toBeTrue();
    expect(service.isSameRoleOrHigher(Role.NOT_RELEVANT, user)).toBeTrue();
    expect(service.isSameRoleOrHigher(Role.BLOCKED, user)).toBeTrue();
  });



  /**
   * isRoleHigher
   */
  it('isRoleHigher - is equal or higher with roles', () => {
    for (let i = 0; i < roles.length; i++) {
      user.role = roles[i];
      for (let j = i + 1; j < roles.length; j++) {
        expect(service.isRoleHigher(roles[j], user)).toBeTrue();
      }
      for (let j = 0; j <= i; j++) {
        expect(service.isRoleHigher(roles[j], user)).toBeFalse();
      }
    }
  });

  it('isRoleHigher - is equal or higher global', () => {
    user.isGlobalAdmin = true;
    for (let i = 0; i < roles.length; i++) {
      user.role = roles[i];
      for (let j = 0; j < roles.length; j++) {
        expect(service.isRoleHigher(roles[j], user)).toBeTrue();
      }
    }
  });

  it('isRoleHigher - is equal or higher with undefined role', () => {
    user.role = undefined;

    expect(service.isRoleHigher(Role.ADMIN, user)).toBeFalse();
    expect(service.isRoleHigher(Role.MANAGER, user)).toBeFalse();
    expect(service.isRoleHigher(Role.CONTRIBUTOR, user)).toBeFalse();
    expect(service.isRoleHigher(Role.VISITOR, user)).toBeFalse();

    expect(service.isRoleHigher(Role.NOT_RELEVANT, user)).toBeTrue();
    expect(service.isRoleHigher(Role.BLOCKED, user)).toBeTrue();
  });




  /**
   * hasHigherRole
   */
  it('hasHigherRole - is equal or higher with roles', () => {
    for (let i = 0; i < roles.length; i++) {
      user.role = roles[i];
      for (let j = i + 1; j < roles.length; j++) {
        otherUser.role = roles[j];
        expect(service.hasHigherRole(user, otherUser)).toBeTrue();
      }
      for (let j = 0; j <= i; j++) {
        otherUser.role = roles[j];
        expect(service.hasHigherRole(user, otherUser)).toBeFalse();
      }
    }
  });

  it('hasHigherRole - is equal or higher global', () => {
    user.isGlobalAdmin = true;
    for (let i = 0; i < roles.length; i++) {
      user.role = roles[i];
      for (let j = 0; j < roles.length; j++) {
        otherUser.role = roles[j];
        expect(service.hasHigherRole(user, otherUser)).toBeTrue();
      }
    }
  });

  it('hasHigherRole - is equal or higher with undefined role', () => {
    user.role = undefined;

    otherUser.role = Role.ADMIN;
    expect(service.hasHigherRole(user, otherUser)).toBeFalse();
    otherUser.role = Role.MANAGER;
    expect(service.hasHigherRole(user, otherUser)).toBeFalse();
    otherUser.role = Role.CONTRIBUTOR;
    expect(service.hasHigherRole(user, otherUser)).toBeFalse();
    otherUser.role = Role.VISITOR;
    expect(service.hasHigherRole(user, otherUser)).toBeFalse();
    otherUser.role = undefined;
    expect(service.hasHigherRole(user, otherUser)).toBeFalse();

    otherUser.role = Role.NOT_RELEVANT;
    expect(service.hasHigherRole(user, otherUser)).toBeTrue();
    otherUser.role = Role.BLOCKED;
    expect(service.hasHigherRole(user, otherUser)).toBeTrue();
  });




  /**
   * isUserItselfAndNotBlocked
   */
  it('isUserItselfAndNotBlocked', () => {
    expect(service.isUserItselfAndNotBlocked(user, user)).toBeTrue();
    expect(service.isUserItselfAndNotBlocked(user, otherUser)).toBeFalse();

    user.role = Role.BLOCKED;
    expect(service.isUserItselfAndNotBlocked(user, user)).toBeFalse();
  });




  /**
   * isUserAtCommonGroup
   */
  it('isUserAtCommonGroup - existing common group', () => {
    spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(commonGroup);
    expect(service.isUserAtCommonGroup(commonGroupId)).toBeTrue();
    expect(service.isUserAtCommonGroup(commonGroupId.concat('_1'))).toBeFalse();
  });

  it('isUserAtCommonGroup - non existing common group', () => {
    spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(undefined);
    expect(service.isUserAtCommonGroup(commonGroupId)).toBeFalse();
  });
});



/**
 * Test class to make protected methods accessible for test
 */
class TestBasePermissionsService extends BasePermissionsService {

  constructor(selectionService: SelectionService) {
    super(selectionService);
  }

  getRoleWorth(role: Role): number {
    return super.getRoleWorth(role);
  }

  isSameRoleOrHigher(roleToCheck: Role, userToCheck: User): boolean {
    return super.isSameRoleOrHigher(roleToCheck, userToCheck);
  }

  isRoleHigher(roleToCheck: Role, userToCheck: User): boolean {
    return super.isRoleHigher(roleToCheck, userToCheck);
  }

  hasHigherRole(userToCheck: User, userToCompareWith: User): boolean {
    return super.hasHigherRole(userToCheck, userToCompareWith);
  }

  isUserItselfAndNotBlocked(userToCheck: User, userToCompareWith: User): boolean {
    return super.isUserItselfAndNotBlocked(userToCheck, userToCompareWith);
  }

  getActiveUser(): User | undefined {
    return super.getActiveUser();
  }

  isUserAtCommonGroup(identification: string) {
    return super.isUserAtCommonGroup(identification);
  }
}