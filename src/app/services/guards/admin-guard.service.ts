import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminPermissionsService } from '../permissions/admin-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService {

  constructor(private adminPermissionsService: AdminPermissionsService) { }

  canActivate(): Observable<boolean> {
    return of(this.adminPermissionsService.isAllowedToUseAnyMethod());
  }
}
