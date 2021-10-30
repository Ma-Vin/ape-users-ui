import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Config } from '../config/config';
import { ConfigService } from '../config/config.service';
import { ResponseWrapper } from '../model/response-wrapper';
import { Status } from '../model/status.model';
import { IUser } from '../model/user.model';
import { RETRIES } from './base.service';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let configService: ConfigService;
  let httpMock: HttpTestingController;
  let http: HttpClient;


  const userId = 'UAA00001';
  const firstName = 'Max';
  const lastName = 'Power';

  const mockConfig: Config =
  {
    clientId: 'ape.user.ui',
    clientSecret: 'changeIt',
    backendBaseUrl: '//localhost:8080'
  };

  const mockIUser: IUser = {
    identification: userId,
    firstName: firstName,
    lastName: lastName,
    mail: 'max.power@ma-vin.de',
    image: undefined,
    smallImage: undefined,
    lastLogin: new Date(2021, 9, 25, 20, 15, 1),
    validFrom: new Date(2021, 9, 1),
    validTo: undefined
  }

  const mockErrorResponseWrapper: ResponseWrapper = {
    response: undefined,
    status: Status.ERROR,
    messages: [{ time: new Date(2021, 9, 25, 20, 15), order: 1, messageText: 'Some error text', status: Status.ERROR }]
  }

  const mockFatalResponseWrapper: ResponseWrapper = {
    response: undefined,
    status: Status.FATAL,
    messages: [{ time: new Date(2021, 9, 25, 20, 15), order: 1, messageText: 'Some error text', status: Status.FATAL }]
  }



  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    service = TestBed.inject(UserService);

    spyOn(configService, 'getConfig').and.returnValue(mockConfig);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('getUser - all ok', fakeAsync(() => {
    let mockResponseWrapper: ResponseWrapper = {
      response: mockIUser,
      status: Status.OK,
      messages: []
    }

    service.getUser(userId).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.identification).toEqual(mockIUser.identification);
      expect(data.firstName).toEqual(mockIUser.firstName);
      expect(data.lastName).toEqual(mockIUser.lastName);
      expect(data.image).toBeUndefined();
      expect(data.smallImage).toBeUndefined();
      expect(data.lastLogin).toEqual(mockIUser.lastLogin);
      expect(data.validFrom).toEqual(mockIUser.validFrom);
      expect(data.validTo).toBeUndefined();
    });

    const req = httpMock.expectOne(`//localhost:8080/user/getUser/${userId}`);
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponseWrapper);

    // No retry after success
    httpMock.expectNone(`//localhost:8080/user/getUser/${userId}`);

    tick();
  }));


  it('getUser - with error status', fakeAsync(() => {
    service.getUser(userId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getUser/${userId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockErrorResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getUser/${userId}`);

    tick();
  }));


  it('getUser - with fatal status', fakeAsync(() => {
    service.getUser(userId).subscribe(
      data => { expect(data).toBeFalsy(); }
      , e => {
        expect(e).toBeTruthy();
        expect(e.message).toEqual('Some error text');
      });

    for (let i = 0; i < RETRIES + 1; i++) {
      let req = httpMock.expectOne(`//localhost:8080/user/getUser/${userId}`);
      expect(req.request.method).toEqual("GET");
      req.flush(mockFatalResponseWrapper);
    }

    // No retry anymore
    httpMock.expectNone(`//localhost:8080/user/getUser/${userId}`);

    tick();
  }));
});
