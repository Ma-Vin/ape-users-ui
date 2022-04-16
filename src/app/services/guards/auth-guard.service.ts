import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LOGIN_PATH } from '../../app-constants';
import { AuthService } from '../backend/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(public auth: AuthService, public router: Router) { }

  canActivate(): Observable<boolean> {
    return this.auth.hasValidUser().pipe(map(
      data => {
        if (data) {
          console.debug('canActivate: true');
          return true;
        }
        else {
          this.router.navigate([LOGIN_PATH]);
          console.debug('canActivate: false');
          return false;
        }
      })
    );
  }
}
