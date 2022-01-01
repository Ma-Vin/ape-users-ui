import { Injectable } from '@angular/core';
import { SelectionService } from '../util/selection.service';
import { BasePermissionsService } from './base-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class AdminPermissionsService extends BasePermissionsService {

  constructor(selectionService: SelectionService) {
    super(selectionService);
  }


  /**
   * @returns true if the active user is allowed to use any method at AdminService. Otherwise false.
   */
  isAllowedToUseAnyMethod(): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && activeUser.isGlobalAdmin;
  }
}
