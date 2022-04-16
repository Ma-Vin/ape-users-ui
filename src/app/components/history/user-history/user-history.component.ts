import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HistoryChange } from 'src/app/model/history-change.model';
import { User } from 'src/app/model/user.model';
import { AdminService } from 'src/app/services/backend/admin.service';
import { UserService } from 'src/app/services/backend/user.service';
import { ElementHistoryComponent } from '../element-history/element-history.component';

@Component({
  selector: 'app-user-history',
  templateUrl: './user-history.component.html',
  styleUrls: ['./user-history.component.less']
})
export class UserHistoryComponent extends ElementHistoryComponent<User, UserHistoryComponent> {

  constructor(public dialogRef: MatDialogRef<UserHistoryComponent>, @Inject(MAT_DIALOG_DATA) public data: User, private userService: UserService, private adminService: AdminService) {
    super(dialogRef, data);
  }

  protected getDisplayedColumns(): string[]{
    return ['changeTime', 'changeType', 'action', 'editor'];
  }

  protected loadAllChangeElements(identification: string): Observable<HistoryChange[]> {
    if (this.data.isGlobalAdmin) {
      return this.adminService.getAdminHistory(identification);
    }
    return this.userService.getUserHistory(identification);
  }

}
