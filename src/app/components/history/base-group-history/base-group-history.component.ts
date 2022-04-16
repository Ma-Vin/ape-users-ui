import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { BaseGroup } from 'src/app/model/base-group.model';
import { HistoryChange } from 'src/app/model/history-change.model';
import { BaseGroupService } from 'src/app/services/backend/base-group.service';
import { ElementHistoryComponent } from '../element-history/element-history.component';

@Component({
  selector: 'app-base-group-history',
  templateUrl: './base-group-history.component.html',
  styleUrls: ['./base-group-history.component.less']
})
export class BaseGroupHistoryComponent extends ElementHistoryComponent<BaseGroup, BaseGroupHistoryComponent> {

  constructor(public dialogRef: MatDialogRef<BaseGroupHistoryComponent>, @Inject(MAT_DIALOG_DATA) public data: BaseGroup, private baseGroupService: BaseGroupService) {
    super(dialogRef, data);
  }

  protected loadAllChangeElements(identification: string): Observable<HistoryChange[]> {
    return this.baseGroupService.getBaseGroupHistory(identification);
  }

}
