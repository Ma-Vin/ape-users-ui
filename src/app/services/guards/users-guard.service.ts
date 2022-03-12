import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserPermissionsService } from '../permissions/user-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class UsersGuardService {

  constructor(private userPermissionsService: UserPermissionsService) { }


  canActivate(): Observable<boolean> {
    return of(this.userPermissionsService.isAllowedToGetAllUsers() && this.userPermissionsService.isAllowedToGetAllUserParts());
  }
}
