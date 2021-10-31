import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ConfigService } from 'src/app/config/config.service';
import { User } from 'src/app/model/user.model';
import { AdminService } from 'src/app/services/admin.service';
import { SelectionService } from 'src/app/services/selection.service';
import { UserService } from 'src/app/services/user.service';

import { AdminGroupGuardService } from './admin-group-guard.service';

describe('AdminGroupGuardService', () => {
  let service: AdminGroupGuardService;
  let adminService: AdminService;
  let userService: UserService;
  let selectionService: SelectionService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  let selectionServiceSpy: jasmine.Spy<() => User | undefined>;

  const userId = 'UAA00001';
  const firstName = 'Max';
  const lastName = 'Power';


  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    adminService = TestBed.inject(AdminService);
    userService = TestBed.inject(UserService);
    selectionService = TestBed.inject(SelectionService);

    service = TestBed.inject(AdminGroupGuardService);

    selectionServiceSpy = spyOn(selectionService, 'getActiveUser');
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('canActivate - is global admin', fakeAsync(() => {
    selectionServiceSpy.and.returnValue({
      identification: userId,
      firstName: firstName,
      lastName: lastName,
      mail: `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}@ma-vin.de`,
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: true
    } as User);

    service.canActivate().subscribe(data => expect(data).toBeTrue());

    expect(selectionServiceSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - is not global admin', fakeAsync(() => {
    selectionServiceSpy.and.returnValue({
      identification: userId,
      firstName: firstName,
      lastName: lastName,
      mail: `${firstName.toLocaleLowerCase()}.${lastName.toLocaleLowerCase()}@ma-vin.de`,
      image: undefined,
      smallImage: undefined,
      lastLogin: new Date(2021, 9, 25, 20, 15, 1),
      validFrom: new Date(2021, 9, 1),
      validTo: undefined,
      isGlobalAdmin: false
    } as User);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(selectionServiceSpy).toHaveBeenCalled();

    tick();
  }));


  it('canActivate - no active user', fakeAsync(() => {
    selectionServiceSpy.and.returnValue(undefined);

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(selectionServiceSpy).toHaveBeenCalled();

    tick();
  }));
});
