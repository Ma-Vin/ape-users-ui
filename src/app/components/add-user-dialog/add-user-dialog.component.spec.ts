import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { BaseGroup, IBaseGroup } from 'src/app/model/base-group.model';
import { IPrivilegeGroup, PrivilegeGroup } from 'src/app/model/privilege-group.model';
import { Role } from 'src/app/model/role.model';
import { IUser, User } from 'src/app/model/user.model';
import { AdminService } from 'src/app/services/backend/admin.service';
import { CommonGroupService } from 'src/app/services/backend/common-group.service';
import { UserService } from 'src/app/services/backend/user.service';
import { SelectionService } from 'src/app/services/util/selection.service';
import { AddElementDialogData } from '../add-element-dialog/add-element-dialog.component';

import { AddUserDialogComponent } from './add-user-dialog.component';


let component: AddUserDialogComponent;
let fixture: ComponentFixture<AddUserDialogComponent>;

let configService: ConfigService;
let httpMock: HttpTestingController;
let http: HttpClient;
let adminService: AdminService;
let userService: UserService;
let commonGroupService: CommonGroupService;
let selectionService: SelectionService;

const baseGroupId = 'BGAA00001';
const baseGroupName = 'Name of the base group';
const privilegeGroupId = 'PGAA00001';
const privilegeGroupName = 'Name of the privilege group';
const userId = 'UAA00001';
const firstName = 'Max';
const lastName = 'Power';

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
  isGlobalAdmin: false,
  isComplete: true
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

const dialogRef = {
  close: (dialogResult?: BaseGroup[]) => { }
} as MatDialogRef<AddUserDialogComponent>;




describe('AddUserDialogComponent - Base Group, but with type independent test', () => {

  let addBaseGroupDialogData: AddElementDialogData = { selectedGroup: baseGroup };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      declarations: [AddUserDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }
        , { provide: MAT_DIALOG_DATA, useValue: addBaseGroupDialogData }
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

    fixture = TestBed.createComponent(AddUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  /**
    * ngOnInit
    */
  it('ngOnInit', fakeAsync(() => {
    let getAvailableUserPartsForBaseGroupSpy = spyOn(userService, 'getAvailableUserPartsForBaseGroup').and.returnValue(of([user]));
    let getAvailableUserPartsForPrivilegeGroupSpy = spyOn(userService, 'getAvailableUserPartsForPrivilegeGroup').and.returnValue(of([]));

    component.ngOnInit();

    tick();

    expect(component.dataSource.data).toBeDefined();
    expect(component.dataSource.data.length).toEqual(1);
    expect(component.dataSource.data[0].identification).toEqual(userId);

    expect(getAvailableUserPartsForBaseGroupSpy).toHaveBeenCalled();
    expect(getAvailableUserPartsForPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));



  /**
   * isAllSelected
   */
  it('isAllSelected - not all selected', () => {
    component.dataSource.data.push(user);
    expect(component.isAllSelected()).toBeFalse();
  });

  it('isAllSelected - all selected', () => {
    component.dataSource.data.push(user);
    component.selection.select(user);
    expect(component.isAllSelected()).toBeTrue();
  });



  /**
   * masterToggle
   */
  it('masterToggle - all selected', () => {
    component.dataSource.data.push(user);
    component.selection.select(user);

    let selectSpy = spyOn(component.selection, 'select');
    let clearSpy = spyOn(component.selection, 'clear');

    component.masterToggle();

    expect(selectSpy).not.toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('masterToggle - not all selected', () => {
    component.dataSource.data.push(user);

    let selectSpy = spyOn(component.selection, 'select');
    let clearSpy = spyOn(component.selection, 'clear');

    component.masterToggle();

    expect(selectSpy).toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
  });



  /**
   * checkboxLabel
   */
  it('checkboxLabel - undefined row, not all selected', () => {
    component.dataSource.data.push(user);

    expect(component.checkboxLabel(undefined)).toEqual('select all')
  });

  /**
   * checkboxLabel
   */
  it('checkboxLabel - undefined row, all selected', () => {
    component.dataSource.data.push(user);
    component.selection.select(user);

    expect(component.checkboxLabel(undefined)).toEqual('deselect all')
  });

  /**
   * checkboxLabel
   */
  it('checkboxLabel - row not selected', () => {
    component.dataSource.data.push(user);

    expect(component.checkboxLabel(user)).toEqual(`select row ${userId}`)
  });

  /**
   * checkboxLabel
   */
  it('checkboxLabel - row selected', () => {
    component.dataSource.data.push(user);
    component.selection.select(user);

    expect(component.checkboxLabel(user)).toEqual(`deselect row ${userId}`)
  });




  /**
   * onAccept
   */
  it('onAccept', () => {
    component.dataSource.data.push(user);
    component.selection.select(user);
    let closeSpy = spyOn(component.dialogRef, 'close');

    component.onAccept();

    expect(closeSpy).toHaveBeenCalledOnceWith(component.selection.selected);
  });



  /**
   * onCancel
   */
  it('onCancel', () => {
    component.dataSource.data.push(user);
    component.selection.select(user);
    let closeSpy = spyOn(component.dialogRef, 'close');

    component.onCancel();

    expect(closeSpy).toHaveBeenCalledOnceWith();
  });
});


describe('AddUserDialogComponent - Privilege Group, but without type independent test', () => {

  let addElementDialogData: AddElementDialogData = { selectedGroup: privilegeGroup };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      declarations: [AddUserDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }
        , { provide: MAT_DIALOG_DATA, useValue: addElementDialogData }
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

    fixture = TestBed.createComponent(AddUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });



  it('should create', () => {
    expect(component).toBeTruthy();
  });



  /**
   * ngOnInit
   */
  it('ngOnInit', fakeAsync(() => {
    let getAvailableUserPartsForBaseGroupSpy = spyOn(userService, 'getAvailableUserPartsForBaseGroup').and.returnValue(of([]));
    let getAvailableUserPartsForPrivilegeGroupSpy = spyOn(userService, 'getAvailableUserPartsForPrivilegeGroup').and.returnValue(of([user]));

    component.ngOnInit();

    tick();

    expect(component.dataSource.data).toBeDefined();
    expect(component.dataSource.data.length).toEqual(1);
    expect(component.dataSource.data[0].identification).toEqual(userId);

    expect(getAvailableUserPartsForBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAvailableUserPartsForPrivilegeGroupSpy).toHaveBeenCalled();
  }));


});
