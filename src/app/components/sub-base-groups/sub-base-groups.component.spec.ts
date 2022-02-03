import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NEVER, Observable, of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { BaseGroup, IBaseGroup } from 'src/app/model/base-group.model';
import { IPrivilegeGroup, PrivilegeGroup } from 'src/app/model/privilege-group.model';
import { Role } from 'src/app/model/role.model';
import { AdminService } from 'src/app/services/backend/admin.service';
import { BaseGroupService } from 'src/app/services/backend/base-group.service';
import { CommonGroupService } from 'src/app/services/backend/common-group.service';
import { UserService } from 'src/app/services/backend/user.service';
import { BaseGroupPermissionsService } from 'src/app/services/permissions/base-group-permissions.service';
import { SelectionService } from 'src/app/services/util/selection.service';
import { AddBaseGroupDialogComponent } from '../add-base-group-dialog/add-base-group-dialog.component';

import { SubBaseGroupsComponent } from './sub-base-groups.component';

describe('SubBaseGroupsComponent', () => {
  let component: SubBaseGroupsComponent;
  let fixture: ComponentFixture<SubBaseGroupsComponent>;

  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let selectionService: SelectionService;
  let baseGroupService: BaseGroupService;
  let baseGroupPermissionsService: BaseGroupPermissionsService;

  let dialogRef: MatDialogRef<AddBaseGroupDialogComponent, BaseGroup[]> = { afterClosed: () => NEVER as Observable<BaseGroup[]> } as MatDialogRef<AddBaseGroupDialogComponent, BaseGroup[]>;
  let dialog: MatDialog = { open: (component: ComponentType<AddBaseGroupDialogComponent>, config?: MatDialogConfig) => dialogRef } as MatDialog;
  let snackBar: MatSnackBar = { open: (message: string, action?: string | undefined, config?: MatSnackBarConfig<any> | undefined) => { } } as MatSnackBar;

  const baseGroupId = 'BGAA00001';
  const secondBaseGroupId = 'BGAA00002';
  const thirdBaseGroupId = 'BGAA00003';
  const baseGroupName = 'Name of the base group';
  const privilegeGroupId = 'PGAA00001';
  const privilegeGroupName = 'Name of the privilege group';

  const baseGroup = BaseGroup.map({
    identification: baseGroupId,
    groupName: baseGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!'
  } as IBaseGroup);

  const secondBaseGroup = BaseGroup.map({
    identification: secondBaseGroupId,
    groupName: baseGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!'
  } as IBaseGroup);

  const thirdBaseGroup = BaseGroup.map({
    identification: thirdBaseGroupId,
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
      declarations: [SubBaseGroupsComponent],
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
    baseGroupService = TestBed.inject(BaseGroupService);
    baseGroupPermissionsService = TestBed.inject(BaseGroupPermissionsService);


    fixture = TestBed.createComponent(SubBaseGroupsComponent);
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
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([secondBaseGroup]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    component.ngOnInit()

    tick();

    expect(component.subgroupDataSource.data.length).toEqual(1);
    expect(component.subgroupDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnInit - privilege group with role selected', fakeAsync(() => {
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([secondBaseGroup]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    component.ngOnInit()

    tick();

    expect(component.subgroupDataSource.data.length).toEqual(1);
    expect(component.subgroupDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).toHaveBeenCalled();
  }));

  it('ngOnInit - privilege group without role selected', fakeAsync(() => {
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    component.ngOnInit()

    tick();

    expect(component.subgroupDataSource.data.length).toEqual(0);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));


  /**
   * ngOnChanges
   */
  it('ngOnChanges - base group selected', fakeAsync(() => {
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([secondBaseGroup]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.subgroupDataSource.data.length).toEqual(1);
    expect(component.subgroupDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnChanges - privilege group with role selected', fakeAsync(() => {
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([secondBaseGroup]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.subgroupDataSource.data.length).toEqual(1);
    expect(component.subgroupDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).toHaveBeenCalled();
  }));

  it('ngOnChanges - privilege group without role selected', fakeAsync(() => {
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.subgroupDataSource.data.length).toEqual(0);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));


  /**
   * showSubBaseGroups
   */
  it('showSubBaseGroups - base group and allowed', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(true);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    expect(component.showSubBaseGroups()).toBeTrue();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showSubBaseGroups - base group and not allowed', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    expect(component.showSubBaseGroups()).toBeFalse();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showSubBaseGroups - privilege group and allowed', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(true);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    expect(component.showSubBaseGroups()).toBeTrue();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).toHaveBeenCalled();
  });


  it('showSubBaseGroups - privilege group and allowed, but missing role', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(true);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    expect(component.showSubBaseGroups()).toBeFalse();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showSubBaseGroups - privilege group and not allowed', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    expect(component.showSubBaseGroups()).toBeFalse();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).toHaveBeenCalled();
  });



  /**
   * onSelectSubGroup
   */
  it('onSelectSubGroup - nothing selected', () => {
    component.selectedSubGroup = undefined;

    component.onSelectSubGroup(baseGroup);

    expect(component.selectedSubGroup).toBeDefined();
    expect(component.selectedSubGroup!.identification).toEqual(baseGroupId);
  });

  it('onSelectSubGroup - same selected', () => {
    component.selectedSubGroup = baseGroup;

    component.onSelectSubGroup(baseGroup);

    expect(component.selectedSubGroup).not.toBeDefined();
  });

  it('onSelectSubGroup - other selected', () => {
    component.selectedSubGroup = secondBaseGroup;

    component.onSelectSubGroup(baseGroup);

    expect(component.selectedSubGroup).toBeDefined();
    expect(component.selectedSubGroup!.identification).toEqual(baseGroupId);
  });



  /**
   * isSubGroupSelected
   */
  it('isSubGroupSelected - nothing selected', () => {
    component.selectedSubGroup = undefined;

    expect(component.isSubGroupSelected(baseGroup)).toBeFalse();
  });

  it('isSubGroupSelected - same selected', () => {
    component.selectedSubGroup = baseGroup;

    expect(component.isSubGroupSelected(baseGroup)).toBeTrue();
  });

  it('isSubGroupSelected - other selected', () => {
    component.selectedSubGroup = secondBaseGroup;

    expect(component.isSubGroupSelected(baseGroup)).toBeFalse();
  });



  /**
   * openAddSubGroupDialog
   */
  it('openAddSubGroupDialog - add to base group', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(true));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddSubGroupDialog();

    expect(component.subgroupDataSource.data.length).toEqual(1);
    expect(component.subgroupDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).toHaveBeenCalledWith(secondBaseGroupId, baseGroupId);
    expect(addBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  });

  it('openAddSubGroupDialog - add to base group, but not added', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(false));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddSubGroupDialog();

    expect(component.subgroupDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).toHaveBeenCalledWith(secondBaseGroupId, baseGroupId);
    expect(addBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).toHaveBeenCalled();
  });

  it('openAddSubGroupDialog - add to base group, but undefined return at dialog', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of(undefined));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(true));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddSubGroupDialog();

    expect(component.subgroupDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).not.toHaveBeenCalledWith(secondBaseGroupId, baseGroupId);
    expect(addBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  });

  it('openAddSubGroupDialog - add to privilege group', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(false));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(true));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddSubGroupDialog();

    expect(component.subgroupDataSource.data.length).toEqual(1);
    expect(component.subgroupDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(addBaseToPrivilegeGroupSpy).toHaveBeenCalledWith(secondBaseGroupId, privilegeGroupId, Role.CONTRIBUTOR);
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  });

  it('openAddSubGroupDialog - add to privilege group, without privilege', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(false));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(true));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddSubGroupDialog();

    expect(component.subgroupDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(addBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  });

  it('openAddSubGroupDialog - add to privilege group, but not added', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(false));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.openAddSubGroupDialog();

    expect(component.subgroupDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(addBaseToPrivilegeGroupSpy).toHaveBeenCalledWith(secondBaseGroupId, privilegeGroupId, Role.CONTRIBUTOR);
    expect(openSnackBarSpy).toHaveBeenCalled();
  });



  /**
   * disableAddBaseGroup
   */
  it('disableAddBaseGroup - base group', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(true);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(false);

    expect(component.disableAddBaseGroup()).toBeFalse();

    expect(isAllowedToAddBaseToBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableAddBaseGroup - base group but not allowd', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(false);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(false);

    expect(component.disableAddBaseGroup()).toBeTrue();

    expect(isAllowedToAddBaseToBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableAddBaseGroup - privilege group', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(false);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(true);

    expect(component.disableAddBaseGroup()).toBeFalse();

    expect(isAllowedToAddBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).toHaveBeenCalled();
  });

  it('disableAddBaseGroup - privilege group but missing role', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(false);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(true);

    expect(component.disableAddBaseGroup()).toBeTrue();

    expect(isAllowedToAddBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableAddBaseGroup - privilege group but not allowed', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(false);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(false);

    expect(component.disableAddBaseGroup()).toBeTrue();

    expect(isAllowedToAddBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).toHaveBeenCalled();
  });



  /**
   * removeSubGroup
   */
  it('removeSubGroup - no sub base group selected', fakeAsync(() => {
    component.subgroupDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedSubGroup = undefined;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(true));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeSubGroup();

    tick();

    expect(component.selectedSubGroup).not.toBeDefined();
    expect(component.subgroupDataSource.data.length).toEqual(2);
    expect(removeBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  }));

  it('removeSubGroup - base group', fakeAsync(() => {
    component.subgroupDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedSubGroup = secondBaseGroup;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(true));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeSubGroup();

    tick();

    expect(component.selectedSubGroup).not.toBeDefined();
    expect(component.subgroupDataSource.data.length).toEqual(1);
    expect(component.subgroupDataSource.data[0].identification).toEqual(thirdBaseGroupId);
    expect(removeBaseFromBaseGroupSpy).toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  }));

  it('removeSubGroup - base group but not removed', fakeAsync(() => {
    component.subgroupDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedSubGroup = secondBaseGroup;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(false));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeSubGroup();

    tick();

    expect(component.selectedSubGroup).toBeDefined();
    expect(component.subgroupDataSource.data.length).toEqual(2);
    expect(removeBaseFromBaseGroupSpy).toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).toHaveBeenCalled();
  }));

  it('removeSubGroup - privilege group', fakeAsync(() => {
    component.subgroupDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedSubGroup = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(false));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(true));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeSubGroup();

    tick();

    expect(component.selectedSubGroup).not.toBeDefined();
    expect(component.subgroupDataSource.data.length).toEqual(1);
    expect(component.subgroupDataSource.data[0].identification).toEqual(thirdBaseGroupId);
    expect(removeBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
  }));

  it('removeSubGroup - privilege group but not removed', fakeAsync(() => {
    component.subgroupDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedSubGroup = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(false));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');

    component.removeSubGroup();

    tick();

    expect(component.selectedSubGroup).toBeDefined();
    expect(component.subgroupDataSource.data.length).toEqual(2);
    expect(removeBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).toHaveBeenCalled();
    expect(openSnackBarSpy).toHaveBeenCalled();
  }));




  /**
   * disableRemoveBaseGroup
   */
  it('disableRemoveBaseGroup - no sub base group selected', () => {
    component.selectedSubGroup = undefined;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(true);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveBaseGroup()).toBeTrue();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveBaseGroup - base group', () => {
    component.selectedSubGroup = secondBaseGroup;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(true);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveBaseGroup()).toBeFalse();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveBaseGroup - base group but not allowd', () => {
    component.selectedSubGroup = secondBaseGroup;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveBaseGroup()).toBeTrue();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveBaseGroup - privilege group', () => {
    component.selectedSubGroup = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(true);

    expect(component.disableRemoveBaseGroup()).toBeFalse();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).toHaveBeenCalled();
  });

  it('disableRemoveBaseGroup - privilege group but missing role', () => {
    component.selectedSubGroup = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(true);

    expect(component.disableRemoveBaseGroup()).toBeTrue();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveBaseGroup - privilege group but not allowed', () => {
    component.selectedSubGroup = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveBaseGroup()).toBeTrue();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).toHaveBeenCalled();
  });

});