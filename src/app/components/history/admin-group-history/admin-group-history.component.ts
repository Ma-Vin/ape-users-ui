import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AdminGroup } from 'src/app/model/admin-group.model';
import { HistoryChange } from 'src/app/model/history-change.model';
import { AdminService } from 'src/app/services/backend/admin.service';
import { ElementHistoryComponent } from '../element-history/element-history.component';

@Component({
  selector: 'app-admin-group-history',
  templateUrl: './admin-group-history.component.html',
  styleUrls: ['./admin-group-history.component.less']
})
export class AdminGroupHistoryComponent extends ElementHistoryComponent<AdminGroup, AdminGroupHistoryComponent> {

  constructor(public dialogRef: MatDialogRef<AdminGroupHistoryComponent>, @Inject(MAT_DIALOG_DATA) public data: AdminGroup, private adminService: AdminService) {
    super(dialogRef, data);
  }
  
  protected loadAllChangeElements(identification: string): Observable<HistoryChange[]> {
    return this.adminService.getAdminGroupHistory(identification);
  }

}
