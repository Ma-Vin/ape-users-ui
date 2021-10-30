import { Injectable } from '@angular/core';
import { NEVER } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminGroup } from '../model/admin-group.model';
import { CommonGroup } from '../model/common-group.model';
import { User } from '../model/user.model';
import { AdminService } from './admin.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private activeUser: User | undefined;
  private selectedAdminGroup: AdminGroup | undefined;
  private selectedCommonGroup: CommonGroup | undefined;

  constructor(private adminService: AdminService, private userService: UserService) { }

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
    ).subscribe(data => this.activeUser = data);
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
