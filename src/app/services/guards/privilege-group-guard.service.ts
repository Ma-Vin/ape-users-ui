import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PrivilegeGroupPermissionsService } from '../permissions/privilege-group-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeGroupGuardService {

  constructor(private privilegeGroupPermissionService: PrivilegeGroupPermissionsService) { }

  canActivate(): Observable<boolean> {
    return of(this.privilegeGroupPermissionService.isAllowedToGetAllPrivilegeGroups() && this.privilegeGroupPermissionService.isAllowedToGetAllPrivilegeGroupParts());
  }
}
