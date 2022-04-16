import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { ChangeType, HistoryChange, IHistoryChange } from 'src/app/model/history-change.model';
import { PrivilegeGroup } from 'src/app/model/privilege-group.model';
import { AdminService } from 'src/app/services/backend/admin.service';
import { CommonGroupService } from 'src/app/services/backend/common-group.service';
import { INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK, PrivilegeGroupService } from 'src/app/services/backend/privilege-group.service';
import { INITIAL_USER_ID_AT_MOCK, UserService } from 'src/app/services/backend/user.service';
import { SelectionService } from 'src/app/services/util/selection.service';

import { PrivilegeGroupHistoryComponent } from './privilege-group-history.component';

describe('PrivilegeGroupHistoryComponent', () => {
  let privilegeGroupService: PrivilegeGroupService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let selectionService: SelectionService;

  let component: PrivilegeGroupHistoryComponent;
  let fixture: ComponentFixture<PrivilegeGroupHistoryComponent>;


  const privilegeGroupId = INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK;
  const userId = INITIAL_USER_ID_AT_MOCK;
  const privilegeGroupName = 'Name of the group';

  let privilegeGroup = PrivilegeGroup.map({
    description: 'some description',
    groupName: privilegeGroupName,
    identification: privilegeGroupId,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    isComplete: true
  });

  let historyChange = HistoryChange.map({
    action: undefined,
    changeTime: new Date(2022, 4, 10, 11, 8, 1),
    changeType: ChangeType.CREATE,
    editor: userId,
    subjectIdentification: privilegeGroupId,
    targetIdentification: undefined
  } as IHistoryChange);

  const dialogRef = { close: () => { } } as MatDialogRef<PrivilegeGroupHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }
        , { provide: MAT_DIALOG_DATA, useValue: privilegeGroup }],
      declarations: [PrivilegeGroupHistoryComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    commonGroupService = TestBed.inject(CommonGroupService);
    selectionService = TestBed.inject(SelectionService);
    privilegeGroupService = TestBed.inject(PrivilegeGroupService);

    fixture = TestBed.createComponent(PrivilegeGroupHistoryComponent);

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
    let privilegeGroupHistorySpy = spyOn(privilegeGroupService, 'getPrivilegeGroupHistory').and.returnValue(of([historyChange]));

    component.ngOnInit();

    tick();

    expect(component.elementsDataSource.data).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].subjectIdentification).toEqual(privilegeGroupId);
    expect(component.elementsDataSource.data[0].editor).toEqual(userId);

    expect(privilegeGroupHistorySpy).toHaveBeenCalled();
  }));



  /**
   * onClose
   */
  it('onClose', () => {
    let closeSpy = spyOn(dialogRef, 'close');

    component.onClose();

    expect(closeSpy).toHaveBeenCalled();
  });

});
