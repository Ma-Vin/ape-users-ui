import { Injectable } from '@angular/core';
import { User } from '../../model/user.model';
import { Role } from '../../model/role.model';
import { SelectionService } from '../util/selection.service';

@Injectable({
  providedIn: 'root'
})
export abstract class BasePermissionsService {
  roleWorths: Map<Role, number> = this.initRoleWorths();

  constructor(protected selectionService: SelectionService) { }

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
  protected getRoleWorth(role: Role): number {
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
  protected isSameRoleOrHigher(roleToCheck: Role, userToCheck: User): boolean {
    return userToCheck.isGlobalAdmin || this.getRoleWorth(roleToCheck) <= this.getRoleWorth(userToCheck.role == undefined ? Role.VISITOR : userToCheck.role);
  }


  /**
   * Checks whether an given user has ahigher privilege than a given role
   * @param roleToCheck role to check
   * @param userToCheck user to check
   * @returns true if the user is an global admin or has a higher privilege than the role. Otherwise false.
   */
  protected isRoleHigher(roleToCheck: Role, userToCheck: User): boolean {
    return userToCheck.isGlobalAdmin || this.getRoleWorth(roleToCheck) < this.getRoleWorth(userToCheck.role == undefined ? Role.VISITOR : userToCheck.role);
  }


  /**
   * Checks whether an given user has higher privilege than a given other user
   * @param userToCheck user to check
   * @param userToCompareWith other user to compare with
   * @returns true if the user is an global admin or has higher privilege than the other user. Otherwise false.
   */
  protected hasHigherRole(userToCheck: User, userToCompareWith: User): boolean {
    return this.isRoleHigher(userToCompareWith.role != undefined ? userToCompareWith.role : Role.VISITOR, userToCheck);
  }


  /**
   * Checks whether an given user has the equal identifcation compared to an other user and is not blocekd
   * @param userToCheck user to check
   * @param userToCompareWith other user to compare with
   * @returns true if the identifications are equal and the user is not blocked. Otherwise false.
   */
  protected isUserItselfAndNotBlocked(userToCheck: User, userToCompareWith: User): boolean {
    return userToCheck.role != Role.BLOCKED && userToCheck.identification == userToCompareWith.identification;
  }


  /**
   * @returns The active user from selction service
   */
  protected getActiveUser(): User | undefined {
    return this.selectionService.getActiveUser();
  }
}
