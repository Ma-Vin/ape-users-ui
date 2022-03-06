import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseGroupPermissionsService } from '../permissions/base-group-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class BaseGroupGuardService {

  constructor(private baseGroupPermissionService: BaseGroupPermissionsService) { }

  canActivate(): Observable<boolean> {
    return of(this.baseGroupPermissionService.isAllowedToGetAllBaseGroups() && this.baseGroupPermissionService.isAllowedToGetAllBaseGroupParts());
  }
}
