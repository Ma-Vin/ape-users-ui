import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HistoryChange } from 'src/app/model/history-change.model';
import { PrivilegeGroup } from 'src/app/model/privilege-group.model';
import { PrivilegeGroupService } from 'src/app/services/backend/privilege-group.service';
import { ElementHistoryComponent } from '../element-history/element-history.component';

@Component({
  selector: 'app-privilege-group-history',
  templateUrl: './privilege-group-history.component.html',
  styleUrls: ['./privilege-group-history.component.less']
})
export class PrivilegeGroupHistoryComponent extends ElementHistoryComponent<PrivilegeGroup, PrivilegeGroupHistoryComponent> {

  constructor(public dialogRef: MatDialogRef<PrivilegeGroupHistoryComponent>, @Inject(MAT_DIALOG_DATA) public data: PrivilegeGroup, private privilegeGroupService: PrivilegeGroupService) {
    super(dialogRef, data);
  }

  protected loadAllChangeElements(identification: string): Observable<HistoryChange[]> {
    return this.privilegeGroupService.getPrivilegeGroupHistory(identification);
  }

}
