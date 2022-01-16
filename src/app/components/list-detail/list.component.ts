import { Component, Input } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { IEqualsAndIdentifiable } from "src/app/model/equals-identifiable";

@Component({ template: '' })
export abstract class ListComponent<T extends IEqualsAndIdentifiable>  {
    @Input() allObjectsfilterDataSource!: MatTableDataSource<T>;
    @Input() selectObject!: (objectToSelect: T) => void;
    @Input() isObjectSelected!: (objectToCheck: T) => boolean;
  
    /**
     * Applies a value at the filter of the datasource with all objects
     * @param event Event with the value to use at filter.
     */
    applyAllObjectsFilter(event: Event): void {
      const filterValue = (event.target as HTMLInputElement).value;
      this.allObjectsfilterDataSource.filter = filterValue.trim().toLowerCase();
    }
}