import { Injectable } from '@angular/core';
import { NEVER } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminGroup } from '../../model/admin-group.model';
import { CommonGroup } from '../../model/common-group.model';
import { User } from '../../model/user.model';
import { AdminService } from '../backend/admin.service';
import { CommonGroupService } from '../backend/common-group.service';
import { UserService } from '../backend/user.service';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private activeUser: User | undefined;
  private selectedAdminGroup: AdminGroup | undefined;
  private selectedCommonGroup: CommonGroup | undefined;

  constructor(private adminService: AdminService, private userService: UserService, private commonGroupService: CommonGroupService) { }

  public getActiveUser(): User | undefined {
    return this.activeUser;
  }

  /**
   * Sets the user of the given id. The backend will be called to find the specific user.
   * @param userId The identification of the user
   */
  public setActiveUser(userId: string): void {
    this.userService.getUser(userId).pipe(
      catchError((err, caugth) => {
        if (err instanceof Error && err.message == `There is not any User with identification "${userId}"`) {
          console.debug(`The user ${userId} does not exists, may be it iss an admin`)
          return this.adminService.getAdmin(userId);
        }
        this.activeUser = undefined;
        return NEVER;
      })
    ).subscribe(data => {
      this.activeUser = data;
      this.determineCommonGroup();
    });
  }

  /**
   * Determines the parent common group of the active user, if the user is defined and not a global admin
   */
  private determineCommonGroup(): void {
    if (this.activeUser == undefined || this.activeUser.isGlobalAdmin) {
      return;
    }
    this.commonGroupService.getParentCommonGroupOfUser(this.activeUser.identification)
      .subscribe(data => this.selectedCommonGroup = data);
  }

  public removeActiveUser(): void {
    this.activeUser = undefined;
  }

  public getSelectedAdminGroup(): AdminGroup | undefined {
    return this.selectedAdminGroup;
  }

  public setSelectedAdminGroup(group: AdminGroup): void {
    this.selectedAdminGroup = group;
  }

  public getSelectedCommonGroup(): CommonGroup | undefined {
    return this.selectedCommonGroup;
  }

  public setSelectedCommonGroup(group: CommonGroup): void {
    this.selectedCommonGroup = group;
  }
}
