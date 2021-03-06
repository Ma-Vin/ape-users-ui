import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Role } from '../../model/role.model';
import { ConfigService } from '../../config/config.service';
import { IUser, User } from '../../model/user.model';
import { AdminService } from '../backend/admin.service';
import { UserService } from '../backend/user.service';
import { SelectionService } from '../util/selection.service';

import { BaseGroupPermissionsService } from './base-group-permissions.service';

describe('BaseGroupPermissionsService', () => {
  let service: BaseGroupPermissionsService;
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

    service = TestBed.inject(BaseGroupPermissionsService);

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
   * isAllowedCreateBaseGroup
   */
  it('isAllowedCreateBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedCreateBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedCreateBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedCreateBaseGroup()).toBeTrue();
  });

  it('isAllowedCreateBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedCreateBaseGroup()).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedCreateBaseGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedCreateBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedCreateBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToDeleteBaseGroup
   */
  it('isAllowedToDeleteBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToDeleteBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToDeleteBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToDeleteBaseGroup()).toBeTrue();
  });

  it('isAllowedToDeleteBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToDeleteBaseGroup()).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToDeleteBaseGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToDeleteBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToDeleteBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetBaseGroup
   */
  it('isAllowedToGetBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetBaseGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetBaseGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetBaseGroup()).toBeTrue();
  });

  it('isAllowedToGetBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToUpdateBaseGroup
   */
  it('isAllowedToUpdateBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToUpdateBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToUpdateBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToUpdateBaseGroup()).toBeTrue();
  });

  it('isAllowedToUpdateBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToUpdateBaseGroup()).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToUpdateBaseGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToUpdateBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToUpdateBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToCountBaseGroups
   */
  it('isAllowedToCountBaseGroups - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToCountBaseGroups()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToCountBaseGroups()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToCountBaseGroups()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToCountBaseGroups()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToCountBaseGroups()).toBeTrue();
  });

  it('isAllowedToCountBaseGroups - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToCountBaseGroups()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToCountBaseGroups()).toBeFalse();
  });




  /**
   * isAllowedToGetAllBaseGroups
   */
  it('isAllowedToGetAllBaseGroups - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllBaseGroups()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAllBaseGroups()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAllBaseGroups()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAllBaseGroups()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAllBaseGroups()).toBeTrue();
  });

  it('isAllowedToGetAllBaseGroups - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAllBaseGroups()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAllBaseGroups()).toBeFalse();
  });




  /**
   * isAllowedToGetAllBaseGroupParts
   */
  it('isAllowedToGetAllBaseGroupParts - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllBaseGroupParts()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAllBaseGroupParts()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAllBaseGroupParts()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAllBaseGroupParts()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAllBaseGroupParts()).toBeTrue();
  });

  it('isAllowedToGetAllBaseGroupParts - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAllBaseGroupParts()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAllBaseGroupParts()).toBeFalse();
  });




  /**
   * isAllowedToAddBaseToBaseGroup
   */
  it('isAllowedToAddBaseToBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToAddBaseToBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToAddBaseToBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToAddBaseToBaseGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToAddBaseToBaseGroup()).toBeTrue();
  });

  it('isAllowedToAddBaseToBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToAddBaseToBaseGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToAddBaseToBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToAddBaseToBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToRemoveBaseFromBaseGroup
   */
  it('isAllowedToRemoveBaseFromBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToRemoveBaseFromBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToRemoveBaseFromBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToRemoveBaseFromBaseGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToRemoveBaseFromBaseGroup()).toBeTrue();
  });

  it('isAllowedToRemoveBaseFromBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToRemoveBaseFromBaseGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToRemoveBaseFromBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToRemoveBaseFromBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToCountBasesAtBaseGroup
   */
  it('isAllowedToCountBasesAtBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToCountBasesAtBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToCountBasesAtBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToCountBasesAtBaseGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToCountBasesAtBaseGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToCountBasesAtBaseGroup()).toBeTrue();
  });

  it('isAllowedToCountBasesAtBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToCountBasesAtBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToCountBasesAtBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetAllBasesAtBaseGroup
   */
  it('isAllowedToGetAllBasesAtBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllBasesAtBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAllBasesAtBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAllBasesAtBaseGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAllBasesAtBaseGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAllBasesAtBaseGroup()).toBeTrue();
  });

  it('isAllowedToGetAllBasesAtBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAllBasesAtBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAllBasesAtBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetAllBasePartsAtBaseGroup
   */
  it('isAllowedToGetAllBasePartsAtBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllBasePartsAtBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAllBasePartsAtBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAllBasePartsAtBaseGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAllBasePartsAtBaseGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAllBasePartsAtBaseGroup()).toBeTrue();
  });

  it('isAllowedToGetAllBasePartsAtBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAllBasePartsAtBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAllBasePartsAtBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToCountAvailableBasesForBaseGroup
   */
  it('isAllowedToCountAvailableBasesForBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToCountAvailableBasesForBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToCountAvailableBasesForBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToCountAvailableBasesForBaseGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToCountAvailableBasesForBaseGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToCountAvailableBasesForBaseGroup()).toBeTrue();
  });

  it('isAllowedToCountAvailableBasesForBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToCountAvailableBasesForBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToCountAvailableBasesForBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetAvailableBasesForBaseGroup
   */
  it('isAllowedToGetAvailableBasesForBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAvailableBasesForBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAvailableBasesForBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAvailableBasesForBaseGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAvailableBasesForBaseGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAvailableBasesForBaseGroup()).toBeTrue();
  });

  it('isAllowedToGetAvailableBasesForBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAvailableBasesForBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAvailableBasesForBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetAvailableBasePartsForBaseGroup
   */
  it('isAllowedToGetAvailableBasePartsForBaseGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAvailableBasePartsForBaseGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAvailableBasePartsForBaseGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAvailableBasePartsForBaseGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAvailableBasePartsForBaseGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAvailableBasePartsForBaseGroup()).toBeTrue();
  });

  it('isAllowedToGetAvailableBasePartsForBaseGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAvailableBasePartsForBaseGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAvailableBasePartsForBaseGroup()).toBeFalse();
  });




  /**
   * isAllowedToAddBaseToPrivilegeGroup
   */
  it('isAllowedToAddBaseToPrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToAddBaseToPrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToAddBaseToPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToAddBaseToPrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToAddBaseToPrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToAddBaseToPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToAddBaseToPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToAddBaseToPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToAddBaseToPrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToRemoveBaseFromBPrivilegeGroup
   */
  it('isAllowedToRemoveBaseFromBPrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToRemoveBaseFromBPrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToRemoveBaseFromBPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToRemoveBaseFromBPrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToRemoveBaseFromBPrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToRemoveBaseFromBPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToRemoveBaseFromBPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToRemoveBaseFromBPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToRemoveBaseFromBPrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToCountBasesAtPrivilegeGroup
   */
  it('isAllowedToCountBasesAtPrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToCountBasesAtPrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToCountBasesAtPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToCountBasesAtPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToCountBasesAtPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToCountBasesAtPrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToCountBasesAtPrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToCountBasesAtPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToCountBasesAtPrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetAllBasesAtPrivilegeGroup
   */
  it('isAllowedToGetAllBasesAtPrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllBasesAtPrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAllBasesAtPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAllBasesAtPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAllBasesAtPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAllBasesAtPrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToGetAllBasesAtPrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAllBasesAtPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAllBasesAtPrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetAllBasePartsAtPrivilegeGroup
   */
  it('isAllowedToGetAllBasePartsAtPrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllBasePartsAtPrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAllBasePartsAtPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAllBasePartsAtPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAllBasePartsAtPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAllBasePartsAtPrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToGetAllBasePartsAtPrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAllBasePartsAtPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAllBasePartsAtPrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToCountAvailableBasesForPrivilegeGroup
   */
  it('isAllowedToCountAvailableBasesForPrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToCountAvailableBasesForPrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToCountAvailableBasesForPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToCountAvailableBasesForPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToCountAvailableBasesForPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToCountAvailableBasesForPrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToCountAvailableBasesForPrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToCountAvailableBasesForPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToCountAvailableBasesForPrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetAvailableBasesForPrivilegeGroup
   */
  it('isAllowedToGetAvailableBasesForPrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAvailableBasesForPrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAvailableBasesForPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAvailableBasesForPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAvailableBasesForPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAvailableBasesForPrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToGetAvailableBasesForPrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAvailableBasesForPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAvailableBasesForPrivilegeGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetAvailableBasePartsForPrivilegeGroup
   */
  it('isAllowedToGetAvailableBasePartsForPrivilegeGroup - authorized', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAvailableBasePartsForPrivilegeGroup()).toBeTrue();
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetAvailableBasePartsForPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetAvailableBasePartsForPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetAvailableBasePartsForPrivilegeGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetAvailableBasePartsForPrivilegeGroup()).toBeTrue();
  });

  it('isAllowedToGetAvailableBasePartsForPrivilegeGroup - unauthorized', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetAvailableBasePartsForPrivilegeGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetAvailableBasePartsForPrivilegeGroup()).toBeFalse();
  });
});
