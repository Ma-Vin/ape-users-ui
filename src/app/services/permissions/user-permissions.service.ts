import { Injectable } from '@angular/core';
import { Role } from '../../model/role.model';
import { User } from '../../model/user.model';
import { SelectionService } from '../util/selection.service';
import { BasePermissionsService } from './base-permissions.service';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService extends BasePermissionsService {

  constructor(selectionService: SelectionService) {
    super(selectionService);
  }


  /**
   * @returns true if the active user is allowed to create an other user. Otherwise false.
   */
  isAllowedToCreateUser(): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.CONTRIBUTOR, activeUser);
  }


  /**
   * @returns true if the active user is allowed to delate an other user. Otherwise false.
   */
  isAllowedToDeleteUser(userToDelete: User): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && (
      this.isSameRoleOrHigher(Role.ADMIN, activeUser)
      || (this.isSameRoleOrHigher(Role.MANAGER, activeUser) && this.hasHigherRole(activeUser, userToDelete))
    );
  }


  /**
   * @returns true if the active user is allowed to get an other user. Otherwise false.
   */
  isAllowedToGetUser(): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.VISITOR, activeUser);
  }


  /**
   * Checks whether the active user is allowed to update an other given user
   * @param userToUpdate User which should be updated
   * @returns true if the active user is allowed to update the other user. Otherwise false.
   */
  isAllowedToUpdateUser(userToUpdate: User): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && (
      this.isUserItselfAndNotBlocked(activeUser, userToUpdate)
      || this.isSameRoleOrHigher(Role.ADMIN, activeUser)
      || (this.isSameRoleOrHigher(Role.MANAGER, activeUser) && this.hasHigherRole(activeUser, userToUpdate))
    );
  }


  /**
   * Checks whether the active user is allowed to set the password of an other given user
   * @param userToUpdate User which should be updated
   * @returns true if the active user is allowed to set the password of an other user. Otherwise false.
   */
  isAllowedToSetPasswordOfUser(userToUpdate: User): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && (this.isUserItselfAndNotBlocked(activeUser, userToUpdate) || this.isSameRoleOrHigher(Role.ADMIN, activeUser));
  }


  /**
   * @returns true if the active user is allowed to set the role of an other user. Otherwise false.
   */
  isAllowedToSetRoleOfUser(): boolean {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.ADMIN, activeUser);
  }


  /**
   * @returns true if the active user is allowed to get all other users. Otherwise false.
   */
  isAllowedToGetAllUsers(): boolean {
    return this.isAllowedToGetUser();
  }


  /**
   * @returns true if the active user is allowed to get all other user parts. Otherwise false.
   */
  isAllowedToGetAllUserParts(): boolean {
    return this.isAllowedToGetAllUsers();
  }


  /**
   * @returns true if the active user is allowed to count other users. Otherwise false.
   */
  isAllowedToCountUsers(): boolean {
    return this.isAllowedToGetUser();
  }


  /**
   * @returns true if the active user is allowed to add an user to a base group. Otherwise false.
   */
  isAllowedToAddUserToBaseGroup() {
    return this.isAllowedToCreateUser();
  }


  /**
   * @returns true if the active user is allowed to remove an user from a base group. Otherwise false.
   */
  isAllowedToRemoveUserFromBaseGroup() {
    return this.isAllowedToAddUserToBaseGroup();
  }


  /**
   * @returns true if the active user is allowed to count users at a base group. Otherwise false.
   */
  isAllowedToCountUsersAtBaseGroup(): boolean {
    return this.isAllowedToGetUser();
  }


  /**
   * @returns true if the active user is allowed to get all users from a base group. Otherwise false.
   */
  isAllowedToGetAllUsersAtBaseGroup(): boolean {
    return this.isAllowedToGetUser();
  }


  /**
   * @returns true if the active user is allowed to add an user to a privilege group. Otherwise false.
   */
  isAllowedToAddUserToPrivilegeGroup() {
    let activeUser = this.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.MANAGER, activeUser);
  }


  /**
   * @returns true if the active user is allowed to remove an user from a privilege group. Otherwise false.
   */
  isAllowedToRemoveUserFromPrivilegeGroup() {
    return this.isAllowedToAddUserToPrivilegeGroup();
  }


  /**
   * @returns true if the active user is allowed to count users at a privilege group. Otherwise false.
   */
  isAllowedToCountUsersAtPrivilegeGroup(): boolean {
    return this.isAllowedToGetUser();
  }


  /**
   * @returns true if the active user is allowed to get all users from a privilege group. Otherwise false.
   */
  isAllowedToGetAllUsersAtPrivilegeGroup(): boolean {
    return this.isAllowedToGetUser();
  }

}
