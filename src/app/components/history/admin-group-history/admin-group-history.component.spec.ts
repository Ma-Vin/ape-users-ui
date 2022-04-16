import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { AdminGroup } from 'src/app/model/admin-group.model';
import { ChangeType, HistoryChange, IHistoryChange } from 'src/app/model/history-change.model';
import { AdminService } from 'src/app/services/backend/admin.service';

import { AdminGroupHistoryComponent } from './admin-group-history.component';

describe('AdminGroupHistoryComponent', () => {
  let adminService: AdminService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  let component: AdminGroupHistoryComponent;
  let fixture: ComponentFixture<AdminGroupHistoryComponent>;

  const adminGroupId = 'AGAA00001';
  const adminId = 'UAA00001';
  const adminGroupName = 'Name of the group';

  let adminGroup = AdminGroup.map({
    description: 'some description',
    groupName: adminGroupName,
    identification: adminGroupId,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    isComplete: true
  });

  let groupHistoryChange = HistoryChange.map({
    action: undefined,
    changeTime: new Date(2022, 4, 10, 11, 8, 1),
    changeType: ChangeType.CREATE,
    editor: adminId,
    subjectIdentification: adminGroupId,
    targetIdentification: undefined
  } as IHistoryChange);

  const dialogRef = { close: () => { } } as MatDialogRef<AdminGroupHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }, { provide: MAT_DIALOG_DATA, useValue: adminGroup }],
      declarations: [AdminGroupHistoryComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);

    fixture = TestBed.createComponent(AdminGroupHistoryComponent);
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
    let adminGroupHistorySpy = spyOn(adminService, 'getAdminGroupHistory').and.returnValue(of([groupHistoryChange]));

    component.ngOnInit();

    tick();

    expect(component.elementsDataSource.data).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].subjectIdentification).toEqual(adminGroupId);
    expect(component.elementsDataSource.data[0].editor).toEqual(adminId);

    expect(adminGroupHistorySpy).toHaveBeenCalled();
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
