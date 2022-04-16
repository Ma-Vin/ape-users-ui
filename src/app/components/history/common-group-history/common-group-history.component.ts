import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CommonGroup } from 'src/app/model/common-group.model';
import { HistoryChange } from 'src/app/model/history-change.model';
import { CommonGroupService } from 'src/app/services/backend/common-group.service';
import { ElementHistoryComponent } from '../element-history/element-history.component';

@Component({
  selector: 'app-common-group-history',
  templateUrl: './common-group-history.component.html',
  styleUrls: ['./common-group-history.component.less']
})
export class CommonGroupHistoryComponent extends ElementHistoryComponent<CommonGroup, CommonGroupHistoryComponent> {

  constructor(public dialogRef: MatDialogRef<CommonGroupHistoryComponent>, @Inject(MAT_DIALOG_DATA) public data: CommonGroup, private commonGroupService: CommonGroupService) {
    super(dialogRef, data);
  }

  protected loadAllChangeElements(identification: string): Observable<HistoryChange[]> {
    return this.commonGroupService.getCommonGroupHistory(identification);
  }

}
