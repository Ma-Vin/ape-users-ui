import { Injectable } from '@angular/core';
import { Role } from '../../model/role.model';
import { SelectionService } from '../util/selection.service';
import { BasePermissionsService } from './base-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class CommonGroupPermissionsService extends BasePermissionsService {

  constructor(selectionService: SelectionService) {
    super(selectionService);
  }



  /**
   * @returns true if the active user is allowed to create a common group. Otherwise false.
   */
  isAllowedCreateCommonGroup(): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && activeUser.isGlobalAdmin;
  }



  /**
   * @returns true if the active user is allowed to delete a common group. Otherwise false.
   */
  isAllowedToDeleteCommonGroup(): boolean {
    return this.isAllowedCreateCommonGroup();
  }



  /**
   * @param identification the identification of the common group which is asked for
   * 
   * @returns true if the active user is allowed to get a common group. Otherwise false.
   */
  isAllowedToGetCommonGroup(identification: string): boolean {
    let activeUser = this.getActiveUser();

    return activeUser != undefined && (
      activeUser.isGlobalAdmin || (this.isUserAtCommonGroup(identification) && this.isSameRoleOrHigher(Role.VISITOR, activeUser)
      )
    );
  }



  /**
   * @returns true if the active user is allowed to get a all common groups. Otherwise false.
   */
  isAllowedToGetAllCommonGroup(): boolean {
    return this.isAllowedCreateCommonGroup();
  }



  /**
   * @returns true if the active user is allowed to get a all common group parts. Otherwise false.
   */
  isAllowedToGetAllCommonGroupParts(): boolean {
    return this.isAllowedToGetAllCommonGroup();
  }



  /**
   * @param identification the identification of the common group which is asked for
   * @returns true if the active user is allowed to update a common group. Otherwise false.
   */
  isAllowedToUpdateCommonGroup(identification: string): boolean {
    let activeUser = this.getActiveUser();

    return activeUser != undefined && (
      activeUser.isGlobalAdmin || (this.isUserAtCommonGroup(identification) && this.isSameRoleOrHigher(Role.ADMIN, activeUser)
      )
    );
  }


  /**
   * Checks if the user is allowed to get a parent commongroup. 
   * Since the common group is not known yet the value of selectionService.getSelectedCommonGroup() can not be checked
   * 
   * @returns true if the active user is allowed to get a parent common group. Otherwise false.
   */
  isAllowedToGetParentCommonGroup(): boolean {
    let activeUser = this.getActiveUser();

    return activeUser != undefined && (activeUser.isGlobalAdmin || this.isSameRoleOrHigher(Role.VISITOR, activeUser));
  }
}