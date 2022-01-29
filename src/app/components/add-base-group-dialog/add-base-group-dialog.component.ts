import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NEVER, Observable } from 'rxjs';
import { IAbstractGroup } from 'src/app/model/abstract-group.model';
import { BaseGroup } from 'src/app/model/base-group.model';
import { PrivilegeGroup } from 'src/app/model/privilege-group.model';
import { BaseGroupService } from 'src/app/services/backend/base-group.service';


export interface AddBaseGroupDialogData {
  selectedGroup: IAbstractGroup;
}


@Component({
  selector: 'app-add-base-group-dialog',
  templateUrl: './add-base-group-dialog.component.html',
  styleUrls: ['./add-base-group-dialog.component.less']
})
export class AddBaseGroupDialogComponent implements OnInit {

  displayedColumns: string[] = ['select', 'identification', 'groupName'];
  dataSource: MatTableDataSource<BaseGroup> = new MatTableDataSource<BaseGroup>([]);
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  selection = new SelectionModel<BaseGroup>(true, []);

  constructor(public dialogRef: MatDialogRef<AddBaseGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddBaseGroupDialogData, private baseGroupService: BaseGroupService) { }

  public ngOnInit() {
    this.loadAllRelevantBaseGroups();
  }


  /**
   * Loads all relevant base groups, which can be added to the selected base or privielege one
   */
  private loadAllRelevantBaseGroups(): void {
    this.baseGroupService.getAllBaseGroups(undefined, undefined).subscribe(
      allGroups => {
        this.loadAllSubGroups().subscribe(
          alreadyAddedGroups => {
            let relevantGroups: BaseGroup[] = []

            for (let g of allGroups) {
              if (this.isGroupRelevant(g, alreadyAddedGroups)) {
                relevantGroups.push(g);
              }
            }

            this.dataSource = new MatTableDataSource(relevantGroups);
            this.dataSource.sort = this.sort;
          });
      });
  }


  /**
   * Depending of the type of this.data.selectedGroup different services are to called to get all sub basegroup
   * @returns An observable of all sub groups
   */
  private loadAllSubGroups(): Observable<BaseGroup[]> {
    if (this.data.selectedGroup instanceof BaseGroup) {
      return this.baseGroupService.getAllBasesAtBaseGroup(this.data.selectedGroup.identification, undefined, undefined);
    }
    if (this.data.selectedGroup instanceof PrivilegeGroup) {
      return this.baseGroupService.getAllBasesAtPrivilegeGroup(this.data.selectedGroup.identification, undefined, undefined, undefined);
    }
    return NEVER;
  }


  /**
   * Checks whether the group is already added or the selected one itself
   * @param groupToCheck the group to check
   * @param existingSubGroups an array of already existing subgroups at the selected one
   * @returns true if the group can be added. Otherwise false
   */
  private isGroupRelevant(groupToCheck: BaseGroup, existingSubGroups: BaseGroup[]): boolean {
    if (groupToCheck.identification == this.data.selectedGroup.identification) {
      return false;
    }
    for (let g of existingSubGroups) {
      if (groupToCheck.identification == g.identification) {
        return false;
      }
    }
    return true;
  }


  /**
   * Indicator if all elements are checked at selection
   * @returns true if all elements are selected. Otherwise false
   */
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }


  /**
   * Adds all remaining elements to selection if there is at least one missing. 
   * Otherwise all elements will be removed from selection
   */
  public masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }


  /**
   * The label for the checkbox on the passed row
   * @param row the row whose label is asked for
   * @returns the label
   */
  public checkboxLabel(row: BaseGroup | undefined): string {
    if (row == undefined) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.identification}`;
  }


  /**
   * Closes the dialog and returns the selection to the component which opens the dialog
   */
  public onAccept() {
    this.dialogRef.close(this.selection.selected);
  }


  /**
   * Closes the dialog without returns any selection
   */
  public onCancel() {
    this.dialogRef.close();
  }

}
