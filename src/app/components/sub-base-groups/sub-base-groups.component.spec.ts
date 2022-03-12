import { ComponentType } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NEVER, Observable, of } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { MaterialModule } from '../../material/material.module';
import { BaseGroup, IBaseGroup } from '../../model/base-group.model';
import { IPrivilegeGroup, PrivilegeGroup } from '../../model/privilege-group.model';
import { Role } from '../../model/role.model';
import { AdminService } from '../../services/backend/admin.service';
import { BaseGroupService } from '../../services/backend/base-group.service';
import { CommonGroupService } from '../../services/backend/common-group.service';
import { UserService } from '../../services/backend/user.service';
import { BaseGroupPermissionsService } from '../../services/permissions/base-group-permissions.service';
import { SelectionService } from '../../services/util/selection.service';
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
    component.areOnlyPartsToLoadAtList = false;
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([secondBaseGroup]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnInit - parts, base group selected', fakeAsync(() => {
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([secondBaseGroup]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnInit - privilege group with role selected', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([secondBaseGroup]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnInit - parts, privilege group with role selected', fakeAsync(() => {
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([secondBaseGroup]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).toHaveBeenCalled();
  }));

  it('ngOnInit - privilege group without role selected', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    component.ngOnInit()

    tick();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));




  /**
   * ngOnChanges
   */
  it('ngOnChanges - base group selected', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([secondBaseGroup]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnChanges - parts, base group selected', fakeAsync(() => {
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([secondBaseGroup]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnChanges - privilege group with role selected', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([secondBaseGroup]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));

  it('ngOnChanges - parts, privilege group with role selected', fakeAsync(() => {
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([secondBaseGroup]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).toHaveBeenCalled();
  }));

  it('ngOnChanges - privilege group without role selected', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllBasesAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasesAtBaseGroup').and.returnValue(of([]));
    let getAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasesAtPrivilegeGroup').and.returnValue(of([]));
    let getAllBasePartsAtBaseGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtBaseGroup').and.returnValue(of([]));
    let getAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupService, 'getAllBasePartsAtPrivilegeGroup').and.returnValue(of([]));

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    component.ngOnChanges({} as SimpleChanges)

    tick();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(getAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));




  /**
   * showElements
   */
  it('showElements - base group and allowed', () => {
    component.areOnlyPartsToLoadAtList = false;
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(true);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    expect(component.showElements()).toBeTrue();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - parts, base group and allowed', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(true);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    expect(component.showElements()).toBeTrue();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - base group and not allowed', () => {
    component.areOnlyPartsToLoadAtList = false;
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    expect(component.showElements()).toBeFalse();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - parts base group and not allowed', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    expect(component.showElements()).toBeFalse();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - privilege group and allowed', () => {
    component.areOnlyPartsToLoadAtList = false;
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(true);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    expect(component.showElements()).toBeTrue();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - parts, privilege group and allowed', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(true);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    expect(component.showElements()).toBeTrue();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).toHaveBeenCalled();
  });

  it('showElements - privilege group and allowed, but missing role', () => {
    component.areOnlyPartsToLoadAtList = false;
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(true);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    expect(component.showElements()).toBeFalse();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - parts, privilege group and allowed, but missing role', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(true);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    expect(component.showElements()).toBeFalse();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - privilege group and not allowed', () => {
    component.areOnlyPartsToLoadAtList = false;
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    expect(component.showElements()).toBeFalse();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('showElements - parts, privilege group and not allowed', () => {
    let isAllowedToGetAllBasesAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasesAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasesAtPrivilegeGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtBaseGroup').and.returnValue(false);
    let isAllowedToGetAllBasePartsAtPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToGetAllBasePartsAtPrivilegeGroup').and.returnValue(false);

    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.ADMIN;

    expect(component.showElements()).toBeFalse();

    expect(isAllowedToGetAllBasesAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasesAtPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToGetAllBasePartsAtPrivilegeGroupSpy).toHaveBeenCalled();
  });




  /**
   * onSelectElement
   */
  it('onSelectElement - nothing selected', () => {
    component.selectedElement = undefined;

    component.onSelectElement(baseGroup);

    expect(component.selectedElement).toBeDefined();
    expect(component.selectedElement!.identification).toEqual(baseGroupId);
  });

  it('onSelectElement - same selected', () => {
    component.selectedElement = baseGroup;

    component.onSelectElement(baseGroup);

    expect(component.selectedElement).not.toBeDefined();
  });

  it('onSelectElement - other selected', () => {
    component.selectedElement = secondBaseGroup;

    component.onSelectElement(baseGroup);

    expect(component.selectedElement).toBeDefined();
    expect(component.selectedElement!.identification).toEqual(baseGroupId);
  });



  /**
   * isElementSelected
   */
  it('isElementSelected - nothing selected', () => {
    component.selectedElement = undefined;

    expect(component.isElementSelected(baseGroup)).toBeFalse();
  });

  it('isElementSelected - same selected', () => {
    component.selectedElement = baseGroup;

    expect(component.isElementSelected(baseGroup)).toBeTrue();
  });

  it('isElementSelected - other selected', () => {
    component.selectedElement = secondBaseGroup;

    expect(component.isElementSelected(baseGroup)).toBeFalse();
  });



  /**
   * openAddElementDialog
   */
  it('openAddElementDialog - add to base group', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(true));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).toHaveBeenCalledWith(secondBaseGroupId, baseGroupId);
    expect(addBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
    expect(listModifiedEmitterSpy).toHaveBeenCalled();
  });

  it('openAddElementDialog - add to base group, but not added', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(false));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).toHaveBeenCalledWith(secondBaseGroupId, baseGroupId);
    expect(addBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).toHaveBeenCalled();
    expect(listModifiedEmitterSpy).not.toHaveBeenCalled();
  });

  it('openAddElementDialog - add to base group, but undefined return at dialog', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of(undefined));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(true));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).not.toHaveBeenCalledWith(secondBaseGroupId, baseGroupId);
    expect(addBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
    expect(listModifiedEmitterSpy).not.toHaveBeenCalled();
  });

  it('openAddElementDialog - add to privilege group', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(false));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(true));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(secondBaseGroupId);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(addBaseToPrivilegeGroupSpy).toHaveBeenCalledWith(secondBaseGroupId, privilegeGroupId, Role.CONTRIBUTOR);
    expect(openSnackBarSpy).not.toHaveBeenCalled();
    expect(listModifiedEmitterSpy).toHaveBeenCalled();
  });

  it('openAddElementDialog - add to privilege group, without privilege', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(false));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(true));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(addBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
    expect(listModifiedEmitterSpy).not.toHaveBeenCalled();
  });

  it('openAddElementDialog - add to privilege group, but not added', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let afterClosedSpy = spyOn(dialogRef, 'afterClosed').and.returnValue(of([secondBaseGroup]));
    let addBaseToBaseGroupSpy = spyOn(baseGroupService, 'addBaseToBaseGroup').and.returnValue(of(false));
    let addBaseToPrivilegeGroupSpy = spyOn(baseGroupService, 'addBaseToPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.openAddElementDialog();

    expect(component.elementsDataSource.data.length).toEqual(0);

    expect(afterClosedSpy).toHaveBeenCalled();
    expect(addBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(addBaseToPrivilegeGroupSpy).toHaveBeenCalledWith(secondBaseGroupId, privilegeGroupId, Role.CONTRIBUTOR);
    expect(openSnackBarSpy).toHaveBeenCalled();
    expect(listModifiedEmitterSpy).not.toHaveBeenCalled();
  });



  /**
   * disableAddElement
   */
  it('disableAddElement - base group', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(true);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(false);

    expect(component.disableAddElement()).toBeFalse();

    expect(isAllowedToAddBaseToBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableAddElement - base group but not allowd', () => {
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(false);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(false);

    expect(component.disableAddElement()).toBeTrue();

    expect(isAllowedToAddBaseToBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableAddElement - privilege group', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(false);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(true);

    expect(component.disableAddElement()).toBeFalse();

    expect(isAllowedToAddBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).toHaveBeenCalled();
  });

  it('disableAddElement - privilege group but missing role', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(false);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(true);

    expect(component.disableAddElement()).toBeTrue();

    expect(isAllowedToAddBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableAddElement - privilege group but not allowed', () => {
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToAddBaseToBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToBaseGroup').and.returnValue(false);
    let isAllowedToAddBaseToPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToAddBaseToPrivilegeGroup').and.returnValue(false);

    expect(component.disableAddElement()).toBeTrue();

    expect(isAllowedToAddBaseToBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToAddBaseToPrivilegeGroupSpy).toHaveBeenCalled();
  });



  /**
   * removeElement
   */
  it('removeElement - no sub base group selected', fakeAsync(() => {
    component.elementsDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedElement = undefined;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(true));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.removeElement();

    tick();

    expect(component.selectedElement).not.toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(2);
    expect(removeBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
    expect(listModifiedEmitterSpy).not.toHaveBeenCalled();
  }));

  it('removeElement - base group', fakeAsync(() => {
    component.elementsDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedElement = secondBaseGroup;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(true));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.removeElement();

    tick();

    expect(component.selectedElement).not.toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(thirdBaseGroupId);
    expect(removeBaseFromBaseGroupSpy).toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
    expect(listModifiedEmitterSpy).toHaveBeenCalled();
  }));

  it('removeElement - base group but not removed', fakeAsync(() => {
    component.elementsDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedElement = secondBaseGroup;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(false));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.removeElement();

    tick();

    expect(component.selectedElement).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(2);
    expect(removeBaseFromBaseGroupSpy).toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openSnackBarSpy).toHaveBeenCalled();
    expect(listModifiedEmitterSpy).not.toHaveBeenCalled();
  }));

  it('removeElement - privilege group', fakeAsync(() => {
    component.elementsDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedElement = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(false));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(true));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.removeElement();

    tick();

    expect(component.selectedElement).not.toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].identification).toEqual(thirdBaseGroupId);
    expect(removeBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).toHaveBeenCalled();
    expect(openSnackBarSpy).not.toHaveBeenCalled();
    expect(listModifiedEmitterSpy).toHaveBeenCalled();
  }));

  it('removeElement - privilege group but not removed', fakeAsync(() => {
    component.elementsDataSource.data = [thirdBaseGroup, secondBaseGroup];
    component.selectedElement = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let removeBaseFromBaseGroupSpy = spyOn(baseGroupService, 'removeBaseFromBaseGroup').and.returnValue(of(false));
    let removeBaseFromPrivilegeGroupSpy = spyOn(baseGroupService, 'removeBaseFromPrivilegeGroup').and.returnValue(of(false));
    let openSnackBarSpy = spyOn(snackBar, 'open');
    let listModifiedEmitterSpy = spyOn(component.onListModifiedEventEmitter, 'emit');

    component.removeElement();

    tick();

    expect(component.selectedElement).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(2);
    expect(removeBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(removeBaseFromPrivilegeGroupSpy).toHaveBeenCalled();
    expect(openSnackBarSpy).toHaveBeenCalled();
    expect(listModifiedEmitterSpy).not.toHaveBeenCalled();
  }));




  /**
   * disableRemoveElement
   */
  it('disableRemoveElement - no sub base group selected', () => {
    component.selectedElement = undefined;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(true);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveElement()).toBeTrue();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveElement - base group', () => {
    component.selectedElement = secondBaseGroup;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(true);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveElement()).toBeFalse();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveElement - base group but not allowd', () => {
    component.selectedElement = secondBaseGroup;
    component.selectedBaseGroup = baseGroup;
    component.selectedPrivilegeGroup = undefined;
    component.role = undefined;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveElement()).toBeTrue();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveElement - privilege group', () => {
    component.selectedElement = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(true);

    expect(component.disableRemoveElement()).toBeFalse();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).toHaveBeenCalled();
  });

  it('disableRemoveElement - privilege group but missing role', () => {
    component.selectedElement = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = undefined;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(true);

    expect(component.disableRemoveElement()).toBeTrue();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).not.toHaveBeenCalled();
  });

  it('disableRemoveElement - privilege group but not allowed', () => {
    component.selectedElement = secondBaseGroup;
    component.selectedBaseGroup = undefined;
    component.selectedPrivilegeGroup = privilegeGroup;
    component.role = Role.CONTRIBUTOR;

    let isAllowedToRemoveBaseFromBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBaseGroup').and.returnValue(false);
    let isAllowedToRemoveBaseFromBPrivilegeGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToRemoveBaseFromBPrivilegeGroup').and.returnValue(false);

    expect(component.disableRemoveElement()).toBeTrue();

    expect(isAllowedToRemoveBaseFromBaseGroupSpy).not.toHaveBeenCalled();
    expect(isAllowedToRemoveBaseFromBPrivilegeGroupSpy).toHaveBeenCalled();
  });

});
