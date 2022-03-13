import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { IAbstractGroup } from '../../model/abstract-group.model';
import { BaseGroup } from '../../model/base-group.model';
import { BaseGroupService } from '../../services/backend/base-group.service';
import { AddElementDialogComponent } from '../add-element-dialog/add-element-dialog.component';


export interface AddBaseGroupDialogData {
  selectedGroup: IAbstractGroup;
}


@Component({
  selector: 'app-add-base-group-dialog',
  templateUrl: './add-base-group-dialog.component.html',
  styleUrls: ['./add-base-group-dialog.component.less']
})
export class AddBaseGroupDialogComponent extends AddElementDialogComponent<BaseGroup, AddBaseGroupDialogComponent> {

  dataSource: MatTableDataSource<BaseGroup> = new MatTableDataSource<BaseGroup>([]);
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  selection = new SelectionModel<BaseGroup>(true, []);

  constructor(public dialogRef: MatDialogRef<AddBaseGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddBaseGroupDialogData, private baseGroupService: BaseGroupService) {
    super(dialogRef, data);
  }


  protected getDisplayedColumns(): string[] {
    return ['select', 'identification', 'groupName'];
  }


  protected getAvailableElementsForBaseGroup(identification: string): Observable<BaseGroup[]> {
    return this.baseGroupService.getAvailableBasePartsForBaseGroup(identification, undefined, undefined);
  }


  protected getAvailableElementsForPrivilegeGroup(identification: string): Observable<BaseGroup[]> {
    return this.baseGroupService.getAvailableBasePartsForPrivilegeGroup(identification, undefined, undefined);
  }

}
