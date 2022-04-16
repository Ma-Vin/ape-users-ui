import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { ChangeType, HistoryChange, IHistoryChange } from 'src/app/model/history-change.model';
import { Role } from 'src/app/model/role.model';
import { IUser, User } from 'src/app/model/user.model';
import { AdminService } from 'src/app/services/backend/admin.service';
import { INITIAL_USER_ID_AT_MOCK, UserService } from 'src/app/services/backend/user.service';
import { SelectionService } from 'src/app/services/util/selection.service';

import { UserHistoryComponent } from './user-history.component';

describe('UserHistoryComponent', () => {
  let userService: UserService;
  let adminService: AdminService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let selectionService: SelectionService;

  let component: UserHistoryComponent;
  let fixture: ComponentFixture<UserHistoryComponent>;

  const userId = INITIAL_USER_ID_AT_MOCK;
  const secondUserId = INITIAL_USER_ID_AT_MOCK + "2";
  const firstName = 'Lower';
  const lastName = 'Power';

  const user = User.map({
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

  let historyChange = HistoryChange.map({
    action: undefined,
    changeTime: new Date(2022, 4, 10, 11, 8, 1),
    changeType: ChangeType.CREATE,
    editor: userId,
    subjectIdentification: secondUserId,
    targetIdentification: undefined
  } as IHistoryChange);

  const dialogRef = { close: () => { } } as MatDialogRef<UserHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule, BrowserAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }, { provide: MAT_DIALOG_DATA, useValue: user }],
      declarations: [UserHistoryComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    selectionService = TestBed.inject(SelectionService);
    userService = TestBed.inject(UserService);
    adminService = TestBed.inject(AdminService);

    fixture = TestBed.createComponent(UserHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });



  /**
   * ngOnInit
   */
  it('ngOnInit - normal user', fakeAsync(() => {
    let userHistorySpy = spyOn(userService, 'getUserHistory').and.returnValue(of([historyChange]));
    let adminHistorySpy = spyOn(adminService, 'getAdminHistory').and.returnValue(of([]));

    component.ngOnInit();

    tick();

    expect(component.elementsDataSource.data).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].subjectIdentification).toEqual(secondUserId);
    expect(component.elementsDataSource.data[0].editor).toEqual(userId);

    expect(userHistorySpy).toHaveBeenCalled();
    expect(adminHistorySpy).not.toHaveBeenCalled();
  }));

  it('ngOnInit - admin user', fakeAsync(() => {
    let userHistorySpy = spyOn(userService, 'getUserHistory').and.returnValue(of([]));
    let adminHistorySpy = spyOn(adminService, 'getAdminHistory').and.returnValue(of([historyChange]));
    user.isGlobalAdmin = true;

    component.ngOnInit();

    tick();

    expect(component.elementsDataSource.data).toBeDefined();
    expect(component.elementsDataSource.data.length).toEqual(1);
    expect(component.elementsDataSource.data[0].subjectIdentification).toEqual(secondUserId);
    expect(component.elementsDataSource.data[0].editor).toEqual(userId);

    expect(userHistorySpy).not.toHaveBeenCalled();
    expect(adminHistorySpy).toHaveBeenCalled();
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
