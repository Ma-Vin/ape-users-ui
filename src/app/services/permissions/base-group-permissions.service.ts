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
   * @returns true if the active user is allowed to get all base group parts. Otherwise false.
   */
  isAllowedToGetAllBaseGroupParts(): boolean {
    return this.isAllowedToGetAllBaseGroups();
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
   * @returns true if the active user is allowed to get all base group parts from an other one. Otherwise false.
   */
  isAllowedToGetAllBasePartsAtBaseGroup(): boolean {
    return this.isAllowedToGetAllBasesAtBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to count available base groups for an other one. Otherwise false.
   */
  isAllowedToCountAvailableBasesForBaseGroup(): boolean {
    return this.isAllowedToGetAvailableBasesForBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to get available base groups for an other one. Otherwise false.
   */
  isAllowedToGetAvailableBasesForBaseGroup(): boolean {
    return this.isAllowedToGetAllBasesAtBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to get available base group parts for an other one. Otherwise false.
   */
  isAllowedToGetAvailableBasePartsForBaseGroup(): boolean {
    return this.isAllowedToGetAvailableBasesForBaseGroup();
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


  /**
   * @returns true if the active user is allowed to get all base group parts from a privilege one. Otherwise false.
   */
  isAllowedToGetAllBasePartsAtPrivilegeGroup(): boolean {
    return this.isAllowedToGetAllBasesAtPrivilegeGroup();
  }


  /**
   * @returns true if the active user is allowed to count available base groups for a privilege one. Otherwise false.
   */
  isAllowedToCountAvailableBasesForPrivilegeGroup(): boolean {
    return this.isAllowedToGetAvailableBasesForPrivilegeGroup();
  }


  /**
   * @returns true if the active user is allowed to get available base groups for a privilege one. Otherwise false.
   */
  isAllowedToGetAvailableBasesForPrivilegeGroup(): boolean {
    return this.isAllowedToGetAllBasesAtPrivilegeGroup();
  }


  /**
   * @returns true if the active user is allowed to get available base group parts for a privilege one. Otherwise false.
   */
  isAllowedToGetAvailableBasePartsForPrivilegeGroup(): boolean {
    return this.isAllowedToGetAvailableBasesForPrivilegeGroup();
  }

}
