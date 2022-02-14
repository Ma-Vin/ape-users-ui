import { Component, Input, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { IEqualsAndIdentifiable } from "src/app/model/equals-identifiable";

@Component({ template: '' })
export abstract class ListComponent<T extends IEqualsAndIdentifiable>  {
    @Input() allObjectsfilterDataSource!: MatTableDataSource<T>;
    @Input() selectObject!: (objectToSelect: T) => void;
    @Input() isObjectSelected!: (objectToCheck: T) => boolean;
  
    @ViewChild('tableAllObjectsSort', { static: false })
    set sort(value: MatSort) {
      if (this.allObjectsfilterDataSource) {
        this.allObjectsfilterDataSource.sort = value;
      }
    }

    /**
     * Applies a value at the filter of the datasource with all objects
     * @param event Event with the value to use at filter.
     */
    applyAllObjectsFilter(event: Event): void {
      const filterValue = (event.target as HTMLInputElement).value;
      this.allObjectsfilterDataSource.filter = filterValue.trim().toLowerCase();
    }
}