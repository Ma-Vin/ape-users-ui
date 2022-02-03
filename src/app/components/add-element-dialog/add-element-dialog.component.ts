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
    this.getAllElements().subscribe(
      allElements => {
        this.loadAllElementsFromGroup().subscribe(
          alreadyAddedElements => {
            let relevantElements: T[] = []

            for (let g of allElements) {
              if (this.isElementRelevant(g, alreadyAddedElements)) {
                relevantElements.push(g);
              }
            }

            this.dataSource = new MatTableDataSource(relevantElements);
            this.dataSource.sort = this.sort;
          });
      });
  }

  protected abstract getAllElements(): Observable<T[]>;


  /**
   * Depending of the type of this.data.selectedGroup different services are to called to get all sub elements
   * @returns An observable of all sub elements
   */
  private loadAllElementsFromGroup(): Observable<T[]> {
    if (this.data.selectedGroup instanceof BaseGroup) {
      return this.getAllElementsFromBaseGroup(this.data.selectedGroup.identification);
    }
    if (this.data.selectedGroup instanceof PrivilegeGroup) {
      return this.getAllElementsFromPrivilegeGroup(this.data.selectedGroup.identification);
    }
    return NEVER;
  }

  protected abstract getAllElementsFromBaseGroup(identification: string): Observable<T[]>;

  protected abstract getAllElementsFromPrivilegeGroup(identification: string): Observable<T[]>;


  /**
   * Checks whether the element is already added or the selected one itself
   * @param elementToCheck the element to check
   * @param existingElementsAtGroup an array of already existing elements at the selected group
   * @returns true if the element can be added. Otherwise false
   */
  private isElementRelevant(elementToCheck: T, existingElementsAtGroup: T[]): boolean {
    if (elementToCheck.getIdentification() == this.data.selectedGroup.identification) {
      return false;
    }
    for (let g of existingElementsAtGroup) {
      if (elementToCheck.getIdentification() == g.getIdentification()) {
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
