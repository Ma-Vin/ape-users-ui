import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ADMIN_GROUP_PATH } from 'src/app/app-routing.module';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { AdminService } from 'src/app/services/admin.service';
import { SelectionService } from 'src/app/services/selection.service';
import { Location, registerLocaleData } from '@angular/common';

import { AdminGroupComponent } from './admin-group.component';
import { User } from 'src/app/model/user.model';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import localeDe from '@angular/common/locales/de';
import { Config } from 'src/app/config/config';
import { AdminGroup } from 'src/app/model/admin-group.model';
import { of } from 'rxjs';

registerLocaleData(localeDe);

describe('AdminGroupComponent', () => {
  let component: AdminGroupComponent;
  let fixture: ComponentFixture<AdminGroupComponent>;

  let httpMock: HttpTestingController;
  let http: HttpClient;
  let configService: ConfigService;
  let selectionService: SelectionService;
  let adminService: AdminService;
  let route: ActivatedRoute;
  let location: Location;
  let snackBar: MatSnackBar;


  const adminGroupId = 'AGAA00001';
  const adminId = 'UAA00001';
  const otherAdminId = 'UAA00002';
  const firstName = 'Max';
  const lastName = 'Power';

  const mockConfig: Config =
  {
    clientId: 'ape.user.ui',
    clientSecret: 'changeIt',
    backendBaseUrl: '//localhost:8080',
    adminGroupId: adminGroupId
  };

  const admin = User.map({
    identification: adminId,
    firstName: firstName,
    lastName: lastName,
    mail: 'max.power@ma-vin.de',
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    isGlobalAdmin: true
  } as User);

  const otherAdmin = User.map({
    identification: otherAdminId,
    firstName: firstName,
    lastName: lastName,
    mail: 'max.power@ma-vin.de',
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    isGlobalAdmin: true
  } as User);


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: ADMIN_GROUP_PATH, component: AdminGroupComponent }]), MaterialModule, BrowserAnimationsModule],
      providers: [{ provide: MAT_DATE_LOCALE, useValue: 'de' }],
      declarations: [AdminGroupComponent]
    })
      .compileComponents();
  });


  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient)
    configService = TestBed.inject(ConfigService);
    selectionService = TestBed.inject(SelectionService);
    adminService = TestBed.inject(AdminService);
    route = TestBed.inject(ActivatedRoute);
    location = TestBed.inject(Location);
    snackBar = TestBed.inject(MatSnackBar);

    fixture = TestBed.createComponent(AdminGroupComponent);
    component = fixture.componentInstance;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  /**
   * ngOnInit
   */
  it('ngOnInit - without id at route', fakeAsync(() => {
    spyOn(configService, 'getConfig').and.returnValue(mockConfig);
    spyOn(adminService, 'getAdminGroup').and.returnValue(of({ identification: adminGroupId } as AdminGroup));
    let getAllAdminsSpy = spyOn(adminService, 'getAllAdmins').and.returnValue(of([otherAdmin, admin]));
    let setSelectedAdminGroupSpy = spyOn(selectionService, 'setSelectedAdminGroup');

    component.ngOnInit();

    tick()

    expect(getAllAdminsSpy).toHaveBeenCalled();
    expect(setSelectedAdminGroupSpy).toHaveBeenCalled();
    expect(component.selectedAdmin.identification).toEqual('NotValidIdentification');
    expect(component.allAdminsfilterDataSource.data.length).toEqual(2);
    expect(component.allAdminsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allAdminsfilterDataSource.data.includes(otherAdmin)).toBeTrue();
  }));

  it('ngOnInit - with id at route', fakeAsync(() => {
    spyOn(configService, 'getConfig').and.returnValue(mockConfig);
    spyOn(adminService, 'getAdminGroup').and.returnValue(of({ identification: adminGroupId } as AdminGroup));
    let getAllAdminsSpy = spyOn(adminService, 'getAllAdmins').and.returnValue(of([otherAdmin, admin]));
    let setSelectedAdminGroupSpy = spyOn(selectionService, 'setSelectedAdminGroup');

    spyOn(route.snapshot.paramMap, 'has').and.returnValue(true);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(adminId);

    component.ngOnInit();

    tick()

    expect(getAllAdminsSpy).toHaveBeenCalled();
    expect(setSelectedAdminGroupSpy).toHaveBeenCalled();
    expect(component.selectedAdmin.equals(admin)).toBeTrue();
    expect(component.allAdminsfilterDataSource.data.length).toEqual(2);
    expect(component.allAdminsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allAdminsfilterDataSource.data.includes(otherAdmin)).toBeTrue();
  }));

  it('ngOnInit - missing config', fakeAsync(() => {
    spyOn(adminService, 'getAdminGroup').and.returnValue(of({ identification: adminGroupId } as AdminGroup));
    let getAllAdminsSpy = spyOn(adminService, 'getAllAdmins').and.returnValue(of([otherAdmin, admin]));
    let setSelectedAdminGroupSpy = spyOn(selectionService, 'setSelectedAdminGroup');

    spyOn(configService, 'getConfig').and.returnValue(undefined);

    component.ngOnInit();

    tick()

    expect(getAllAdminsSpy).toHaveBeenCalled();
    expect(setSelectedAdminGroupSpy).not.toHaveBeenCalled();
    expect(component.selectedAdmin.identification).toEqual('NotValidIdentification');
  }));


  /**
   * applyAllAdminsFilter
   */
  it('applyAllAdminsFilter', () => {
    let filterValue = 'SomeValue';
    let eventTarget = { value: filterValue } as HTMLInputElement;
    let event = { target: eventTarget as EventTarget } as Event;
    component.applyAllAdminsFilter(event);

    expect(component.allAdminsfilterDataSource.filter).toEqual(filterValue.toLocaleLowerCase());
  });


  /**
   * onSelectAdmin
   */
  it('onSelectAdmin - non selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })

    component.onSelectAdmin(admin);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${ADMIN_GROUP_PATH}/${admin.identification}`);

    expect(component.isNewAdmin).toBeFalse();
    expect(component.showAdminDetail).toBeTrue();
    expect(component.selectedAdmin === admin).toBeFalse();
    expect(component.selectedAdmin.equals(admin)).toBeTrue();
  });

  it('onSelectAdmin - same selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    component.selectedAdmin = admin;

    component.onSelectAdmin(admin);

    expect(loactionSpy).not.toHaveBeenCalledOnceWith(`${ADMIN_GROUP_PATH}/${admin.identification}`);

    expect(component.isNewAdmin).toBeFalse();
    expect(component.showAdminDetail).toBeTrue();
    expect(component.selectedAdmin === admin).toBeFalse();
    expect(component.selectedAdmin.equals(admin)).toBeTrue();
  });

  it('onSelectAdmin - other selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    component.selectedAdmin = otherAdmin;

    component.onSelectAdmin(admin);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${ADMIN_GROUP_PATH}/${admin.identification}`);

    expect(component.isNewAdmin).toBeFalse();
    expect(component.showAdminDetail).toBeTrue();
    expect(component.selectedAdmin === admin).toBeFalse();
    expect(component.selectedAdmin.equals(admin)).toBeTrue();
  });


  /**
   * onSelectAdmin
   */
  it('isAdminSelected - same admin', () => {
    component.selectedAdmin = admin;
    expect(component.isAdminSelected(admin)).toBeTrue();
  });

  it('isAdminSelected - other admin', () => {
    component.selectedAdmin = otherAdmin;
    expect(component.isAdminSelected(admin)).toBeFalse();
  });


  /**
   * lastLogin
   */
  it('lastLogin - set', () => {
    try {
      component.lastLogin = '25.10.21, 20:15';
    } catch (error) {
      expect((error as Error).message).toEqual(`lastLogin was tried to be set: value=25.10.21, 20:15`);
      return;
    }
    fail('Error should occur');
  });

  it('lastLogin - get', () => {
    component.selectedAdmin = admin;
    expect(component.lastLogin).toEqual('25.10.21, 20:15');
  });

  it('lastLogin - get undefined', () => {
    expect(component.lastLogin).toEqual('');
  });


  /**
   * onCreateAdmin
   */
  it('onCreateAdmin', () => {
    component.onCreateAdmin();

    expect(component.showAdminDetail).toBeTrue();
    expect(component.isNewAdmin).toBeTrue();
    expect(component.selectedAdmin).toBeTruthy();
    expect(component.selectedAdmin.identification).not.toBeDefined();
  });


  /**
   * onAccept
   */
  it('onAccept - create new admin', fakeAsync(() => {
    component.showAdminDetail = true;
    component.isNewAdmin = true;
    component.selectedAdmin = otherAdmin;
    component.allAdminsfilterDataSource.data = [admin];

    spyOn(selectionService, 'getSelectedAdminGroup').and.returnValue({ identification: adminGroupId } as AdminGroup);
    let createAdminSpy = spyOn(adminService, 'createAdmin').and.returnValue(of(otherAdmin));

    component.onAccept();

    tick();

    expect(createAdminSpy).toHaveBeenCalled;
    expect(component.selectedAdmin === otherAdmin).toBeFalse();
    expect(component.selectedAdmin.equals(otherAdmin)).toBeTrue();
    expect(component.allAdminsfilterDataSource.data.length).toEqual(2);
    expect(component.allAdminsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allAdminsfilterDataSource.data.includes(otherAdmin)).toBeTrue();
  }));

  it('onAccept - create new admin, but missing admin group', fakeAsync(() => {
    component.showAdminDetail = true;
    component.isNewAdmin = true;
    component.selectedAdmin = otherAdmin;
    component.allAdminsfilterDataSource.data = [admin];

    spyOn(selectionService, 'getSelectedAdminGroup').and.returnValue(undefined);
    let createAdminSpy = spyOn(adminService, 'createAdmin').and.returnValue(of(otherAdmin));
    try {
      component.onAccept();
    } catch (error) {
      expect((error as Error).message).toEqual('There should be any admin group where to add new admin');
    }

    tick();

    expect(createAdminSpy).not.toHaveBeenCalled;
    expect(component.allAdminsfilterDataSource.data.length).toEqual(1);
    expect(component.allAdminsfilterDataSource.data.includes(admin)).toBeTrue();
  }));

  it('onAccept - update existing admin', fakeAsync(() => {
    component.showAdminDetail = true;
    component.isNewAdmin = false;
    let modfiedUser = User.map(otherAdmin);
    modfiedUser.firstName = modfiedUser.firstName.concat('_');
    component.selectedAdmin = modfiedUser;
    component.allAdminsfilterDataSource.data = [admin, otherAdmin];

    spyOn(selectionService, 'getSelectedAdminGroup').and.returnValue({ identification: adminGroupId } as AdminGroup);
    let updateAdminSpy = spyOn(adminService, 'updateAdmin').and.returnValue(of(modfiedUser));

    component.onAccept();

    tick();

    expect(updateAdminSpy).toHaveBeenCalled;
    expect(component.selectedAdmin === modfiedUser).toBeFalse();
    expect(component.selectedAdmin.equals(modfiedUser)).toBeTrue();
    expect(component.allAdminsfilterDataSource.data.length).toEqual(2);
    expect(component.allAdminsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allAdminsfilterDataSource.data.includes(modfiedUser)).toBeTrue();
  }));

  it('onAccept - accept disabled', fakeAsync(() => {
    component.showAdminDetail = true;
    component.isNewAdmin = false;
    let modfiedUser = User.map(otherAdmin);
    modfiedUser.firstName = '';
    component.selectedAdmin = modfiedUser;
    component.allAdminsfilterDataSource.data = [admin, otherAdmin];

    spyOn(selectionService, 'getSelectedAdminGroup').and.returnValue({ identification: adminGroupId } as AdminGroup);
    let updateAdminSpy = spyOn(adminService, 'updateAdmin').and.returnValue(of(modfiedUser));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.onAccept();

    tick();

    expect(updateAdminSpy).not.toHaveBeenCalled;
    expect(openMessage).toHaveBeenCalled();

    expect(component.selectedAdmin.identification).toEqual('NotValidIdentification');
    expect(component.showAdminDetail).toBeFalse();
    expect(component.isNewAdmin).toBeFalse();
  }));


  /**
   * onCancel
   */
  it('onCancel', () => {
    component.onCancel();

    expect(component.showAdminDetail).toBeFalse();
    expect(component.isNewAdmin).toBeFalse();
    expect(component.selectedAdmin).toBeTruthy();
    expect(component.selectedAdmin.identification).toEqual('NotValidIdentification');
  });


  /**
   * onDelete
   */
  it('onDelete - delete successful', fakeAsync(() => {
    component.allAdminsfilterDataSource.data = [admin, otherAdmin];
    spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    let deleteAdminSpy = spyOn(adminService, 'deleteAdmin').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedAdmin = otherAdmin;
    component.showAdminDetail = true;
    component.isNewAdmin = false;
    component.onDelete();

    tick();

    expect(deleteAdminSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();


    expect(component.allAdminsfilterDataSource.data.length).toEqual(1);
    expect(component.allAdminsfilterDataSource.data.includes(admin)).toBeTrue();
  }));

  it('onDelete - delete unsuccessful', fakeAsync(() => {
    component.allAdminsfilterDataSource.data = [admin, otherAdmin];
    spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    let deleteAdminSpy = spyOn(adminService, 'deleteAdmin').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedAdmin = otherAdmin;
    component.showAdminDetail = true;
    component.isNewAdmin = false;
    component.onDelete();

    tick();

    expect(deleteAdminSpy).toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();

    expect(component.allAdminsfilterDataSource.data.length).toEqual(2);

    expect(component.allAdminsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allAdminsfilterDataSource.data.includes(otherAdmin)).toBeTrue();
  }));

  it('onDelete - delete disabled', fakeAsync(() => {
    component.allAdminsfilterDataSource.data = [admin, otherAdmin];
    spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    let deleteAdminSpy = spyOn(adminService, 'deleteAdmin').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.selectedAdmin = admin;
    component.showAdminDetail = true;
    component.isNewAdmin = false;
    component.onDelete();

    tick();

    expect(deleteAdminSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();

    expect(component.allAdminsfilterDataSource.data.length).toEqual(2);
    expect(component.allAdminsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allAdminsfilterDataSource.data.includes(otherAdmin)).toBeTrue();

    expect(component.selectedAdmin.identification).toEqual('NotValidIdentification');
    expect(component.showAdminDetail).toBeFalse();
    expect(component.isNewAdmin).toBeFalse();
  }));


  /**
   * disableAccept
   */
  it('disableAccept - new admin', () => {
    component.isNewAdmin = true;
    component.selectedAdmin = admin;

    expect(component.disableAccept()).toBeFalse();
  });

  it('disableAccept - new admin, but missing firstName', () => {
    component.isNewAdmin = true;
    component.selectedAdmin = {
      identification: adminId,
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - new admin, but empty firstName', () => {
    component.isNewAdmin = true;
    component.selectedAdmin = {
      identification: adminId,
      firstName: '',
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - new admin, but missing lastName', () => {
    component.isNewAdmin = true;
    component.selectedAdmin = {
      identification: adminId,
      firstName: firstName
    } as User

    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - new admin, but empty lastName', () => {
    component.isNewAdmin = true;
    component.selectedAdmin = {
      identification: adminId,
      firstName: firstName,
      lastName: ''
    } as User

    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - existing admin', () => {
    component.isNewAdmin = false;
    component.selectedAdmin = admin;

    expect(component.disableAccept()).toBeFalse();
  });

  it('disableAccept - existing admin, but not modified', () => {
    component.onSelectAdmin(admin);
    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - existing admin, but missing firstName', () => {
    component.isNewAdmin = false;
    component.selectedAdmin = {
      identification: adminId,
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - existing admin, but empty firstName', () => {
    component.isNewAdmin = false;
    component.selectedAdmin = {
      identification: adminId,
      firstName: '',
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - existing admin, but missing lastName', () => {
    component.isNewAdmin = false;
    component.selectedAdmin = {
      identification: adminId,
      firstName: firstName
    } as User

    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - existing admin, but empty lastName', () => {
    component.isNewAdmin = false;
    component.selectedAdmin = {
      identification: adminId,
      firstName: firstName,
      lastName: ''
    } as User

    expect(component.disableAccept()).toBeTrue();
  });


  /**
   * disableDelete
   */
  it('disableDelete - not new and other', () => {
    component.isNewAdmin = false;
    component.selectedAdmin = admin;
    spyOn(selectionService, 'getActiveUser').and.returnValue(otherAdmin);

    expect(component.disableDelete()).toBeFalse();
  });

  it('disableDelete - undefined active user', () => {
    component.isNewAdmin = false;
    component.selectedAdmin = admin;
    spyOn(selectionService, 'getActiveUser').and.returnValue(undefined);

    expect(component.disableDelete()).toBeTrue();
  });

  it('disableDelete - new admin', () => {
    component.isNewAdmin = true;
    component.selectedAdmin = admin;
    spyOn(selectionService, 'getActiveUser').and.returnValue(otherAdmin);

    expect(component.disableDelete()).toBeTrue();
  });

  it('disableDelete - active user', () => {
    component.isNewAdmin = false;
    component.selectedAdmin = admin;
    spyOn(selectionService, 'getActiveUser').and.returnValue(admin);

    expect(component.disableDelete()).toBeTrue();
  });

});
