import { Injectable } from '@angular/core';
import { Role } from 'src/app/model/role.model';
import { SelectionService } from '../util/selection.service';
import { BasePermissionsService } from './base-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class BaseGroupPermissionsService extends BasePermissionsService {

  constructor(selectionService: SelectionService) {
    super(selectionService);
  }


  /**
   * @returns true if the active user is allowed to create a base group. Otherwise false.
   */
  isAllowedCreateBaseGroup(): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.MANAGER, activeUser);
  }


  /**
   * @returns true if the active user is allowed to delate a base group. Otherwise false.
   */
  isAllowedToDeleteBaseGroup(): boolean {
    return this.isAllowedCreateBaseGroup();
  }

  /**
   * @returns true if the active user is allowed to get a base group. Otherwise false.
   */
  isAllowedToGetBaseGroup(): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.VISITOR, activeUser);
  }


  /**
   * @returns true if the active user is allowed to update  a base group. Otherwise false.
   */
  isAllowedToUpdateBaseGroup(): boolean {
    return this.isAllowedCreateBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to count base groups. Otherwise false.
   */
  isAllowedToCountBaseGroups(): boolean {
    return this.isAllowedToGetBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to get all base groups. Otherwise false.
   */
  isAllowedToGetAllBaseGroups(): boolean {
    return this.isAllowedToGetBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to add a base group to an other one. Otherwise false.
   */
  isAllowedToAddBaseToBaseGroup() {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.CONTRIBUTOR, activeUser);
  }


  /**
   * @returns true if the active user is allowed to remove a base group from an other one. Otherwise false.
   */
  isAllowedToRemoveBaseFromBaseGroup() {
    return this.isAllowedToAddBaseToBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to count base groups at an other one. Otherwise false.
   */
  isAllowedToCountBasesAtBaseGroup(): boolean {
    return this.isAllowedToGetBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to get all base groups from an other one. Otherwise false.
   */
  isAllowedToGetAllBasesAtBaseGroup(): boolean {
    return this.isAllowedToGetBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to add a base group to a privilege one. Otherwise false.
   */
  isAllowedToAddBaseToPrivilegeGroup() {
    return this.isAllowedCreateBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to remove a base group from a privilege one. Otherwise false.
   */
  isAllowedToRemoveBaseFromBPrivilegeGroup() {
    return this.isAllowedToAddBaseToPrivilegeGroup();
  }


  /**
   * @returns true if the active user is allowed to count base groups at a privilege one. Otherwise false.
   */
  isAllowedToCountBasesAtPrivilegeGroup(): boolean {
    return this.isAllowedToGetBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to get all base groups from a privilege one. Otherwise false.
   */
  isAllowedToGetAllBasesAtPrivilegeGroup(): boolean {
    return this.isAllowedToGetBaseGroup();
  }

}
