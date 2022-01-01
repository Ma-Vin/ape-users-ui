import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonGroupPermissionsService } from '../permissions/common-group-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class CommonGroupsGuardService {

  constructor(private commonGroupPermissionsService: CommonGroupPermissionsService) { }


  canActivate(): Observable<boolean> {
    return of(this.commonGroupPermissionsService.isAllowedToGetAllCommonGroup());
  }
}
