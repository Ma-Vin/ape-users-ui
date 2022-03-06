import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { IUser, User } from '../../model/user.model';
import { Role } from '../../model/role.model';
import { ConfigService } from '../../config/config.service';
import { AdminService } from '../backend/admin.service';
import { UserService } from '../backend/user.service';
import { SelectionService } from '../util/selection.service';

import { CommonGroupPermissionsService } from './common-group-permissions.service';

describe('CommonGroupPermissionsService', () => {
  let service: CommonGroupPermissionsService;
  let adminService: AdminService;
  let userService: UserService;
  let selectionService: SelectionService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  let getActiveUserSpy: jasmine.Spy<() => User | undefined>;
  let getSelectedCommonGroupSpy: jasmine.Spy<() => CommonGroup | undefined>;

  let activeUser: User;
  const userId = 'UAA00001';
  const firstName = 'Max';
  const lastName = 'Power';

  let commonGroup: CommonGroup;
  const commonGroupId = 'CGAA00001';
  const commonGroupName = 'Name of the group';

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    selectionService = TestBed.inject(SelectionService);

    initMockData();

    service = TestBed.inject(CommonGroupPermissionsService);

    getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(activeUser);
    getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(commonGroup);
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
   * isAllowedcreateCommonGroup
   */
  it('isAllowedCreateCommonGroup - global admin', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedCreateCommonGroup()).toBeTrue();
  });

  it('isAllowedCreateCommonGroup - non global admin', () => {
    activeUser.isGlobalAdmin = false;
    expect(service.isAllowedCreateCommonGroup()).toBeFalse();
  });

  it('isAllowedCreateCommonGroup - undefined active user', () => {
    activeUser.isGlobalAdmin = true;
    getActiveUserSpy.and.returnValue(undefined);
    expect(service.isAllowedCreateCommonGroup()).toBeFalse();
  });




  /**
   * isAllowedToDeleteCommonGroup
   */
  it('isAllowedToDeleteCommonGroup - global admin', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToDeleteCommonGroup()).toBeTrue();
  });

  it('isAllowedToDeleteCommonGroup - non global admin', () => {
    activeUser.isGlobalAdmin = false;
    expect(service.isAllowedToDeleteCommonGroup()).toBeFalse();
  });

  it('isAllowedToDeleteCommonGroup - undefined active user', () => {
    activeUser.isGlobalAdmin = true;
    getActiveUserSpy.and.returnValue(undefined);
    expect(service.isAllowedToDeleteCommonGroup()).toBeFalse();
  });




  /**
   * isAllowedToGetCommonGroup
   */
  it('isAllowedToGetCommonGroup - global admin', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetCommonGroup(commonGroupId.concat('_1'))).toBeTrue();
    getSelectedCommonGroupSpy.and.returnValue(undefined);
    expect(service.isAllowedToGetCommonGroup(commonGroupId)).toBeTrue();
  });

  it('isAllowedToGetCommonGroup - undefined active user', () => {
    activeUser.isGlobalAdmin = true;
    getActiveUserSpy.and.returnValue(undefined);
    expect(service.isAllowedToGetCommonGroup(commonGroupId)).toBeFalse();
  });

  it('isAllowedToGetCommonGroup - not a member of common group', () => {
    let otherCommonGroupId = commonGroupId.concat('_1');
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetCommonGroup(otherCommonGroupId)).toBeFalse();
  });

  it('isAllowedToGetCommonGroup - roles', () => {
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetCommonGroup(commonGroupId)).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetCommonGroup(commonGroupId)).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetCommonGroup(commonGroupId)).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetCommonGroup(commonGroupId)).toBeTrue();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetCommonGroup(commonGroupId)).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetCommonGroup(commonGroupId)).toBeFalse();
  });




  /**
   * isAllowedToGetAllCommonGroup
   */
  it('isAllowedToGetAllCommonGroup - global admin', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetAllCommonGroup()).toBeTrue();
  });

  it('isAllowedToGetAllCommonGroup - non global admin', () => {
    activeUser.isGlobalAdmin = false;
    expect(service.isAllowedToGetAllCommonGroup()).toBeFalse();
  });

  it('isAllowedToGetAllCommonGroup - undefined active user', () => {
    activeUser.isGlobalAdmin = true;
    getActiveUserSpy.and.returnValue(undefined);
    expect(service.isAllowedToGetAllCommonGroup()).toBeFalse();
  });




  /**
   * isAllowedToUpdateCommonGroup
   */
  it('isAllowedToUpdateCommonGroup - global admin', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToUpdateCommonGroup(commonGroupId.concat('_1'))).toBeTrue();
    getSelectedCommonGroupSpy.and.returnValue(undefined);
    expect(service.isAllowedToUpdateCommonGroup(commonGroupId)).toBeTrue();
  });

  it('isAllowedToUpdateCommonGroup - undefined active user', () => {
    activeUser.isGlobalAdmin = true;
    getActiveUserSpy.and.returnValue(undefined);
    expect(service.isAllowedToUpdateCommonGroup(commonGroupId)).toBeFalse();
  });

  it('isAllowedToUpdateCommonGroup - not a member of common group', () => {
    let otherCommonGroupId = commonGroupId.concat('_1');
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToUpdateCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToUpdateCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToUpdateCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToUpdateCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToUpdateCommonGroup(otherCommonGroupId)).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToUpdateCommonGroup(otherCommonGroupId)).toBeFalse();
  });

  it('isAllowedToUpdateCommonGroup - roles', () => {
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToUpdateCommonGroup(commonGroupId)).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToUpdateCommonGroup(commonGroupId)).toBeFalse();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToUpdateCommonGroup(commonGroupId)).toBeFalse();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToUpdateCommonGroup(commonGroupId)).toBeFalse();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToUpdateCommonGroup(commonGroupId)).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToUpdateCommonGroup(commonGroupId)).toBeFalse();
  });




  /**
   * isAllowedToGetParentCommonGroup
   */
  it('isAllowedToGetParentCommonGroup - global admin', () => {
    activeUser.isGlobalAdmin = true;
    expect(service.isAllowedToGetParentCommonGroup()).toBeTrue();
  });

  it('isAllowedToGetParentCommonGroup - non global admin', () => {
    activeUser.isGlobalAdmin = false;
    activeUser.role = Role.ADMIN;
    expect(service.isAllowedToGetParentCommonGroup()).toBeTrue();
    activeUser.role = Role.MANAGER;
    expect(service.isAllowedToGetParentCommonGroup()).toBeTrue();
    activeUser.role = Role.CONTRIBUTOR;
    expect(service.isAllowedToGetParentCommonGroup()).toBeTrue();
    activeUser.role = Role.VISITOR;
    expect(service.isAllowedToGetParentCommonGroup()).toBeTrue();
    activeUser.role = Role.NOT_RELEVANT;
    expect(service.isAllowedToGetParentCommonGroup()).toBeFalse();
    activeUser.role = Role.BLOCKED;
    expect(service.isAllowedToGetParentCommonGroup()).toBeFalse();
  });

  it('isAllowedToGetParentCommonGroup - undefined active user', () => {
    activeUser.isGlobalAdmin = true;
    getActiveUserSpy.and.returnValue(undefined);
    expect(service.isAllowedToGetParentCommonGroup()).toBeFalse();
  });
});
