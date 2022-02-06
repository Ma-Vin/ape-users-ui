import { Injectable } from '@angular/core';
import { Role } from '../../model/role.model';
import { SelectionService } from '../util/selection.service';
import { BasePermissionsService } from './base-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class PrivilegeGroupPermissionsService extends BasePermissionsService {

  constructor(selectionService: SelectionService) {
    super(selectionService);
  }

  /**
 * @returns true if the active user is allowed to create a privilege group. Otherwise false.
 */
  isAllowedCreatePrivilegeGroup(): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.MANAGER, activeUser);
  }


  /**
   * @returns true if the active user is allowed to delate a privilege group. Otherwise false.
   */
  isAllowedToDeletePrivilegeGroup(): boolean {
    return this.isAllowedCreatePrivilegeGroup();
  }

  /**
   * @returns true if the active user is allowed to get a privilege group. Otherwise false.
   */
  isAllowedToGetPrivilegeGroup(): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.VISITOR, activeUser);
  }


  /**
   * @returns true if the active user is allowed to update a privilege group. Otherwise false.
   */
  isAllowedToUpdatePrivilegeGroup(): boolean {
    return this.isAllowedCreatePrivilegeGroup();
  }


  /**
   * @returns true if the active user is allowed to count privilege groups. Otherwise false.
   */
  isAllowedToCountPrivilegeGroups(): boolean {
    return this.isAllowedToGetPrivilegeGroup();
  }


  /**
   * @returns true if the active user is allowed to get all privilege groups. Otherwise false.
   */
  isAllowedToGetAllPrivilegeGroups(): boolean {
    return this.isAllowedToGetPrivilegeGroup();
  }
}
