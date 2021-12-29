import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AppRoutingModule, LOGIN_PATH } from '../../app-routing.module';
import { ConfigService } from '../../config/config.service';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from '../backend/auth.service';
import { CryptoService } from '../util/crypto.service';

describe('AuthGuardService', () => {
  let service: AuthGuardService;
  let authService: AuthService;
  let configService: ConfigService;
  let cryptoService: CryptoService;
  let router: Router;
  let httpMock: HttpTestingController;
  let http: HttpClient;


  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AppRoutingModule, HttpClientTestingModule, AppRoutingModule] });
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
    cryptoService = TestBed.inject(CryptoService);
    authService = TestBed.inject(AuthService);
    service = TestBed.inject(AuthGuardService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('canActivate - invalid user', fakeAsync(() => {
    let authServiceSpy = spyOn(authService, 'hasValidUser').and.callFake(() => of(false));
    let routerSpy = spyOn(router, 'navigate').and.callFake(() => new Promise<boolean>((resolve, reject) => resolve(true)));

    service.canActivate().subscribe(data => expect(data).toBeFalse());

    expect(authServiceSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledOnceWith([LOGIN_PATH]);

    tick();
  }));


  it('canActivate - valid user', fakeAsync(() => {
    let authServiceSpy = spyOn(authService, 'hasValidUser').and.callFake(() => of(true));
    let routerSpy = spyOn(router, 'navigate').and.callFake(() => new Promise<boolean>((resolve, reject) => resolve(true)));

    service.canActivate().subscribe(data => expect(data).toBeTrue());

    expect(authServiceSpy).toHaveBeenCalled();
    expect(routerSpy).not.toHaveBeenCalledWith([LOGIN_PATH]);

    tick();
  }));
});
