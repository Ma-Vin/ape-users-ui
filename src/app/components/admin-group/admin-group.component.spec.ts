import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ADMIN_GROUP_PATH } from 'src/app/app-routing.module';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { AdminService } from '../../services/backend/admin.service';
import { SelectionService } from '../../services/util/selection.service';
import { Location, registerLocaleData } from '@angular/common';

import { AdminGroupComponent } from './admin-group.component';
import { User } from 'src/app/model/user.model';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import localeDe from '@angular/common/locales/de';
import { Config } from 'src/app/config/config';
import { AdminGroup } from 'src/app/model/admin-group.model';
import { of } from 'rxjs';
import { ToolbarComponent } from '../toolbar/toolbar.component';

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
      declarations: [AdminGroupComponent, ToolbarComponent]
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
    expect(component.selectedObject.identification).toEqual('');
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherAdmin)).toBeTrue();
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
    expect(component.selectedObject.equals(admin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherAdmin)).toBeTrue();
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
    expect(component.selectedObject.identification).toEqual('');
  }));


  /**
   * applyAllObjectsFilter
   */
  it('applyAllObjectsFilter', () => {
    let filterValue = 'SomeValue';
    let eventTarget = { value: filterValue } as HTMLInputElement;
    let event = { target: eventTarget as EventTarget } as Event;
    component.applyAllObjectsFilter(event);

    expect(component.allObjectsfilterDataSource.filter).toEqual(filterValue.toLocaleLowerCase());
  });


  /**
   * onSelectObject
   */
  it('onSelectObject - non selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })

    component.onSelectObject(admin);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${ADMIN_GROUP_PATH}/${admin.identification}`);

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === admin).toBeFalse();
    expect(component.selectedObject.equals(admin)).toBeTrue();
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - same selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    component.selectedObject = admin;

    component.onSelectObject(admin);

    expect(loactionSpy).not.toHaveBeenCalledOnceWith(`${ADMIN_GROUP_PATH}/${admin.identification}`);

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === admin).toBeFalse();
    expect(component.selectedObject.equals(admin)).toBeTrue();
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - other selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    component.selectedObject = otherAdmin;

    component.onSelectObject(admin);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${ADMIN_GROUP_PATH}/${admin.identification}`);

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === admin).toBeFalse();
    expect(component.selectedObject.equals(admin)).toBeTrue();
    expect(component.disableUpdate).toBeFalse();
  });


  /**
   * isObjectSelected
   */
  it('isObjectSelected - same admin', () => {
    component.selectedObject = admin;
    expect(component.isObjectSelected(admin)).toBeTrue();
  });

  it('isObjectSelected - other admin', () => {
    component.selectedObject = otherAdmin;
    expect(component.isObjectSelected(admin)).toBeFalse();
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
    component.selectedObject = admin;
    expect(component.lastLogin).toEqual('25.10.21, 20:15');
  });

  it('lastLogin - get undefined', () => {
    expect(component.lastLogin).toEqual('');
  });


  /**
   * onCreateObject
   */
  it('onCreateObject', () => {
    component.onCreateObject();

    expect(component.showObjectDetail).toBeTrue();
    expect(component.isNewObject).toBeTrue();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.disableUpdate).toBeFalse();
  });


  /**
   * onAccept
   */
  it('onAccept - create new admin', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherAdmin;
    component.allObjectsfilterDataSource.data = [admin];

    spyOn(selectionService, 'getSelectedAdminGroup').and.returnValue({ identification: adminGroupId } as AdminGroup);
    let createAdminSpy = spyOn(adminService, 'createAdmin').and.returnValue(of(otherAdmin));
    let updateCreatedAdminSpy = spyOn(adminService, 'updateAdmin').and.returnValue(of(otherAdmin));

    component.onAccept();

    tick();

    expect(createAdminSpy).toHaveBeenCalled;
    expect(updateCreatedAdminSpy).toHaveBeenCalled;
    expect(component.selectedObject === otherAdmin).toBeFalse();
    expect(component.selectedObject.equals(otherAdmin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherAdmin)).toBeTrue();
  }));

  it('onAccept - create new admin, but missing admin group', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherAdmin;
    component.allObjectsfilterDataSource.data = [admin];

    spyOn(selectionService, 'getSelectedAdminGroup').and.returnValue(undefined);
    let createAdminSpy = spyOn(adminService, 'createAdmin').and.returnValue(of(otherAdmin));
    let updateCreatedAdminSpy = spyOn(adminService, 'updateAdmin').and.returnValue(of(otherAdmin));
    try {
      component.onAccept();
    } catch (error) {
      expect((error as Error).message).toEqual('There should be any admin group where to add new admin');
    }

    tick();

    expect(createAdminSpy).not.toHaveBeenCalled;
    expect(updateCreatedAdminSpy).not.toHaveBeenCalled;
    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
  }));

  it('onAccept - update existing admin', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedUser = User.map(otherAdmin);
    modfiedUser.firstName = modfiedUser.firstName.concat('_');
    component.selectedObject = modfiedUser;
    component.allObjectsfilterDataSource.data = [admin, otherAdmin];

    spyOn(selectionService, 'getSelectedAdminGroup').and.returnValue({ identification: adminGroupId } as AdminGroup);
    let updateAdminSpy = spyOn(adminService, 'updateAdmin').and.returnValue(of(modfiedUser));

    component.onAccept();

    tick();

    expect(updateAdminSpy).toHaveBeenCalled;
    expect(component.selectedObject === modfiedUser).toBeFalse();
    expect(component.selectedObject.equals(modfiedUser)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(modfiedUser)).toBeTrue();
  }));

  it('onAccept - accept disabled', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedUser = User.map(otherAdmin);
    modfiedUser.firstName = '';
    component.selectedObject = modfiedUser;
    component.allObjectsfilterDataSource.data = [admin, otherAdmin];

    spyOn(selectionService, 'getSelectedAdminGroup').and.returnValue({ identification: adminGroupId } as AdminGroup);
    let updateAdminSpy = spyOn(adminService, 'updateAdmin').and.returnValue(of(modfiedUser));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.onAccept();

    tick();

    expect(updateAdminSpy).not.toHaveBeenCalled;
    expect(openMessage).toHaveBeenCalled();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));



  /**
   * onAcceptCallBack
   */
  it('onAcceptCallBack - create new admin', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherAdmin;
    component.allObjectsfilterDataSource.data = [admin];

    spyOn(selectionService, 'getSelectedAdminGroup').and.returnValue({ identification: adminGroupId } as AdminGroup);
    let createAdminSpy = spyOn(adminService, 'createAdmin').and.returnValue(of(otherAdmin));
    let updateCreatedAdminSpy = spyOn(adminService, 'updateAdmin').and.returnValue(of(otherAdmin));

    component.onAcceptCallBack();

    tick();

    expect(createAdminSpy).toHaveBeenCalled;
    expect(updateCreatedAdminSpy).toHaveBeenCalled;
    expect(component.selectedObject === otherAdmin).toBeFalse();
    expect(component.selectedObject.equals(otherAdmin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherAdmin)).toBeTrue();
  }));



  /**
   * onCancel
   */
  it('onCancel', () => {
    component.onCancel();

    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
  });



  /**
   * onCancelCallBack
   */
  it('onCancelCallBack', () => {
    component.onCancelCallBack();

    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
  });



  /**
   * onDelete
   */
  it('onDelete - delete successful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [admin, otherAdmin];
    spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    let deleteAdminSpy = spyOn(adminService, 'deleteAdmin').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedObject = otherAdmin;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteAdminSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();


    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
  }));

  it('onDelete - delete unsuccessful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [admin, otherAdmin];
    spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    let deleteAdminSpy = spyOn(adminService, 'deleteAdmin').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedObject = otherAdmin;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteAdminSpy).toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);

    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherAdmin)).toBeTrue();
  }));

  it('onDelete - delete disabled', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [admin, otherAdmin];
    spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    let deleteAdminSpy = spyOn(adminService, 'deleteAdmin').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.selectedObject = admin;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteAdminSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherAdmin)).toBeTrue();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));



  /**
   * onDeleteCallBack
   */
  it('onDeleteCallBack - delete successful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [admin, otherAdmin];
    spyOn(selectionService, 'getActiveUser').and.returnValue(admin);
    let deleteAdminSpy = spyOn(adminService, 'deleteAdmin').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedObject = otherAdmin;
    component.showObjectDetail = true;
    component.isNewObject = false;

    component.onDeleteCallBack();

    tick();

    expect(deleteAdminSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();


    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(admin)).toBeTrue();
  }));



  /**
   * disableAccept/Callback
   */
  it('disableAccept - new admin', () => {
    component.isNewObject = true;
    component.selectedObject = admin;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - new admin, but missing firstName', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: adminId,
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - new admin, but empty firstName', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: adminId,
      firstName: '',
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - new admin, but missing lastName', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: adminId,
      firstName: firstName
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - new admin, but empty lastName', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: adminId,
      firstName: firstName,
      lastName: ''
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing admin', () => {
    component.isNewObject = false;
    component.selectedObject = admin;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - existing admin, but not modified', () => {
    component.onSelectObject(admin);
    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing admin, but missing firstName', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: adminId,
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing admin, but empty firstName', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: adminId,
      firstName: '',
      lastName: lastName
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing admin, but missing lastName', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: adminId,
      firstName: firstName
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing admin, but empty lastName', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: adminId,
      firstName: firstName,
      lastName: ''
    } as User

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });



  /**
   * disableCreateObject
   */
  it('disableCreateObject - creating a user is allowed', () => {
    expect(component.disableCreateObject()).toBeFalse();
  });



  /**
   * disableDelete/CAllback
   */
  it('disableDelete - not new and other', () => {
    component.isNewObject = false;
    component.selectedObject = admin;
    spyOn(selectionService, 'getActiveUser').and.returnValue(otherAdmin);

    expect(component.disableDelete()).toBeFalse();
    expect(component.disableDeleteCallBack()).toBeFalse();
  });

  it('disableDelete - undefined active user', () => {
    component.isNewObject = false;
    component.selectedObject = admin;
    spyOn(selectionService, 'getActiveUser').and.returnValue(undefined);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
  });

  it('disableDelete - new admin', () => {
    component.isNewObject = true;
    component.selectedObject = admin;
    spyOn(selectionService, 'getActiveUser').and.returnValue(otherAdmin);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
  });

  it('disableDelete - active user', () => {
    component.isNewObject = false;
    component.selectedObject = admin;
    spyOn(selectionService, 'getActiveUser').and.returnValue(admin);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
  });

});
