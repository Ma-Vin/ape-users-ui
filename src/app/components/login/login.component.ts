import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { USERS_ABS_PATH } from 'src/app/app-constants';
import { AuthService } from '../../services/backend/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted = false;
  returnUrl: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authenticationService: AuthService,
  ) {
    this.returnUrl = USERS_ABS_PATH;
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.authenticationService.hasValidUser().subscribe(data => {
      if (data) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.authenticationService.loginAndRedirect(this.f.username.value, this.f.password.value, this.returnUrl);
  }


}
