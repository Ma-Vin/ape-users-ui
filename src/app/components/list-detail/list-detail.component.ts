import { Component, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Location } from '@angular/common';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { IEqualsAndIdentifiable } from "src/app/model/equals-identifiable";

@Component({ template: '' })
export abstract class ListDetailComponent<T extends IEqualsAndIdentifiable> implements OnInit {

    @Input() @Output() selectedObject: T;
    protected originalObject: T | undefined;
    showObjectDetail: boolean;
    isNewObject = false;


    allObjectsDisplayedColumns: string[];
    allObjectsfilterDataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);
    @ViewChild('tableAllObjectsSort', { static: false }) sort: MatSort | null = null;
    @ViewChild('tableAllObjectsTable', { static: false }) table: MatTable<T> | undefined;


    constructor(protected route: ActivatedRoute, protected location: Location, protected snackBar: MatSnackBar) {
        this.selectedObject = this.createNewEmptyObject();
        this.showObjectDetail = false;
        this.allObjectsDisplayedColumns = this.createDisplayedColumns();
    }

    /**
     * Init this component and should be called at ngOnInit
     */
    ngOnInit(): void {
        this.loadAllObjects();
        this.isNewObject = false;
    }

    /**
     * @returns Creates an new object use as placeholder if nothing else is selected or if new object will be created
     */
    abstract createNewEmptyObject(): T;

    /**
     * @returns An Array of Columns for the list of all objects
     */
    abstract createDisplayedColumns(): string[];

    /**
     * Loads all objects and adds them to the filtered datasource
     */
    protected abstract loadAllObjects(): void;


    /**
     * Applies a value at the filter of the datasource with all objects
     * @param event Event with the value to use at filter.
     */
    applyAllObjectsFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.allObjectsfilterDataSource.filter = filterValue.trim().toLowerCase();
    }

    /**
     * Creates a new objects and maps the attributes
     * @param source Source object which should be copied
     * @returns a new Object equal to the source
     */
    abstract mapObject(source: T): T;


    /**
     * Checks if there exists a identification of a object at url. If there ist one the coresponding object will be selected
     */
    protected checkUrlId(): void {
        if (!this.route.snapshot.paramMap.has('id')) {
            return;
        }
        let id = this.route.snapshot.paramMap.get('id');
        for (let objectToCheck of this.allObjectsfilterDataSource.data) {
            if (objectToCheck.getIdentification() == id) {
                this.onSelectObject(objectToCheck);
                break;
            }
        }
    }


    protected abstract getBaseRoute(): string;

    /**
     * Selects a given object
     * @param objectToSelect the group to select
     */
    onSelectObject(objectToSelect: T): void {
        if (this.selectedObject.getIdentification() != objectToSelect.getIdentification()) {
            console.info(`${this.getBaseRoute()}/${objectToSelect.getIdentification()}`)
            this.location.replaceState(`${this.getBaseRoute()}/${objectToSelect.getIdentification()}`)
        }
        this.selectedObject = this.mapObject(objectToSelect)
        this.originalObject = objectToSelect;
        this.showObjectDetail = true;
        this.isNewObject = false;
    }

    /**
     * Determines wheter a given object is the selected one or not
     * @param objectToCheck The object to be checked
     * @returns true if the givenobject is the selected one. Otherwise false
     */
    isObjectSelected(objectToCheck: T): boolean {
        return this.selectedObject.getIdentification() == objectToCheck.getIdentification();
    }

    /**
     * Opens a snackbar with a message
     * @param message The message to show in the snackbar
     * @param action  The label for the snackbar action
     */
    protected openSnackBar(message: string, action: string): void {
        this.snackBar.open(message, action, {
            duration: 3000
        });
    }


    /**
     * @returns true if all required fields are set at selected object. Otherwise false
     */
    protected abstract checkRequiredFields(): boolean;

    /**
     * @returns true if the accept button should be disabled. Otherwise false.
     */
    disableAccept(): boolean {
        return this.disableAcceptNewObject() || this.disableAcceptExistingObject();
    }

    /**
     * @returns true if the delete button should be disabled. Otherwise false.
     */
    disableDelete(): boolean {
        return this.isNewObject;
    }

    /**
     * @returns true if the accept button should be disabled in case of an new created commonGroup. Otherwise false.
     */
    protected disableAcceptNewObject(): boolean {
        return this.isNewObject && !this.checkRequiredFields();
    }

    /**
     * @returns true if the accept button should be disabled in case of an existing created commonGroup. Otherwise false.
     */
    protected disableAcceptExistingObject(): boolean {
        return !this.isNewObject && (!this.checkRequiredFields() || this.selectedObject.equals(this.originalObject));
    }


    /**
     * Creates a new empty object
     */
    onCreateObject(): void {
        this.selectedObject = this.createNewEmptyObject();
        this.originalObject = undefined;
        this.showObjectDetail = true;
        this.isNewObject = true;
    }


    /**
     * Stores the modifications on an existing obejct or creates the new one at backend
     */
    onAccept(): void {
        if (this.disableAccept()) {
            this.openSnackBar(`You are not allowed to change ${this.selectedObject.getIdentification()} or nothing was changed`, 'Error');
            this.onCancel();
            return;
        }
        if (this.isNewObject) {
            this.onAcceptNewObject();
        } else {
            this.onAcceptExistingObject();
        }
    }

    /**
     * Creates a new object at backend
     */
    protected abstract onAcceptNewObject(): void;

    /**
     * Stores the modifications on an existing object
     */
    protected abstract onAcceptExistingObject(): void;


    /**
     * Deletes the selected object
     */
    onDelete(): void {
        if (this.disableDelete()) {
            this.openSnackBar(`You are not allowed to delete ${this.selectedObject.getIdentification()}`, 'Error');
            this.onCancel();
            return;
        }
        this.onDeleteExistingObject();
    }

    /**
     * Deletes the selected existing object
     */
    protected abstract onDeleteExistingObject(): void;

    /**
     * Cancels the modifications on an existing object or removes a the draft of a new created one 
     */
    onCancel(): void {
        this.showObjectDetail = false;
        this.isNewObject = false;
        this.originalObject = undefined;
        this.selectedObject = this.createNewEmptyObject();
    }

}