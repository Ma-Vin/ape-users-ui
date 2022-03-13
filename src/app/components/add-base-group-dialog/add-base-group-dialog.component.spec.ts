import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MaterialModule } from '../../material/material.module';
import { ConfigService } from '../../config/config.service';
import { AdminService } from '../../services/backend/admin.service';
import { BaseGroupService } from '../../services/backend/base-group.service';
import { CommonGroupService } from '../../services/backend/common-group.service';
import { UserService } from '../../services/backend/user.service';
import { SelectionService } from '../../services/util/selection.service';

import { AddBaseGroupDialogComponent, AddBaseGroupDialogData } from './add-base-group-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseGroup, IBaseGroup } from 'src/app/model/base-group.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IPrivilegeGroup, PrivilegeGroup } from 'src/app/model/privilege-group.model';
import { of } from 'rxjs';


let component: AddBaseGroupDialogComponent;
let fixture: ComponentFixture<AddBaseGroupDialogComponent>;

let configService: ConfigService;
let httpMock: HttpTestingController;
let http: HttpClient;
let adminService: AdminService;
let userService: UserService;
let commonGroupService: CommonGroupService;
let selectionService: SelectionService;
let baseGroupService: BaseGroupService;

const baseGroupId = 'BGAA00001';
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

const privilegeGroup = PrivilegeGroup.map({
  identification: privilegeGroupId,
  groupName: privilegeGroupName,
  validFrom: new Date(2021, 9, 1),
  validTo: undefined,
  description: 'Bam!'
} as IPrivilegeGroup);

const dialogRef = {
  close: (dialogResult?: BaseGroup[]) => { }
} as MatDialogRef<AddBaseGroupDialogComponent>;


describe('AddBaseGroupDialogComponent - Base Group, but with type independent test', () => {

  let addBaseGroupDialogData: AddBaseGroupDialogData = { selectedGroup: baseGroup };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      declarations: [AddBaseGroupDialogComponent],
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
    baseGroupService = TestBed.inject(BaseGroupService);

    fixture = TestBed.createComponent(AddBaseGroupDialogComponent);
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
    let getAvailableBasePartsForBaseGroupSpy = spyOn(baseGroupService, 'getAvailableBasePartsForBaseGroup').and.returnValue(of([baseGroup]));
    let getAvailableBasePartsForPrivilegeGroupSpy = spyOn(baseGroupService, 'getAvailableBasePartsForPrivilegeGroup').and.returnValue(of([]));

    component.ngOnInit();

    tick();

    expect(component.dataSource.data).toBeDefined();
    expect(component.dataSource.data.length).toEqual(1);
    expect(component.dataSource.data[0].identification).toEqual(baseGroupId);

    expect(getAvailableBasePartsForBaseGroupSpy).toHaveBeenCalled();
    expect(getAvailableBasePartsForPrivilegeGroupSpy).not.toHaveBeenCalled();
  }));



  /**
   * isAllSelected
   */
  it('isAllSelected - not all selected', () => {
    component.dataSource.data.push(baseGroup);
    expect(component.isAllSelected()).toBeFalse();
  });

  it('isAllSelected - all selected', () => {
    component.dataSource.data.push(baseGroup);
    component.selection.select(baseGroup);
    expect(component.isAllSelected()).toBeTrue();
  });



  /**
   * masterToggle
   */
  it('masterToggle - all selected', () => {
    component.dataSource.data.push(baseGroup);
    component.selection.select(baseGroup);

    let selectSpy = spyOn(component.selection, 'select');
    let clearSpy = spyOn(component.selection, 'clear');

    component.masterToggle();

    expect(selectSpy).not.toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('masterToggle - not all selected', () => {
    component.dataSource.data.push(baseGroup);

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
    component.dataSource.data.push(baseGroup);

    expect(component.checkboxLabel(undefined)).toEqual('select all')
  });

  /**
   * checkboxLabel
   */
  it('checkboxLabel - undefined row, all selected', () => {
    component.dataSource.data.push(baseGroup);
    component.selection.select(baseGroup);

    expect(component.checkboxLabel(undefined)).toEqual('deselect all')
  });

  /**
   * checkboxLabel
   */
  it('checkboxLabel - row not selected', () => {
    component.dataSource.data.push(baseGroup);

    expect(component.checkboxLabel(baseGroup)).toEqual(`select row ${baseGroupId}`)
  });

  /**
   * checkboxLabel
   */
  it('checkboxLabel - row selected', () => {
    component.dataSource.data.push(baseGroup);
    component.selection.select(baseGroup);

    expect(component.checkboxLabel(baseGroup)).toEqual(`deselect row ${baseGroupId}`)
  });




  /**
   * onAccept
   */
  it('onAccept', () => {
    component.dataSource.data.push(baseGroup);
    component.selection.select(baseGroup);
    let closeSpy = spyOn(component.dialogRef, 'close');

    component.onAccept();

    expect(closeSpy).toHaveBeenCalledOnceWith(component.selection.selected);
  });



  /**
   * onCancel
   */
  it('onCancel', () => {
    component.dataSource.data.push(baseGroup);
    component.selection.select(baseGroup);
    let closeSpy = spyOn(component.dialogRef, 'close');

    component.onCancel();

    expect(closeSpy).toHaveBeenCalledOnceWith();
  });
});


describe('AddBaseGroupDialogComponent - Privilege Group, but without type independent test', () => {

  let addBaseGroupDialogData: AddBaseGroupDialogData = { selectedGroup: privilegeGroup };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      declarations: [AddBaseGroupDialogComponent],
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
    baseGroupService = TestBed.inject(BaseGroupService);

    fixture = TestBed.createComponent(AddBaseGroupDialogComponent);
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
    let getAvailableBasePartsForBaseGroupSpy = spyOn(baseGroupService, 'getAvailableBasePartsForBaseGroup').and.returnValue(of([]));
    let getAvailableBasePartsForPrivilegeGroupSpy = spyOn(baseGroupService, 'getAvailableBasePartsForPrivilegeGroup').and.returnValue(of([baseGroup]));

    component.ngOnInit();

    tick();

    expect(component.dataSource.data).toBeDefined();
    expect(component.dataSource.data.length).toEqual(1);
    expect(component.dataSource.data[0].identification).toEqual(baseGroupId);

    expect(getAvailableBasePartsForBaseGroupSpy).not.toHaveBeenCalled();
    expect(getAvailableBasePartsForPrivilegeGroupSpy).toHaveBeenCalled();
  }));


});
