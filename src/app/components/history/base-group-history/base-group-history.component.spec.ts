import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { BaseGroup } from 'src/app/model/base-group.model';
import { ChangeType, HistoryChange, IHistoryChange } from 'src/app/model/history-change.model';
import { AdminService } from 'src/app/services/backend/admin.service';
import { BaseGroupService, INITIAL_BASE_GROUP_ID_AT_MOCK } from 'src/app/services/backend/base-group.service';
import { CommonGroupService } from 'src/app/services/backend/common-group.service';
import { INITIAL_USER_ID_AT_MOCK, UserService } from 'src/app/services/backend/user.service';
import { SelectionService } from 'src/app/services/util/selection.service';

import { BaseGroupHistoryComponent } from './base-group-history.component';

describe('BaseGroupHistoryComponent', () => {
  let baseGroupService: BaseGroupService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let selectionService: SelectionService;

  let component: BaseGroupHistoryComponent;
  let fixture: ComponentFixture<BaseGroupHistoryComponent>;

  const baseGroupId = INITIAL_BASE_GROUP_ID_AT_MOCK;
  const userId = INITIAL_USER_ID_AT_MOCK;
  const baseGroupName = 'Name of the group';

  let baseGroup = BaseGroup.map({
    description: 'some description',
    groupName: baseGroupName,
    identification: baseGroupId,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    isComplete: true
  });

  let historyChange = HistoryChange.map({
    action: undefined,
    changeTime: new Date(2022, 4, 10, 11, 8, 1),
    changeType: ChangeType.CREATE,
    editor: userId,
    subjectIdentification: baseGroupId,
    targetIdentification: undefined
  } as IHistoryChange);

  const dialogRef = { close: () => { } } as MatDialogRef<BaseGroupHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }, { provide: MAT_DIALOG_DATA, useValue: baseGroup }],
      declarations: [BaseGroupHistoryComponent]
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

    fixture = TestBed.createComponent(BaseGroupHistoryComponent);
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
    let baseGroupHistorySpy = spyOn(baseGroupService, 'getBaseGroupHistory').and.returnValue(of([historyChange]));

    component.ngOnInit();

    tick();

    expect(component.elementsDataSource.data).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].subjectIdentification).toEqual(baseGroupId);
    expect(component.elementsDataSource.data[0].editor).toEqual(userId);

    expect(baseGroupHistorySpy).toHaveBeenCalled();
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
