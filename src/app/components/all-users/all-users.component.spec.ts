import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Location, registerLocaleData } from '@angular/common';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '../../config/config.service';
import { AdminService } from '../../services/backend/admin.service';
import { CommonGroupService } from '../../services/backend/common-group.service';
import { SelectionService } from '../../services/util/selection.service';
import { UserService } from '../../services/backend/user.service';
import localeDe from '@angular/common/locales/de';

import { AllUsersComponent } from './all-users.component';
import { RouterTestingModule } from '@angular/router/testing';
import { USERS_PATH } from '../../app-constants';
import { MaterialModule } from '../../material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { of } from 'rxjs';
import { IUser, User } from '../../model/user.model';
import { Role } from '../../model/role.model';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { UserPermissionsService } from '../../services/permissions/user-permissions.service';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { MatDialog } from '@angular/material/dialog';

registerLocaleData(localeDe);

describe('AllUsersComponent', () => {
  let component: AllUsersComponent;
  let selectionService: SelectionService;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let configService: ConfigService;
  let userPermissionSerivce: UserPermissionsService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let route: ActivatedRoute;
  let location: Location;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;

  let fixture: ComponentFixture<AllUsersComponent>;


  const userId = 'UAA00002';
  const otherUserId = 'UAA00003';
  const firstName = 'Lower';
  const lastName = 'Power';

  const commonGroupId = 'CGAA00001';

  let user: User;
  let otherUser: User;
  let commonGroup: CommonGroup;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: USERS_PATH, component: AllUsersComponent }]), MaterialModule, BrowserAnimationsModule],
      providers: [{ provide: MAT_DATE_LOCALE, useValue: 'de' }],
      declarations: [AllUsersComponent, ToolbarComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    commonGroupService = TestBed.inject(CommonGroupService);
    selectionService = TestBed.inject(SelectionService);
    userPermissionSerivce = TestBed.inject(UserPermissionsService);

    route = TestBed.inject(ActivatedRoute);
    location = TestBed.inject(Location);
    snackBar = TestBed.inject(MatSnackBar);
    dialog = TestBed.inject(MatDialog);

    fixture = TestBed.createComponent(AllUsersComponent);

    component = fixture.componentInstance;

    initTestObjects();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  /**
   * ngOnInit
   */
  it('ngOnInit - without id at route', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllUsersSpy = spyOn(userService, 'getAllUsers').and.returnValue(of([otherUser, user]));
    let getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(commonGroup);

    component.ngOnInit();

    tick()

    expect(getAllUsersSpy).toHaveBeenCalled();
    expect(getSelectedCommonGroupSpy).toHaveBeenCalled();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();
  }));

  it('ngOnInit - with id at route', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllUsersSpy = spyOn(userService, 'getAllUsers').and.returnValue(of([otherUser, user]));
    let getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(user));
    let getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(commonGroup);

    spyOn(route.snapshot.paramMap, 'has').and.returnValue(true);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(userId);

    component.ngOnInit();

    tick()

    expect(getAllUsersSpy).toHaveBeenCalled();
    expect(getUserSpy).not.toHaveBeenCalled();
    expect(getSelectedCommonGroupSpy).toHaveBeenCalled();
    expect(component.selectedObject.equals(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();
  }));

  it('ngOnInit - parts, with id at route', fakeAsync(() => {
    let getAllUserPartsSpy = spyOn(userService, 'getAllUserParts').and.returnValue(of([otherUser, user]));
    let getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(user));
    let getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(commonGroup);

    spyOn(route.snapshot.paramMap, 'has').and.returnValue(true);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(userId);

    component.ngOnInit();

    tick()

    expect(getAllUserPartsSpy).toHaveBeenCalled();
    expect(getUserSpy).toHaveBeenCalled();
    expect(getSelectedCommonGroupSpy).toHaveBeenCalled();
    expect(component.selectedObject.equals(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();
  }));

  it('ngOnInit - missing common group', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllUsersSpy = spyOn(userService, 'getAllUsers').and.returnValue(of([otherUser, user]));
    let getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(user));
    let getSelectedCommonGroupSpy = spyOn(selectionService, 'getSelectedCommonGroup').and.returnValue(undefined);

    component.ngOnInit();

    tick()

    expect(getAllUsersSpy).toHaveBeenCalled();
    expect(getUserSpy).not.toHaveBeenCalled();
    expect(getSelectedCommonGroupSpy).toHaveBeenCalled();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();
  }));



  /**
   * onSelectObject
   */
  it('onSelectObject - non selected before', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { });
    let getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(user));

    component.onSelectObject(user);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${USERS_PATH}/${user.identification}`);
    expect(getUserSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === user).toBeFalse();
    expect(component.selectedObject.equals(user)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(userId);
  });

  it('onSelectObject - parts, non selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { });
    let getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(user));

    component.onSelectObject(user);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${USERS_PATH}/${user.identification}`);
    expect(getUserSpy).toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === user).toBeFalse();
    expect(component.selectedObject.equals(user)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(userId);
  });

  it('onSelectObject - same selected before', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { });
    let getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(user));

    component.selectedObject = user;

    component.onSelectObject(user);

    expect(loactionSpy).not.toHaveBeenCalledOnceWith(`${USERS_PATH}/${user.identification}`);
    expect(getUserSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === user).toBeFalse();
    expect(component.selectedObject.equals(user)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(userId);
  });

  it('onSelectObject - other selected before', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { });
    let getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(user));

    component.selectedObject = otherUser;

    component.onSelectObject(user);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${USERS_PATH}/${user.identification}`);
    expect(getUserSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === user).toBeFalse();
    expect(component.selectedObject.equals(user)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(userId);
  });

  it('onSelectObject - allowed to update', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { });
    let getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(user));
    let isAllowedToUpdateUserSpy = spyOn(userPermissionSerivce, 'isAllowedToUpdateUser').and.returnValue(true);
    let isAllowedToSetRoleOfUserSpy = spyOn(userPermissionSerivce, 'isAllowedToSetRoleOfUser').and.returnValue(true);

    component.onSelectObject(user);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${USERS_PATH}/${user.identification}`);
    expect(isAllowedToUpdateUserSpy).toHaveBeenCalled();
    expect(isAllowedToSetRoleOfUserSpy).toHaveBeenCalled();
    expect(getUserSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === user).toBeFalse();
    expect(component.selectedObject.equals(user)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(userId);
    expect(component.disableUpdate).toBeFalse();
    expect(component.disableUpdateCreationRequired).toBeFalse();
    expect(component.disableUpdateRole).toBeFalse();
  });

  it('onSelectObject - not allowed to update', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { });
    let getUserSpy = spyOn(userService, 'getUser').and.returnValue(of(user));
    let isAllowedToUpdateUserSpy = spyOn(userPermissionSerivce, 'isAllowedToUpdateUser').and.returnValue(false);
    let isAllowedToSetRoleOfUserSpy = spyOn(userPermissionSerivce, 'isAllowedToSetRoleOfUser').and.returnValue(false);

    component.onSelectObject(user);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${USERS_PATH}/${user.identification}`);
    expect(isAllowedToUpdateUserSpy).toHaveBeenCalled();
    expect(isAllowedToSetRoleOfUserSpy).toHaveBeenCalled();
    expect(getUserSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === user).toBeFalse();
    expect(component.selectedObject.equals(user)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(userId);
    expect(component.disableUpdate).toBeTrue();
    expect(component.disableUpdateCreationRequired).toBeTrue();
    expect(component.disableUpdateRole).toBeTrue();
  });



  /**
   * isObjectSelected
   */
  it('isObjectSelected - same user', () => {
    component.selectedObject = user;
    expect(component.isObjectSelected(user)).toBeTrue();
  });

  it('isObjectSelected - other user', () => {
    component.selectedObject = otherUser;
    expect(component.isObjectSelected(user)).toBeFalse();
  });



  /**
   * onCreateObject
   */
  it('onCreateObject - allowed to update', () => {
    let isAllowedToUpdateUserSpy = spyOn(userPermissionSerivce, 'isAllowedToUpdateUser').and.returnValue(true);
    let isAllowedToSetRoleOfUserSpy = spyOn(userPermissionSerivce, 'isAllowedToSetRoleOfUser').and.returnValue(true);

    component.onCreateObject();

    expect(isAllowedToUpdateUserSpy).toHaveBeenCalled();
    expect(isAllowedToSetRoleOfUserSpy).toHaveBeenCalled();

    expect(component.showObjectDetail).toBeTrue();
    expect(component.isNewObject).toBeTrue();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.disableUpdate).toBeFalse();
    expect(component.disableUpdateCreationRequired).toBeFalse();
    expect(component.disableUpdateRole).toBeFalse();
  });

  /**
 * onCreateObject
 */
  it('onCreateObject - not allowed to update', () => {
    let isAllowedToUpdateUserSpy = spyOn(userPermissionSerivce, 'isAllowedToUpdateUser').and.returnValue(false);
    let isAllowedToSetRoleOfUserSpy = spyOn(userPermissionSerivce, 'isAllowedToSetRoleOfUser').and.returnValue(false);

    component.onCreateObject();

    expect(isAllowedToUpdateUserSpy).toHaveBeenCalled();
    expect(isAllowedToSetRoleOfUserSpy).toHaveBeenCalled();

    expect(component.showObjectDetail).toBeTrue();
    expect(component.isNewObject).toBeTrue();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.disableUpdate).toBeTrue();
    expect(component.disableUpdateCreationRequired).toBeFalse();
    expect(component.disableUpdateRole).toBeTrue();
  });



  /**
   * onAccept
   */
  it('onAccept - create new user', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherUser;
    component.allObjectsfilterDataSource.data = [user];

    let createUserSpy = spyOn(userService, 'createUser').and.returnValue(of(otherUser));
    let updateCreatedUserSpy = spyOn(userService, 'updateUser').and.returnValue(of(otherUser));
    let setRoleSpy = spyOn(userService, 'setRole').and.returnValue(of(false));

    component.onAccept();

    tick();

    expect(createUserSpy).toHaveBeenCalled();
    expect(updateCreatedUserSpy).toHaveBeenCalled();
    expect(setRoleSpy).not.toHaveBeenCalled();
    expect(component.selectedObject === otherUser).toBeFalse();
    expect(component.selectedObject.equals(otherUser)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();
  }));

  it('onAccept - create new user without default role', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = User.map(otherUser);
    component.selectedObject.role = Role.MANAGER;
    component.allObjectsfilterDataSource.data = [user];

    let createUserSpy = spyOn(userService, 'createUser').and.returnValue(of(otherUser));
    let updateCreatedUserSpy = spyOn(userService, 'updateUser').and.returnValue(of(otherUser));
    let setRoleSpy = spyOn(userService, 'setRole').and.returnValue(of(true));

    component.onAccept();

    tick();

    expect(createUserSpy).toHaveBeenCalled();
    expect(updateCreatedUserSpy).toHaveBeenCalled();
    expect(setRoleSpy).toHaveBeenCalled();
    expect(component.selectedObject === otherUser).toBeFalse();
    expect(component.selectedObject.equals(otherUser)).toBeTrue();
    expect(component.selectedObject.role).toEqual(Role.MANAGER);
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();
  }));

  it('onAccept - create new user, without default role, but unsuccessful', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = User.map(otherUser);
    component.selectedObject.role = Role.MANAGER;
    component.allObjectsfilterDataSource.data = [user];

    let createUserSpy = spyOn(userService, 'createUser').and.returnValue(of(otherUser));
    let updateCreatedUserSpy = spyOn(userService, 'updateUser').and.returnValue(of(otherUser));
    let setRoleSpy = spyOn(userService, 'setRole').and.returnValue(of(false));

    component.onAccept();

    tick();

    expect(createUserSpy).toHaveBeenCalled();
    expect(updateCreatedUserSpy).toHaveBeenCalled();
    expect(setRoleSpy).toHaveBeenCalled();
    expect(component.selectedObject === otherUser).toBeFalse();
    expect(component.selectedObject.equals(otherUser)).toBeTrue();
    expect(component.selectedObject.role).toEqual(Role.VISITOR);
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();
  }));

  it('onAccept - update existing user', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedUser = User.map(otherUser);
    modfiedUser.firstName = modfiedUser.firstName.concat('_');
    component.selectedObject = modfiedUser;
    component.allObjectsfilterDataSource.data = [user, otherUser];

    let updateUserSpy = spyOn(userService, 'updateUser').and.returnValue(of(modfiedUser));
    let setRoleSpy = spyOn(userService, 'setRole').and.returnValue(of(false));

    component.onAccept();

    tick();

    expect(updateUserSpy).toHaveBeenCalled();
    expect(setRoleSpy).not.toHaveBeenCalled();
    expect(component.selectedObject === modfiedUser).toBeFalse();
    expect(component.selectedObject.equals(modfiedUser)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(modfiedUser)).toBeTrue();
  }));

  it('onAccept - update existing user, but different role', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedUser = User.map(otherUser);
    modfiedUser.firstName = modfiedUser.firstName.concat('_');
    let updatedUser = User.map(modfiedUser);
    modfiedUser.role = Role.ADMIN;
    component.selectedObject = modfiedUser;
    component.allObjectsfilterDataSource.data = [user, otherUser];

    let updateUserSpy = spyOn(userService, 'updateUser').and.returnValue(of(updatedUser));
    let setRoleSpy = spyOn(userService, 'setRole').and.returnValue(of(true));

    component.onAccept();

    tick();

    expect(updateUserSpy).toHaveBeenCalled();
    expect(setRoleSpy).toHaveBeenCalled();
    expect(component.selectedObject === updatedUser).toBeFalse();
    expect(component.selectedObject.equals(updatedUser)).toBeTrue();
    expect(component.selectedObject.role).toEqual(Role.ADMIN);
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(updatedUser)).toBeTrue();
  }));

  it('onAccept - update existing user, but different role and unsuccessful', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedUser = User.map(otherUser);
    modfiedUser.firstName = modfiedUser.firstName.concat('_');
    let updatedUser = User.map(modfiedUser);
    modfiedUser.role = Role.ADMIN;
    component.selectedObject = modfiedUser;
    component.allObjectsfilterDataSource.data = [user, otherUser];

    let updateUserSpy = spyOn(userService, 'updateUser').and.returnValue(of(updatedUser));
    let setRoleSpy = spyOn(userService, 'setRole').and.returnValue(of(false));

    component.onAccept();

    tick();

    expect(updateUserSpy).toHaveBeenCalled();
    expect(setRoleSpy).toHaveBeenCalled();
    expect(component.selectedObject === updatedUser).toBeFalse();
    expect(component.selectedObject.equals(updatedUser)).toBeTrue();
    expect(component.selectedObject.role).toEqual(Role.VISITOR);
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(updatedUser)).toBeTrue();
  }));


  it('onAccept - accept disabled', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedUser = User.map(otherUser);
    modfiedUser.firstName = '';
    component.selectedObject = modfiedUser;
    component.allObjectsfilterDataSource.data = [user, otherUser];

    let updateUserSpy = spyOn(userService, 'updateUser').and.returnValue(of(modfiedUser));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.onAccept();

    tick();

    expect(updateUserSpy).not.toHaveBeenCalled;
    expect(openMessage).toHaveBeenCalled();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));


  /**
   * onAcceptCallBack
   */
  it('onAcceptCallBack - create new user', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherUser;
    component.allObjectsfilterDataSource.data = [user];

    let createUserSpy = spyOn(userService, 'createUser').and.returnValue(of(otherUser));
    let updateCreatedUserSpy = spyOn(userService, 'updateUser').and.returnValue(of(otherUser));
    let setRoleSpy = spyOn(userService, 'setRole').and.returnValue(of(false));

    component.onAcceptCallBack();

    tick();

    expect(createUserSpy).toHaveBeenCalled();
    expect(updateCreatedUserSpy).toHaveBeenCalled();
    expect(setRoleSpy).not.toHaveBeenCalled();
    expect(component.selectedObject === otherUser).toBeFalse();
    expect(component.selectedObject.equals(otherUser)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();
  }));



  /**
   * onCancel
   */
  it('onCancel', () => {
    component.selectedObjectIdentification = 'a';
    component.onCancel();

    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.selectedObjectIdentification).not.toBeDefined();
  });

  /**
   * onCancelCallBack
   */
  it('onCancel', () => {
    component.onCancelCallBack();

    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
  });



  /**
   * onDelete
   */
  it('onDelete - delete successful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [user, otherUser];
    let deleteUserSpy = spyOn(userService, 'deleteUser').and.returnValue(of(true));
    spyOn(userPermissionSerivce, 'isAllowedToDeleteUser').and.returnValue(true)
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedObject = otherUser;
    component.selectedObjectIdentification = otherUserId;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteUserSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();


    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.selectedObjectIdentification).not.toBeDefined();
  }));

  it('onDelete - delete unsuccessful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [user, otherUser];
    let deleteUserSpy = spyOn(userService, 'deleteUser').and.returnValue(of(false));
    spyOn(userPermissionSerivce, 'isAllowedToDeleteUser').and.returnValue(true)
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedObject = otherUser;
    component.selectedObjectIdentification = otherUserId;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteUserSpy).toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);

    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();
    expect(component.selectedObjectIdentification).toBeDefined();
  }));

  it('onDelete - delete disabled', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [user, otherUser];
    let deleteUserSpy = spyOn(userService, 'deleteUser').and.returnValue(of(false));
    spyOn(userPermissionSerivce, 'isAllowedToDeleteUser').and.returnValue(false)
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.selectedObject = user;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.onDelete();

    tick();

    expect(deleteUserSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherUser)).toBeTrue();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));



  /**
   * onDeleteCallBack
   */
  it('onDeleteCallBack - delete successful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [user, otherUser];
    let deleteUserSpy = spyOn(userService, 'deleteUser').and.returnValue(of(true));
    spyOn(userPermissionSerivce, 'isAllowedToDeleteUser').and.returnValue(true)
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedObject = otherUser;
    component.showObjectDetail = true;
    component.isNewObject = false;

    component.onDeleteCallBack();

    tick();

    expect(deleteUserSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();


    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(user)).toBeTrue();
  }));



  /**
   * disableAccept/CallBack
   */
  it('disableAccept - new user', () => {
    component.isNewObject = true;
    component.selectedObject = user;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - new user, but missing first name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: userId,
      lastName: lastName,
      role: Role.VISITOR
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - new user, but empty first name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: userId,
      firstName: '',
      lastName: lastName,
      role: Role.VISITOR
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - new user, but missing last name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: userId,
      firstName: firstName,
      role: Role.VISITOR
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - new user, but empty last name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: userId,
      firstName: firstName,
      lastName: '',
      role: Role.VISITOR
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - new user, but missing role', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: userId,
      firstName: firstName,
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing user', () => {
    component.isNewObject = false;
    component.selectedObject = user;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - existing user, but not modified', () => {
    component.onSelectObject(user);
    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing user, but missing first name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: userId,
      lastName: lastName,
      role: Role.VISITOR
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing user, but empty first name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: userId,
      firstName: '',
      lastName: lastName,
      role: Role.VISITOR
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing user, but missing last name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: userId,
      firstName: firstName,
      role: Role.VISITOR
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing user, but empty last name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: userId,
      firstName: firstName,
      lastName: '',
      role: Role.VISITOR
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing user, but missing role', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: userId,
      firstName: firstName,
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });



  /**
   * disableCreateObject
   */
  it('disableCreateObject - creating a user is allowed', () => {
    let isAllowedToCreateUserSpy = spyOn(userPermissionSerivce, 'isAllowedToCreateUser').and.returnValue(true);

    expect(component.disableCreateObject()).toBeFalse();

    expect(isAllowedToCreateUserSpy).toHaveBeenCalled();
  });

  it('disableCreateObject - creating a user is not allowed', () => {
    let isAllowedToCreateUserSpy = spyOn(userPermissionSerivce, 'isAllowedToCreateUser').and.returnValue(false);

    expect(component.disableCreateObject()).toBeTrue();

    expect(isAllowedToCreateUserSpy).toHaveBeenCalled();
  });



  /**
   * disableDelete/CallBack
   */
  it('disableDelete - new user, but allowed to', () => {
    component.isNewObject = true;
    let isAllowedToDeleteUserSpy = spyOn(userPermissionSerivce, 'isAllowedToDeleteUser').and.returnValue(true);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
    // short circled -> not
    expect(isAllowedToDeleteUserSpy).not.toHaveBeenCalled();
  });

  it('disableDelete - new user, but not allowed to', () => {
    component.isNewObject = true;
    let isAllowedToDeleteUserSpy = spyOn(userPermissionSerivce, 'isAllowedToDeleteUser').and.returnValue(false);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
    // short circled -> not
    expect(isAllowedToDeleteUserSpy).not.toHaveBeenCalled();
  });

  it('disableDelete - existing user, but allowed to', () => {
    component.isNewObject = false;
    let isAllowedToDeleteUserSpy = spyOn(userPermissionSerivce, 'isAllowedToDeleteUser').and.returnValue(true);

    expect(component.disableDelete()).toBeFalse();
    expect(component.disableDeleteCallBack()).toBeFalse();
    expect(isAllowedToDeleteUserSpy).toHaveBeenCalled();
  });

  it('disableDelete - existing user, but not allowed to', () => {
    component.isNewObject = false;
    let isAllowedToDeleteUserSpy = spyOn(userPermissionSerivce, 'isAllowedToDeleteUser').and.returnValue(false);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
    expect(isAllowedToDeleteUserSpy).toHaveBeenCalled();
  });



  /**
   * lastLogin
   */
  it('lastLogin - set', () => {
    try {
      component.lastLogin = '25.10.21, 20:15';
    } catch (error) {
      expect((error as Error).message).toEqual(`lastLogin was tried to be set: value=25.10.21, 20:15`);
      return;
    }
    fail('Error should occur');
  });

  it('lastLogin - get', () => {
    component.selectedObject = user;
    expect(component.lastLogin).toEqual('25.10.21, 20:15');
  });

  it('lastLogin - get undefined', () => {
    expect(component.lastLogin).toEqual('');
  });



  /**
  * openHistoryDialogCallBack
  */
  it('openHistoryDialogCallBack - all ok', () => {
    component.selectedObject = user;
    let openSpy = spyOn(dialog, 'open');

    component.openHistoryDialogCallBack();

    expect(openSpy).toHaveBeenCalled;
  });



  function initTestObjects() {
    user = User.map({
      identification: userId,
      firstName: firstName,
      lastName: lastName,
      mail: 'max.power@ma-vin.de',
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: false,
      role: Role.VISITOR,
      isComplete: true
    } as IUser);

    otherUser = User.map({
      identification: otherUserId,
      firstName: firstName,
      lastName: lastName,
      mail: 'max.power@ma-vin.de',
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: false,
      role: Role.VISITOR,
      isComplete: true
    } as IUser);

    commonGroup = CommonGroup.map({
      identification: commonGroupId,
      groupName: 'SomeName',
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      description: 'Bam!',
      defaultRole: Role.VISITOR
    } as ICommonGroup);
  }
});
