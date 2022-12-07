import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { ConfigService } from '../../config/config.service';
import { MaterialModule } from '../../material/material.module';
import { User } from '../../model/user.model';
import { AdminService } from '../../services/backend/admin.service';
import { CommonGroupService } from '../../services/backend/common-group.service';
import { SelectionService } from '../../services/util/selection.service';
import { UserService } from '../../services/backend/user.service';
import { ToolbarSite } from './toolbar-site';

import { ToolbarComponent } from './toolbar.component';
import { CommonGroup, ICommonGroup } from 'src/app/model/common-group.model';
import { Role } from 'src/app/model/role.model';
import { SimpleChanges } from '@angular/core';
import { ADMIN_GROUP_PATH, USERS_PATH } from 'src/app/app-constants';
import { AuthService } from 'src/app/services/backend/auth.service';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let selectionService: SelectionService;
  let authenticationService: AuthService;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  let fixture: ComponentFixture<ToolbarComponent>;

  const userId = 'UAA00001';
  const firstName = 'Lower';
  const lastName = 'Power';

  const user = User.map({
    identification: userId,
    firstName: firstName,
    lastName: lastName,
    mail: 'max.power@ma-vin.de',
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    role: Role.VISITOR,
    isGlobalAdmin: false
  } as User);

  const commonGroupId = 'CGAA00001';
  const commonGroupName = 'Name of the group';

  const commonGroup = CommonGroup.map({
    identification: commonGroupId,
    groupName: commonGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!',
    defaultRole: Role.VISITOR
  } as ICommonGroup);


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule],
      declarations: [ToolbarComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    commonGroupService = TestBed.inject(CommonGroupService);
    selectionService = TestBed.inject(SelectionService);
    authenticationService = TestBed.inject(AuthService);

    component = fixture.componentInstance;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });



  /**
   * ngOnInit
   */
  it('ngOnInit - active user', () => {
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(user);

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeFalse();
    expect(component.iconName).toEqual('add_box');
    expect(component.activeUserIdentification).toEqual(userId);
    expect(component.activeUserParentUrl).toEqual(USERS_PATH);
    expect(component.activeUserText).toEqual(`${lastName}, ${firstName}: ${userId}`);
  });

  it('ngOnInit - active admin', () => {
    let admin = User.map(user);
    admin.isGlobalAdmin = true;
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(admin);

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeTrue();
    expect(component.iconName).toEqual('add_box');
    expect(component.activeUserIdentification).toEqual(userId);
    expect(component.activeUserParentUrl).toEqual(ADMIN_GROUP_PATH);
    expect(component.activeUserText).toEqual(`${lastName}, ${firstName}: ${userId}`);
  });

  it('ngOnInit - neither active user nor admin', () => {
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(undefined);

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeFalse();
    expect(component.iconName).toEqual('add_box');
    expect(component.activeUserIdentification).not.toBeDefined();
    expect(component.activeUserParentUrl).not.toBeDefined();
    expect(component.activeUserText).toEqual('not selected');
  });

  it('ngOnInit - admin site', () => {
    let admin = User.map(user);
    admin.isGlobalAdmin = true;
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    component.activeSite = ToolbarSite.ADMINS;

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeTrue();
    expect(component.iconName).toEqual('add_moderator');
  });

  it('ngOnInit - common groups site', () => {
    let admin = User.map(user);
    admin.isGlobalAdmin = true;
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    component.activeSite = ToolbarSite.COMMON_GROUPS;

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeTrue();
    expect(component.iconName).toEqual('domain_add');
  });

  it('ngOnInit - users site', () => {
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(user);
    component.activeSite = ToolbarSite.USERS;

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeFalse();
    expect(component.iconName).toEqual('person_add');
  });

  it('ngOnInit - base groups site', () => {
    let admin = User.map(user);
    admin.isGlobalAdmin = true;
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    component.activeSite = ToolbarSite.BASE_GROUPS;

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeTrue();
    expect(component.iconName).toEqual('group_add');
  });

  it('ngOnInit - privilege groups site', () => {
    let admin = User.map(user);
    admin.isGlobalAdmin = true;
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    component.activeSite = ToolbarSite.PRIVILEGE_GROUPS;

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeTrue();
    expect(component.iconName).toEqual('group_add');
  });



  /**
   * ngOnChanges
   */
  it('ngOnChanges - common group selected', () => {
    let getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(commonGroup);

    component.ngOnChanges({} as SimpleChanges);

    expect(getSelectedCommonGroupSpy).toHaveBeenCalled();
    expect(component.commonGroupText).toEqual(commonGroupId);
    expect(component.commonGroupIdentification).toEqual(commonGroupId);
  });

  it('ngOnChanges - common group not elected', () => {
    let getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(undefined);

    component.ngOnChanges({} as SimpleChanges);

    expect(getSelectedCommonGroupSpy).toHaveBeenCalled();
    expect(component.commonGroupText).toEqual('not selected');
    expect(component.commonGroupIdentification).not.toBeDefined();
  });




  /**
   * onCreateObject
   */
  it('onCreateObject - event should occur', () => {
    let emitSpy = spyOn(component.onCreateObjectEventEmitter, 'emit');

    component.onCreateObject();

    expect(emitSpy).toHaveBeenCalled();
  });



  /**
   * onLogout
   */
  it('onLogout - auth service should clear tokens', () => {
    let clearTokensAndLoginSpy = spyOn(authenticationService, 'clearTokensAndLogin');

    component.onLogout();

    expect(clearTokensAndLoginSpy).toHaveBeenCalled();
  });
});
