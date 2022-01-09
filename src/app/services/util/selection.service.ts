import { Injectable } from '@angular/core';
import { AdminGroup } from '../../model/admin-group.model';
import { CommonGroup } from '../../model/common-group.model';
import { User } from '../../model/user.model';
import { CommonGroupService } from '../backend/common-group.service';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private activeUser: User | undefined;
  private selectedAdminGroup: AdminGroup | undefined;
  private selectedCommonGroup: CommonGroup | undefined;

  constructor(private commonGroupService: CommonGroupService) { }

  public getActiveUser(): User | undefined {
    return this.activeUser;
  }

  /**
   * Sets the user as active one and determine its parent common group
   * @param user The user to set
   */
  public setActiveUser(user: User | undefined): void {
    this.activeUser = user;
    this.determineCommonGroup();
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
