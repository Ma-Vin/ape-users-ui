import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NEVER, Observable, of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { BaseGroup, IBaseGroup } from 'src/app/model/base-group.model';
import { IPrivilegeGroup, PrivilegeGroup } from 'src/app/model/privilege-group.model';
import { Role } from 'src/app/model/role.model';
import { IUser, User } from 'src/app/model/user.model';
import { AdminService } from 'src/app/services/backend/admin.service';
import { CommonGroupService } from 'src/app/services/backend/common-group.service';
import { UserService } from 'src/app/services/backend/user.service';
import { UserPermissionsService } from 'src/app/services/permissions/user-permissions.service';
import { SelectionService } from 'src/app/services/util/selection.service';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';

import { UsersAtGroupComponent } from './users-at-group.component';

describe('UsersAtGroupComponent', () => {
  let component: UsersAtGroupComponent;
  let fixture: ComponentFixture<UsersAtGroupComponent>;

  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let selectionService: SelectionService;
  let userPermissionService: UserPermissionsService;

  let dialogRef: MatDialogRef<AddUserDialogComponent, User[]> = { afterClosed: () => NEVER as Observable<User[]> } as MatDialogRef<AddUserDialogComponent, User[]>;
  let dialog: MatDialog = { open: (component: ComponentType<AddUserDialogComponent>, config?: MatDialogConfig) => dialogRef } as MatDialog;
  let snackBar: MatSnackBar = { open: (message: string, action?: string | undefined, config?: MatSnackBarConfig<any> | undefined) => { } } as MatSnackBar;

  const baseGroupId = 'BGAA00001';
  const baseGroupName = 'Name of the base group';
  const privilegeGroupId = 'PGAA00001';
  const privilegeGroupName = 'Name of the privilege group';
  const userId = 'UAA00001';
  const secondUserId = 'UAA00002';
  const firstName = 'Max';
  const secondFirstName = 'Lower';
  const lastName = 'Power';
  const secondLastName = 'Power';

  const user = User.map({
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

  const secondUser = User.map({
    identification: secondUserId,
    firstName: secondFirstName,
    lastName: secondLastName,
    mail: `${secondFirstName.toLocaleLowerCase()}.${secondLastName.toLocaleLowerCase()}@ma-vin.de`,
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    role: Role.VISITOR,
    isGlobalAdmin: false
  } as IUser);

  const baseGroup = BaseGroup.map({
    identification: baseGroupId,
    groupName: baseGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!'
  } as IBaseGroup);

  const privilegeGroup = PrivilegeGroup.map({
    identification: privilegeGroupId,
    groupName: privilegeGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!'
  } as IPrivilegeGroup);



  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      declarations: [UsersAtGroupComponent],
      providers: [{ provide: MatDialog, useValue: dialog }
        , { provide: MatSnackBar, useValue: snackBar }
      ]
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
    userPermissionService = TestBed.inject(UserPermissionsService);


    fixture = TestBed.createComponent(UsersAtGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });



  it('should create', () => {
    expect(component).toBeTruthy();
  });



  /**
   * ngOnInit
   */
  it('ngOnInit - base group selected', fakeAsync(() => {
    let getAllUsersFromBaseGroupSpy = spyOn(userService, 'getAllUsersFromBaseGroup').and.returnValue(of([secondUser]));
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondUserId);

    expect(getAllUsersFromBaseGroupSpy).toHaveBeenCalled();
    expect(getAllUsersFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnInit - privilege group with role selected', fakeAsync(() => {
    let getAllUsersFromBaseGroupSpy = spyOn(userService, 'getAllUsersFromBaseGroup').and.returnValue(of([]));
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([secondUser]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondUserId);

    expect(getAllUsersFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllUsersFromPrivilegeGroupSpy).toHaveBeenCalled();
  }));

  it('ngOnInit - privilege group, flattenedView but not to flatten', fakeAsync(() => {
    let getAllUsersFromBaseGroupSpy = spyOn(userService, 'getAllUsersFromBaseGroup').and.returnValue(of([]));
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([secondUser]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;
    component.flatSubgroupsView = true;
    component.flattenSubgroups = false;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(getAllUsersFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllUsersFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnInit - privilege group, flattenedView and to flatten', fakeAsync(() => {
    let getAllUsersFromBaseGroupSpy = spyOn(userService, 'getAllUsersFromBaseGroup').and.returnValue(of([]));
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([secondUser]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;
    component.flatSubgroupsView = true;
    component.flattenSubgroups = true;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondUserId);

    expect(getAllUsersFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllUsersFromPrivilegeGroupSpy).toHaveBeenCalled();
  }));

  it('ngOnInit - privilege group without role selected', fakeAsync(() => {
    let getAllUsersFromBaseGroupSpy = spyOn(userService, 'getAllUsersFromBaseGroup').and.returnValue(of([]));
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(getAllUsersFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllUsersFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));


  /**
   * ngOnChanges
   */
  it('ngOnChanges - base group selected', fakeAsync(() => {
    let getAllUsersFromBaseGroupSpy = spyOn(userService, 'getAllUsersFromBaseGroup').and.returnValue(of([secondUser]));
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondUserId);

    expect(getAllUsersFromBaseGroupSpy).toHaveBeenCalled();
    expect(getAllUsersFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnChanges - privilege group with role selected', fakeAsync(() => {
    let getAllUsersFromBaseGroupSpy = spyOn(userService, 'getAllUsersFromBaseGroup').and.returnValue(of([]));
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([secondUser]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondUserId);

    expect(getAllUsersFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllUsersFromPrivilegeGroupSpy).toHaveBeenCalled();
  }));

  it('ngOnChanges - privilege group without role selected', fakeAsync(() => {
    let getAllUsersFromBaseGroupSpy = spyOn(userService, 'getAllUsersFromBaseGroup').and.returnValue(of([]));
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(getAllUsersFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllUsersFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));


  /**
   * showElements
   */
  it('showElements - base group and allowed', () => {
    let isAllowedToGetAllUsersAtBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtBaseGroup').and.returnValue(true);
    let isAllowedToGetAllUsersAtPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    expect(component.showElements()).toBeTrue();

    expect(isAllowedToGetAllUsersAtBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllUsersAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - base group and not allowed', () => {
    let isAllowedToGetAllUsersAtBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllUsersAtPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    expect(component.showElements()).toBeFalse();

    expect(isAllowedToGetAllUsersAtBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllUsersAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - privilege group and allowed', () => {
    let isAllowedToGetAllUsersAtBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllUsersAtPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtPrivilegeGroup').and.returnValue(true);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    expect(component.showElements()).toBeTrue();

    expect(isAllowedToGetAllUsersAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllUsersAtPrivilegeGroupSpy).toHaveBeenCalled();
  });


  it('showElements - privilege group and allowed, but missing role', () => {
    let isAllowedToGetAllUsersAtBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllUsersAtPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtPrivilegeGroup').and.returnValue(true);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    expect(component.showElements()).toBeFalse();

    expect(isAllowedToGetAllUsersAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllUsersAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - privilege group and not allowed', () => {
    let isAllowedToGetAllUsersAtBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllUsersAtPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToGetAllUsersAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    expect(component.showElements()).toBeFalse();

    expect(isAllowedToGetAllUsersAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllUsersAtPrivilegeGroupSpy).toHaveBeenCalled();
  });



  /**
   * onSelectElement
   */
  it('onSelectElement - nothing selected', () => {
    component.selectedElement = undefined;

    component.onSelectElement(user);

    expect(component.selectedElement).toBeDefined();
    expect(component.selectedElement!.identification).toEqual(userId);
  });

  it('onSelectElement - same selected', () => {
    component.selectedElement = user;

    component.onSelectElement(user);

    expect(component.selectedElement).not.toBeDefined();
  });

  it('onSelectElement - other selected', () => {
    component.selectedElement = secondUser;

    component.onSelectElement(user);

    expect(component.selectedElement).toBeDefined();
    expect(component.selectedElement!.identification).toEqual(userId);
  });



  /**
   * isElementSelected
   */
  it('isElementSelected - nothing selected', () => {
    component.selectedElement = undefined;

    expect(component.isElementSelected(user)).toBeFalse();
  });

  it('isElementSelected - same selected', () => {
    component.selectedElement = user;

    expect(component.isElementSelected(user)).toBeTrue();
  });

  it('isElementSelected - other selected', () => {
    component.selectedElement = secondUser;

    expect(component.isElementSelected(user)).toBeFalse();
  });



  /**
   * openAddElementDialog
   */
  it('openAddElementDialog - add to base group', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondUser]));
    let addUserToBaseGroupSpy = spyOn(userService, 'addUserToBaseGroup').and.returnValue(of(true));
    let addUserToPrivilegeGroupSpy = spyOn(userService, 'addUserToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondUserId);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addUserToBaseGroupSpy).toHaveBeenCalledWith(secondUserId, baseGroupId);
    expect(addUserToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  });

  it('openAddElementDialog - add to base group, but not added', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondUser]));
    let addUserToBaseGroupSpy = spyOn(userService, 'addUserToBaseGroup').and.returnValue(of(false));
    let addUserToPrivilegeGroupSpy = spyOn(userService, 'addUserToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addUserToBaseGroupSpy).toHaveBeenCalledWith(secondUserId, baseGroupId);
    expect(addUserToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).toHaveBeenCalled();
  });

  it('openAddElementDialog - add to base group, but undefined return at dialog', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of(undefined));
    let addUserToBaseGroupSpy = spyOn(userService, 'addUserToBaseGroup').and.returnValue(of(true));
    let addUserToPrivilegeGroupSpy = spyOn(userService, 'addUserToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addUserToBaseGroupSpy).not.toHaveBeenCalledWith(secondUserId, baseGroupId);
    expect(addUserToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  });

  it('openAddElementDialog - add to privilege group', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondUser]));
    let addUserToBaseGroupSpy = spyOn(userService, 'addUserToBaseGroup').and.returnValue(of(false));
    let addUserToPrivilegeGroupSpy = spyOn(userService, 'addUserToPrivilegeGroup').and.returnValue(of(true));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondUserId);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addUserToBaseGroupSpy).not.toHaveBeenCalled();
    expect(addUserToPrivilegeGroupSpy).toHaveBeenCalledWith(secondUserId, privilegeGroupId, Role.CONTRIBUTOR);
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  });

  it('openAddElementDialog - add to privilege group, without privilege', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondUser]));
    let addUserToBaseGroupSpy = spyOn(userService, 'addUserToBaseGroup').and.returnValue(of(false));
    let addUserToPrivilegeGroupSpy = spyOn(userService, 'addUserToPrivilegeGroup').and.returnValue(of(true));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addUserToBaseGroupSpy).not.toHaveBeenCalled();
    expect(addUserToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  });

  it('openAddElementDialog - add to privilege group, but not added', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondUser]));
    let addUserToBaseGroupSpy = spyOn(userService, 'addUserToBaseGroup').and.returnValue(of(false));
    let addUserToPrivilegeGroupSpy = spyOn(userService, 'addUserToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addUserToBaseGroupSpy).not.toHaveBeenCalled();
    expect(addUserToPrivilegeGroupSpy).toHaveBeenCalledWith(secondUserId, privilegeGroupId, Role.CONTRIBUTOR);
    expect(openSnackBarSpy).toHaveBeenCalled();
  });



  /**
   * disableAddElement
   */
  it('disableAddElement - base group', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToAddUserToBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToBaseGroup').and.returnValue(true);
    let isAllowedToAddUserToPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToPrivilegeGroup').and.returnValue(false);

    expect(component.disableAddElement()).toBeFalse();

    expect(isAllowedToAddUserToBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToAddUserToPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableAddElement - base group but not allowd', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToAddUserToBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToBaseGroup').and.returnValue(false);
    let isAllowedToAddUserToPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToPrivilegeGroup').and.returnValue(false);

    expect(component.disableAddElement()).toBeTrue();

    expect(isAllowedToAddUserToBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToAddUserToPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableAddElement - privilege group', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToAddUserToBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToBaseGroup').and.returnValue(false);
    let isAllowedToAddUserToPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToPrivilegeGroup').and.returnValue(true);

    expect(component.disableAddElement()).toBeFalse();

    expect(isAllowedToAddUserToBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToAddUserToPrivilegeGroupSpy).toHaveBeenCalled();
  });

  it('disableAddElement - privilege group but missing role', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    let isAllowedToAddUserToBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToBaseGroup').and.returnValue(false);
    let isAllowedToAddUserToPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToPrivilegeGroup').and.returnValue(true);

    expect(component.disableAddElement()).toBeTrue();

    expect(isAllowedToAddUserToBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToAddUserToPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableAddElement - privilege group but not allowed', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToAddUserToBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToBaseGroup').and.returnValue(false);
    let isAllowedToAddUserToPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToAddUserToPrivilegeGroup').and.returnValue(false);

    expect(component.disableAddElement()).toBeTrue();

    expect(isAllowedToAddUserToBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToAddUserToPrivilegeGroupSpy).toHaveBeenCalled();
  });



  /**
   * removeElement
   */
  it('removeElement - no sub base group selected', fakeAsync(() => {
    component.elementsDataSource.data = [user, secondUser];
    component.selectedElement = undefined;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let removeUserFromBaseGroupSpy = spyOn(userService, 'removeUserFromBaseGroup').and.returnValue(of(true));
    let removeUserFromPrivilegeGroupSpy = spyOn(userService, 'removeUserFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeElement();

    tick();

    expect(component.selectedElement).not.toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(2);
    expect(removeUserFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(removeUserFromPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  }));

  it('removeElement - base group', fakeAsync(() => {
    component.elementsDataSource.data = [user, secondUser];
    component.selectedElement = secondUser;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let removeUserFromBaseGroupSpy = spyOn(userService, 'removeUserFromBaseGroup').and.returnValue(of(true));
    let removeUserFromPrivilegeGroupSpy = spyOn(userService, 'removeUserFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeElement();

    tick();

    expect(component.selectedElement).not.toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(userId);
    expect(removeUserFromBaseGroupSpy).toHaveBeenCalled();
    expect(removeUserFromPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  }));

  it('removeElement - base group but not removed', fakeAsync(() => {
    component.elementsDataSource.data = [user, secondUser];
    component.selectedElement = secondUser;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let removeUserFromBaseGroupSpy = spyOn(userService, 'removeUserFromBaseGroup').and.returnValue(of(false));
    let removeUserFromPrivilegeGroupSpy = spyOn(userService, 'removeUserFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeElement();

    tick();

    expect(component.selectedElement).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(2);
    expect(removeUserFromBaseGroupSpy).toHaveBeenCalled();
    expect(removeUserFromPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).toHaveBeenCalled();
  }));

  it('removeElement - privilege group', fakeAsync(() => {
    component.elementsDataSource.data = [user, secondUser];
    component.selectedElement = secondUser;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let removeUserFromBaseGroupSpy = spyOn(userService, 'removeUserFromBaseGroup').and.returnValue(of(false));
    let removeUserFromPrivilegeGroupSpy = spyOn(userService, 'removeUserFromPrivilegeGroup').and.returnValue(of(true));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeElement();

    tick();

    expect(component.selectedElement).not.toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(userId);
    expect(removeUserFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(removeUserFromPrivilegeGroupSpy).toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  }));

  it('removeElement - privilege group but not removed', fakeAsync(() => {
    component.elementsDataSource.data = [user, secondUser];
    component.selectedElement = secondUser;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let removeUserFromBaseGroupSpy = spyOn(userService, 'removeUserFromBaseGroup').and.returnValue(of(false));
    let removeUserFromPrivilegeGroupSpy = spyOn(userService, 'removeUserFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeElement();

    tick();

    expect(component.selectedElement).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(2);
    expect(removeUserFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(removeUserFromPrivilegeGroupSpy).toHaveBeenCalled();
    expect(openSnackBarSpy).toHaveBeenCalled();
  }));




  /**
   * disableRemoveElement
   */
  it('disableRemoveElement - no sub base group selected', () => {
    component.selectedElement = undefined;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToRemoveUserFromBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromBaseGroup').and.returnValue(true);
    let isAllowedToRemoveUserFromPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveElement()).toBeTrue();

    expect(isAllowedToRemoveUserFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveUserFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveElement - base group', () => {
    component.selectedElement = secondUser;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToRemoveUserFromBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromBaseGroup').and.returnValue(true);
    let isAllowedToRemoveUserFromPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveElement()).toBeFalse();

    expect(isAllowedToRemoveUserFromBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToRemoveUserFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveElement - base group but not allowd', () => {
    component.selectedElement = secondUser;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToRemoveUserFromBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveUserFromPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveElement()).toBeTrue();

    expect(isAllowedToRemoveUserFromBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToRemoveUserFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveElement - privilege group', () => {
    component.selectedElement = secondUser;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToRemoveUserFromBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveUserFromPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromPrivilegeGroup').and.returnValue(true);

    expect(component.disableRemoveElement()).toBeFalse();

    expect(isAllowedToRemoveUserFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveUserFromPrivilegeGroupSpy).toHaveBeenCalled();
  });

  it('disableRemoveElement - privilege group but missing role', () => {
    component.selectedElement = secondUser;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    let isAllowedToRemoveUserFromBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveUserFromPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromPrivilegeGroup').and.returnValue(true);

    expect(component.disableRemoveElement()).toBeTrue();

    expect(isAllowedToRemoveUserFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveUserFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveElement - privilege group but not allowed', () => {
    component.selectedElement = secondUser;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToRemoveUserFromBaseGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveUserFromPrivilegeGroupSpy = spyOn(userPermissionService, 'isAllowedToRemoveUserFromPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveElement()).toBeTrue();

    expect(isAllowedToRemoveUserFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveUserFromPrivilegeGroupSpy).toHaveBeenCalled();
  });



  /**
   * onFlattenSubgroups
   */
  it('onFlattenSubgroups - not flatten before', fakeAsync(() => {
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([secondUser]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;
    component.flatSubgroupsView = true;
    component.flattenSubgroups = false;

    component.onFlattenSubgroups()

    tick();

    expect(component.flattenSubgroups).toBeTrue();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondUserId);

    expect(getAllUsersFromPrivilegeGroupSpy).toHaveBeenCalled();
  }));

  it('onFlattenSubgroups - flattenn before', fakeAsync(() => {
    let getAllUsersFromPrivilegeGroupSpy = spyOn(userService, 'getAllUsersFromPrivilegeGroup').and.returnValue(of([secondUser]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;
    component.flatSubgroupsView = true;
    component.flattenSubgroups = true;

    component.onFlattenSubgroups()

    tick();

    expect(component.flattenSubgroups).toBeFalse();
    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(getAllUsersFromPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));
});
