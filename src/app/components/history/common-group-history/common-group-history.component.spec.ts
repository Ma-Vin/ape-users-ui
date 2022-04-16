import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { CommonGroup, ICommonGroup } from 'src/app/model/common-group.model';
import { ChangeType, HistoryChange, IHistoryChange } from 'src/app/model/history-change.model';
import { Role } from 'src/app/model/role.model';
import { CommonGroupService, INITIAL_COMMON_GROUP_ID_AT_MOCK } from 'src/app/services/backend/common-group.service';
import { INITIAL_USER_ID_AT_MOCK } from 'src/app/services/backend/user.service';

import { CommonGroupHistoryComponent } from './common-group-history.component';

describe('CommonGroupHistoryComponent', () => {
  let commonGroupService: CommonGroupService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  let component: CommonGroupHistoryComponent;
  let fixture: ComponentFixture<CommonGroupHistoryComponent>;

  const commonGroupId = INITIAL_COMMON_GROUP_ID_AT_MOCK;
  const userId = INITIAL_USER_ID_AT_MOCK;
  const commonGroupName = 'Name of the group';

  let baseGroup = CommonGroup.map({
    description: 'some description',
    groupName: commonGroupName,
    identification: commonGroupId,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    defaultRole: Role.VISITOR,
    isComplete: true
  } as ICommonGroup);

  let historyChange = HistoryChange.map({
    action: undefined,
    changeTime: new Date(2022, 4, 10, 11, 8, 1),
    changeType: ChangeType.CREATE,
    editor: userId,
    subjectIdentification: commonGroupId,
    targetIdentification: undefined
  } as IHistoryChange);

  const dialogRef = { close: () => { } } as MatDialogRef<CommonGroupHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }, { provide: MAT_DIALOG_DATA, useValue: baseGroup }],
      declarations: [CommonGroupHistoryComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    commonGroupService = TestBed.inject(CommonGroupService);

    fixture = TestBed.createComponent(CommonGroupHistoryComponent);
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
    let commonGroupHistorySpy = spyOn(commonGroupService, 'getCommonGroupHistory').and.returnValue(of([historyChange]));

    component.ngOnInit();

    tick();

    expect(component.elementsDataSource.data).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].subjectIdentification).toEqual(commonGroupId);
    expect(component.elementsDataSource.data[0].editor).toEqual(userId);

    expect(commonGroupHistorySpy).toHaveBeenCalled();
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
