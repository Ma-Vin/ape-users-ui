import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NEVER, Observable } from 'rxjs';
import { IAbstractGroup } from '../../model/abstract-group.model';
import { BaseGroup } from '../../model/base-group.model';
import { IEqualsAndIdentifiable } from '../../model/equals-identifiable';
import { PrivilegeGroup } from '../../model/privilege-group.model';


export interface AddElementDialogData {
  selectedGroup: IAbstractGroup;
}

@Component({ template: '' })
export abstract class AddElementDialogComponent<T extends IEqualsAndIdentifiable, S extends AddElementDialogComponent<T, S>> implements OnInit {


  displayedColumns: string[];

  dataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  selection = new SelectionModel<T>(true, []);

  constructor(public dialogRef: MatDialogRef<S>, @Inject(MAT_DIALOG_DATA) public data: AddElementDialogData) {
    this.displayedColumns = this.getDisplayedColumns();
  }

  public ngOnInit() {
    this.loadAllRelevantElements();
  }

  protected abstract getDisplayedColumns(): string[];

  /**
   * Loads all relevant elements, which can be added to the selected base or privielege group
   */
  private loadAllRelevantElements(): void {
    this.loadAvailableElementsForGroup().subscribe(
      availableElements => {
        this.dataSource = new MatTableDataSource(availableElements);
        this.dataSource.sort = this.sort;
      });
  }

  /**
   * Depending of the type of this.data.selectedGroup different services are to called to get all available elements
   * @returns An observable of all available elements
   */
  private loadAvailableElementsForGroup(): Observable<T[]> {
    if (this.data.selectedGroup instanceof BaseGroup) {
      return this.getAvailableElementsForBaseGroup(this.data.selectedGroup.identification);
    }
    if (this.data.selectedGroup instanceof PrivilegeGroup) {
      return this.getAvailableElementsForPrivilegeGroup(this.data.selectedGroup.identification);
    }
    return NEVER;
  }

  /**
   * gets the available elements for a parent base group
   * @param identification identification of the parent base group
   */
  protected abstract getAvailableElementsForBaseGroup(identification: string): Observable<T[]>;


  /**
   * gets the available elements for a parent privilege group
   * @param identification identification of the parent privilege group
   */
  protected abstract getAvailableElementsForPrivilegeGroup(identification: string): Observable<T[]>;


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
  public checkboxLabel(row: T | undefined): string {
    if (row == undefined) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.getIdentification()}`;
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
