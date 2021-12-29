import { Injectable } from '@angular/core';
import { Role } from '../../model/role.model';
import { User } from '../../model/user.model';
import { SelectionService } from '../util/selection.service';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {
  roleWorths: Map<Role, number> = this.initRoleWorths();


  constructor(private selectionService: SelectionService) { }


  /**
   * @returns new Map with worths of roles
   */
  private initRoleWorths(): Map<Role, number> {
    let roleWorths: Map<Role, number> = new Map();
    roleWorths.set(Role.ADMIN, 98);
    roleWorths.set(Role.MANAGER, 20);
    roleWorths.set(Role.CONTRIBUTOR, 10);
    roleWorths.set(Role.VISITOR, 0);
    roleWorths.set(Role.BLOCKED, -99);
    roleWorths.set(Role.NOT_RELEVANT, -1);
    return roleWorths;
  }


  /**
   * Determines the worth of a given role
   * @param role the role whose worth is asked for
   * @returns the worth of the role
   */
  private getRoleWorth(role: Role): number {
    if (this.roleWorths.has(role)) {
      return this.roleWorths.get(role) as number;
    }
    return -100;
  }


  /**
   * Checks whether an given user has equal or higher privilege than a given role
   * @param roleToCheck role to check
   * @param userToCheck user to check
   * @returns true if the user is an global admin or has equal or higher privilege than the role. Otherwise false.
   */
  private isSameRoleOrHigher(roleToCheck: Role, userToCheck: User): boolean {
    return userToCheck.isGlobalAdmin || this.getRoleWorth(roleToCheck) <= this.getRoleWorth(userToCheck.role == undefined ? Role.VISITOR : userToCheck.role);
  }


  /**
   * Checks whether an given user has ahigher privilege than a given role
   * @param roleToCheck role to check
   * @param userToCheck user to check
   * @returns true if the user is an global admin or has a higher privilege than the role. Otherwise false.
   */
  private isRoleHigher(roleToCheck: Role, userToCheck: User): boolean {
    return userToCheck.isGlobalAdmin || this.getRoleWorth(roleToCheck) < this.getRoleWorth(userToCheck.role == undefined ? Role.VISITOR : userToCheck.role);
  }


  /**
   * Checks whether an given user has higher privilege than a given other user
   * @param userToCheck user to check
   * @param userToCompareWith other user to compare with
   * @returns true if the user is an global admin or has higher privilege than the other user. Otherwise false.
   */
  private hasHigherRole(userToCheck: User, userToCompareWith: User): boolean {
    return this.isRoleHigher(userToCompareWith.role != undefined ? userToCompareWith.role : Role.VISITOR, userToCheck);
  }


  /**
   * Checks whether an given user has the equal identifcation compared to an other user and is not blocekd
   * @param userToCheck user to check
   * @param userToCompareWith other user to compare with
   * @returns true if the identifications are equal and the user is not blocked. Otherwise false.
   */
  private isUserItselfAndNotBlocked(userToCheck: User, userToCompareWith: User): boolean {
    return userToCheck.role != Role.BLOCKED && userToCheck.identification == userToCompareWith.identification;
  }


  /**
   * @returns true if the active user is allowed to create an other user. Otherwise false.
   */
  isAllowedToCreateUser(): boolean {
    let activeUser = this.selectionService.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.CONTRIBUTOR, activeUser);
  }


  /**
   * @returns true if the active user is allowed to delate an other user. Otherwise false.
   */
  isAllowedToDeleteUser(userToDelete: User): boolean {
    let activeUser = this.selectionService.getActiveUser();
    return activeUser != undefined && (
      this.isSameRoleOrHigher(Role.ADMIN, activeUser)
      || (this.isSameRoleOrHigher(Role.MANAGER, activeUser) && this.hasHigherRole(activeUser, userToDelete))
    );
  }


  /**
   * @returns true if the active user is allowed to get an other user. Otherwise false.
   */
  isAllowedToGetUser(): boolean {
    let activeUser = this.selectionService.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.VISITOR, activeUser);
  }


  /**
   * Checks whether the active user is allowed to update an other given user
   * @param userToUpdate User which should be updated
   * @returns true if the active user is allowed to update the other user. Otherwise false.
   */
  isAllowedToUpdateUser(userToUpdate: User): boolean {
    let activeUser = this.selectionService.getActiveUser();
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
    let activeUser = this.selectionService.getActiveUser();
    return activeUser != undefined && (this.isUserItselfAndNotBlocked(activeUser, userToUpdate) || this.isSameRoleOrHigher(Role.ADMIN, activeUser));
  }


  /**
   * @returns true if the active user is allowed to set the role of an other user. Otherwise false.
   */
  isAllowedToSetRoleOfUser(): boolean {
    let activeUser = this.selectionService.getActiveUser();
    return activeUser != undefined && this.isSameRoleOrHigher(Role.ADMIN, activeUser);
  }


  /**
   * @returns true if the active user is allowed to get all other users. Otherwise false.
   */
  isAllowedToGetAllUsers(): boolean {
    return this.isAllowedToGetUser();
  }


  /**
   * @returns true if the active user is allowed to count other users. Otherwise false.
   */
  isAllowedToCountUsers(): boolean {
    return this.isAllowedToGetUser();
  }

}
