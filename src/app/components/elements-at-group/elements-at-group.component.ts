import { ComponentType } from '@angular/cdk/portal';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { IAbstractGroup } from '../../model/abstract-group.model';
import { BaseGroup } from '../../model/base-group.model';
import { IEqualsAndIdentifiable } from '../../model/equals-identifiable';
import { PrivilegeGroup } from '../../model/privilege-group.model';
import { Role } from '../../model/role.model';
import { AddElementDialogComponent, AddElementDialogData } from '../add-element-dialog/add-element-dialog.component';

@Component({ template: '' })
export abstract class ElementsAtGroupComponent<T extends IEqualsAndIdentifiable, S extends AddElementDialogComponent<T, S>> implements OnInit, OnChanges {

  @Input() selectedBaseGroup: BaseGroup | undefined;
  @Input() selectedPrivilegeGroup: PrivilegeGroup | undefined;
  @Input() role: Role | undefined;

  selectedElement: T | undefined;
  elementsDataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);
  @ViewChild('elementTableSort', { static: false }) elementsSort!: MatSort;
  @ViewChild('elementTableMatPaginator', { static: false }) elementPaginator!: MatPaginator;
  private elementText: string;
  displayedColumns: string[] = ['identification', 'groupName'];

  constructor(public dialog: MatDialog, protected snackBar: MatSnackBar) {
    this.elementText = this.getElementText();
    this.displayedColumns = this.getDisplayedColumns();
  }

  public ngOnInit() {
    this.loadAllElements();
  }

  /**
   * @returns the text of the element for logging
   */
  protected abstract getElementText(): string;

  /**
   * @returns an array of the elementsDataSource columns to display
   */
  protected abstract getDisplayedColumns(): string[];


  public ngOnChanges(changes: SimpleChanges): void {
    this.loadAllElements();
  }


  /**
   * Loads all relevant sub groubs either from the selected base or privilege group
   */
  protected loadAllElements(): void {
    if (this.selectedBaseGroup != undefined) {
      this.loadAllElementsFromBaseGroup(this.selectedBaseGroup.identification).subscribe(
        elements => this.takeOverElements(elements)
      );
    }
    if (this.selectedPrivilegeGroup != undefined && this.role != undefined) {
      this.loadAllElementsFromPrivilegeGroup(this.selectedPrivilegeGroup.identification, this.role).subscribe(
        elements => this.takeOverElements(elements)
      );
    }
  }


  /**
   * Sets a given base group array to the data source 
   * @param groups the base goups to set
   */
  private takeOverElements(groups: T[]): void {
    this.elementsDataSource = new MatTableDataSource(groups);
    this.elementsDataSource.paginator = this.elementPaginator;
    this.elementsDataSource.sort = this.elementsSort;
  }


  /**
   * Loads all sub elements groups from a base group
   * @param identification the identification of the parent group
   * @returns an obeservable of all elements at base group
   */
  protected abstract loadAllElementsFromBaseGroup(identification: string): Observable<T[]>;


  /**
   * Loads all sub base groups of a given role from a privilege one
   * @param identification the identification of the parent privilege group
   * @param role the role to load
   * @returns an obeservable of all elements at privilege group
   */
  protected abstract loadAllElementsFromPrivilegeGroup(identification: string, role: Role): Observable<T[]>;


  /**
   * @returns true if the user is allowed to see sub base groups. Otherwise false
   */
  public showElements(): boolean {
    return (this.selectedBaseGroup != undefined && this.isAllowedToGetAllElementsFromBaseGroup())
      || (this.selectedPrivilegeGroup != undefined && this.role != undefined && this.isAllowedToGetAllElementsFromPrivilegeGroup());
  }


  /**
   * @returns true if the active user is allowed to get all elements from base group. Otherwise false
   */
  protected abstract isAllowedToGetAllElementsFromBaseGroup(): boolean;


  /**
   * @returns true if the active user is allowed to get all elements from privilege group. Otherwise false
   */
  protected abstract isAllowedToGetAllElementsFromPrivilegeGroup(): boolean;


  /**
   * Selects and unselects an element
   * @param element the element to select or unselect
   */
  public onSelectElement(element: T): void {
    if (this.isElementSelected(element)) {
      this.selectedElement = undefined;
      return;
    }
    this.selectedElement = this.map(element)
  }


  /**
   * Calls the static map function of the element class
   * @param toMap the object to mao
   * @returns the result of the map call
   */
  protected abstract map(toMap: T): T;


  /**
   * Checks whether a given element is selected or not
   * @param element the element to check
   * @returns true if the identification of the selected element  equals the given one. Otherwise false.
   */
  public isElementSelected(element: T): boolean {
    return this.selectedElement != undefined && element.getIdentification() == this.selectedElement.getIdentification();
  }


  /**
   * Opens a sub dialog to add other base groups to the selected one
   */
  public openAddElementDialog(): void {
    const dialogRef: MatDialogRef<any, T[]> = this.openAddDialog();

    dialogRef.afterClosed().subscribe((result: T[] | undefined) => {
      if (result == undefined) {
        return;
      }
      for (let element of result) {
        this.addElement(element);
      }
    });
  }


  /**
   * @returns Type of the component to load into the dialog.
   */
  protected abstract getDialogComponentTyp(): ComponentType<S>;


  /**
   * Opens the dialog for selection of elements to add
   * @returns the dialog reference of the selection dialod
   */
  private openAddDialog(): MatDialogRef<S, T[]> {
    return this.dialog.open(this.getDialogComponentTyp(), {
      width: '500px',
      maxHeight: '1000px',
      data: this.getDialogData()
    });

  }

  /**
   * @returns the data for the add dialog
   */
  private getDialogData(): AddElementDialogData {
    if (this.selectedBaseGroup != undefined) {
      return {
        selectedGroup: this.selectedBaseGroup
      };
    }
    if (this.selectedPrivilegeGroup != undefined && this.role != undefined) {
      return {
        selectedGroup: this.selectedPrivilegeGroup
      };
    }
    return {
      selectedGroup: {} as IAbstractGroup
    };
  }


  /**
   * @returns true if the button to add an element should be disabled. Otherwise false
   */
  public disableAddElement(): boolean {
    return !((this.selectedBaseGroup != undefined && this.isAllowedToAddAnElementToBaseGroup())
      || (this.selectedPrivilegeGroup != null && this.role != undefined && this.isAllowedToAddAnElementToPrivilegeGroup()));
  }


  /**
   * @returns true if the active user is allowed to add an element to a base group. Otherwise false
   */
  protected abstract isAllowedToAddAnElementToBaseGroup(): boolean;


  /**
   * @returns true if the active user is allowed to add an element to a privilege group. Otherwise false
   */
  protected abstract isAllowedToAddAnElementToPrivilegeGroup(): boolean;


  /**
   * Adds an element to the selected group
   * @param elementToAdd the element to add
   */
  private addElement(elementToAdd: T): void {
    if (elementToAdd == undefined) {
      return;
    }
    if (this.selectedBaseGroup != undefined) {
      this.addElementToBaseGroup(elementToAdd.getIdentification(), this.selectedBaseGroup.identification).subscribe(added => {
        if (added) {
          this.elementsDataSource.data.push(elementToAdd);
          this.elementsDataSource.data = this.elementsDataSource.data.slice();
        } else {
          this.openSnackBar(`The ${this.elementText} ${elementToAdd.getIdentification()} was not added to the base group ${this.selectedBaseGroup!.identification}`, 'Error');
        }
      });
    }
    if (this.selectedPrivilegeGroup != undefined && this.role != undefined) {
      this.addElementToPrivilegeGroup(elementToAdd.getIdentification(), this.selectedPrivilegeGroup.identification, this.role).subscribe(added => {
        if (added) {
          this.elementsDataSource.data.push(elementToAdd);
          this.elementsDataSource.data = this.elementsDataSource.data.slice();
        } else {
          this.openSnackBar(`The ${this.elementText} ${elementToAdd.getIdentification()} was not added with role ${this.role} to the privilege group ${this.selectedPrivilegeGroup!.identification}`, 'Error');
        }
      });
    }
  }


  /**
   * Adds an element to base group
   * @param elementIdentification the identification of the element to add
   * @param baseGroupIdentification the identification of the parent base group
   * @returns An oberservable which contains if the element was added or not
   */
  protected abstract addElementToBaseGroup(elementIdentification: string, baseGroupIdentification: string): Observable<boolean>;


  /**
   * Adds an element to privilege group
   * @param elementIdentification the identification of the element to add
   * @param privilegeGroupIdentification the identification of the parent privilege group
   * @param role the role of the element at privilege group
   * @returns An oberservable which contains if the element was added or not
   */
  protected abstract addElementToPrivilegeGroup(elementIdentification: string, privilegeGroupIdentification: string, role: Role): Observable<boolean>;


  /**
   * Removes the selected element from the parent base or privilege group
   */
  public removeElement(): void {
    if (this.selectedElement == undefined) {
      return;
    }
    if (this.selectedBaseGroup != undefined) {
      this.removeElementFromBaseGroup(this.selectedElement.getIdentification(), this.selectedBaseGroup.identification).subscribe(
        removed => {
          if (removed) {
            this.removeFromAllElements(this.selectedElement!.getIdentification());
            this.selectedElement = undefined;
          } else {
            this.openSnackBar(`The ${this.elementText} ${this.selectedElement!.getIdentification()} was not removed from the base group ${this.selectedBaseGroup!.identification}`, 'Error')
          }
        });
    }
    if (this.selectedPrivilegeGroup != undefined) {
      this.removeElementFromPrivilegeGroup(this.selectedElement.getIdentification(), this.selectedPrivilegeGroup.identification).subscribe(
        removed => {
          if (removed) {
            this.removeFromAllElements(this.selectedElement!.getIdentification());
            this.selectedElement = undefined;
          } else {
            this.openSnackBar(`The ${this.elementText} ${this.selectedElement!.getIdentification()} was not removed from the privilege group ${this.selectedPrivilegeGroup!.identification}`, 'Error')
          }
        });
    }
  }


  /**
   * Removes an element from base group
   * @param elementIdentification the identification of the element to remove
   * @param baseGroupIdentification the identification of the parent base group
   * @returns An oberservable which contains if the element was removed or not
   */
  protected abstract removeElementFromBaseGroup(elementIdentification: string, baseGroupIdentification: string): Observable<boolean>;


  /**
   * Removes an element from privilege group
   * @param elementIdentification the identification of the element to remove
   * @param privilegeGroupIdentification the identification of the parent privilege group
   * @returns An oberservable which contains if the element was removed or not
   */
  protected abstract removeElementFromPrivilegeGroup(elementIdentification: string, privilegeGroupIdentification: string): Observable<boolean>;



  /**
   * Removes an element from the list of all elements
   * @param identification the identification of the element to remove
   */
  private removeFromAllElements(identification: string): void {
    for (let i = 0; i < this.elementsDataSource.data.length; i++) {
      if (this.elementsDataSource.data[i].getIdentification() == identification) {
        this.elementsDataSource.data.splice(i, 1);
        this.elementsDataSource.sort = this.elementsSort;
        break;
      }
    }
    this.elementsDataSource.data = this.elementsDataSource.data.slice();
  }


  /**
   * @returns true if the button to remove an element should be disabled. Otherwise false
   */
  public disableRemoveElement(): boolean {
    return this.selectedElement == undefined || !((this.selectedBaseGroup != undefined && this.isAllowedToRemoveAnElementFromBaseGroup())
      || (this.selectedPrivilegeGroup != null && this.role != undefined && this.isAllowedToRemoveAnElementFromPrivilegeGroup()));
  }


  /**
   * @returns true if the active user is allowed to remove an element from a base group. Otherwise false
   */
  protected abstract isAllowedToRemoveAnElementFromBaseGroup(): boolean;


  /**
   * @returns true if the active user is allowed to remove an element from a privilege group. Otherwise false
   */
  protected abstract isAllowedToRemoveAnElementFromPrivilegeGroup(): boolean;
  

  /**
   * Opens a snackbar with a message
   * @param message The message to show in the snackbar
   * @param action  The label for the snackbar action
   */
  private openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
