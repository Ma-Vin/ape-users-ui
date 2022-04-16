import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { IEqualsAndIdentifiable } from 'src/app/model/equals-identifiable';
import { HistoryChange } from 'src/app/model/history-change.model';

@Component({ template: '' })
export abstract class ElementHistoryComponent<T extends IEqualsAndIdentifiable, S extends ElementHistoryComponent<T, S>> implements OnInit {

  elementsDataSource: MatTableDataSource<HistoryChange> = new MatTableDataSource<HistoryChange>([]);
  private elementsSort: MatSort | undefined;
  private elementPaginator!: MatPaginator | undefined;
  displayedColumns: string[];

  constructor(public dialogRef: MatDialogRef<S>, @Inject(MAT_DIALOG_DATA) public data: T) {
    this.displayedColumns = this.getDisplayedColumns();
  }

  ngOnInit(): void {
    this.loadAllElements();
  }

  @ViewChild('elementTableMatPaginator', { static: false })
  set paginator(value: MatPaginator) {
    if (this.elementsDataSource) {
      this.elementsDataSource.paginator = value;
    }
    this.elementPaginator = value;
  }

  @ViewChild('elementTableSort', { static: false })
  set sort(value: MatSort) {
    if (this.elementsDataSource) {
      this.elementsDataSource.sort = value;
    }
    this.elementsSort = value;
  }

  /**
   * @returns an array of the elementsDataSource columns to display
   */
  protected getDisplayedColumns(): string[]{
    return ['changeTime', 'changeType', 'action', 'editor', 'targetIdentification'];
  }

  /**
   * Loads all changes for the selected object
   */
  protected loadAllElements(): void {
    this.loadAllChangeElements(this.data.getIdentification()).subscribe(elements => this.takeOverElements(elements));
  }


  /**
   * Loads all changes elements
   * @param identification the identification of the object whose history will be loaded
   * @returns an obeservable of all change elements
   */
  protected abstract loadAllChangeElements(identification: string): Observable<HistoryChange[]>;


  /**
   * Sets a given elements array to the data source 
   * @param elements the changes to set
   */
  private takeOverElements(elements: HistoryChange[]): void {
    this.elementsDataSource = new MatTableDataSource(elements);
    this.elementsDataSource.paginator = this.elementPaginator!;
    this.elementsDataSource.sort = this.elementsSort!;
  }


  /**
   * Closes the dialog
   */
  public onClose(): void {
    this.dialogRef.close();
  }


}
