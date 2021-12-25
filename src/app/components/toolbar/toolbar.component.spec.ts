import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { User } from 'src/app/model/user.model';
import { AdminService } from 'src/app/services/admin.service';
import { CommonGroupService } from 'src/app/services/common-group.service';
import { SelectionService } from 'src/app/services/selection.service';
import { UserService } from 'src/app/services/user.service';
import { ToolbarSite } from './toolbar-site';

import { ToolbarComponent } from './toolbar.component';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let selectionService: SelectionService;
  let adminService: AdminService;
  let userService: UserService;
  let commonGroupService: CommonGroupService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  let fixture: ComponentFixture<ToolbarComponent>;


  const user = User.map({
    identification: '',
    firstName: 'Max',
    lastName: 'Power',
    mail: 'max.power@ma-vin.de',
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    isGlobalAdmin: false
  } as User);


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule],
      declarations: [ToolbarComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    commonGroupService = TestBed.inject(CommonGroupService);
    selectionService = TestBed.inject(SelectionService);

    component = fixture.componentInstance;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });



  /**
   * ngOnInit
   */
  it('ngOnInit - active user', () => {
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(user);

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeFalse();
    expect(component.iconName).toEqual('add_box');
  });

  it('ngOnInit - active admin', () => {
    let admin = User.map(user);
    admin.isGlobalAdmin = true;
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(admin);

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeTrue();
    expect(component.iconName).toEqual('add_box');
  });

  it('ngOnInit - neither active user nor admin', () => {
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(undefined);

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeFalse();
    expect(component.iconName).toEqual('add_box');
  });

  it('ngOnInit - admin site', () => {
    let admin = User.map(user);
    admin.isGlobalAdmin = true;
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    component.activeSite = ToolbarSite.ADMINS;

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeTrue();
    expect(component.iconName).toEqual('add_moderator');
  });

  it('ngOnInit - common groups site', () => {
    let admin = User.map(user);
    admin.isGlobalAdmin = true;
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    component.activeSite = ToolbarSite.COMMON_GROUPS;

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeTrue();
    expect(component.iconName).toEqual('domain_add');
  });

  it('ngOnInit - users site', () => {
    let getActiveUserSpy = spyOn(selectionService, 'getActiveUser').and.returnValue(user);
    component.activeSite = ToolbarSite.USERS;

    component.ngOnInit();

    expect(getActiveUserSpy).toHaveBeenCalled();
    expect(component.showAdminItems).toBeFalse();
    expect(component.iconName).toEqual('person_add');
  });



  /**
   * onCreateObject
   */
  it('onCreateObject - event should occur', () => {
    let emitSpy = spyOn(component.onCreateObjectEventEmitter, 'emit');

    component.onCreateObject();

    expect(emitSpy).toHaveBeenCalled();
  });
});
