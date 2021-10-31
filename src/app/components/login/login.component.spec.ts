import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AppRoutingModule } from '../../app-routing.module';
import { MaterialModule } from '../../material/material.module';
import { AuthService } from '../../services/auth.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let authenticationService: AuthService;
  let formBuilder: FormBuilder;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AppRoutingModule, FormsModule, ReactiveFormsModule, MaterialModule, BrowserAnimationsModule],
      declarations: [LoginComponent]
    })
      .compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authenticationService = TestBed.inject(AuthService);
    formBuilder = TestBed.inject(FormBuilder);
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('onSubmit - valid', () => {
    let spy = spyOn(authenticationService, 'loginAndRedirect').and.callFake((username: string, password: string, redirect: string) => { })
    component.loginForm.controls['username'].setValue('user');
    component.loginForm.controls['password'].setValue('pwd');
    component.onSubmit();

    expect(spy).toHaveBeenCalled();
  });


  it('onSubmit - invalid', () => {
    let spy = spyOn(authenticationService, 'loginAndRedirect').and.callFake((username: string, password: string, redirect: string) => { })
    component.loginForm.controls['username'].setValue(null);
    component.loginForm.controls['password'].setValue(null);
    component.onSubmit();

    expect(spy).not.toHaveBeenCalled();
  });
});
