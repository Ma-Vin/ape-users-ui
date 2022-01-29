import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IAbstractGroup } from 'src/app/model/abstract-group.model';
import { BaseGroup } from 'src/app/model/base-group.model';
import { PrivilegeGroup } from 'src/app/model/privilege-group.model';
import { Role } from 'src/app/model/role.model';
import { BaseGroupService } from 'src/app/services/backend/base-group.service';
import { BaseGroupPermissionsService } from 'src/app/services/permissions/base-group-permissions.service';
import { AddBaseGroupDialogComponent, AddBaseGroupDialogData } from '../add-base-group-dialog/add-base-group-dialog.component';

@Component({
  selector: 'app-sub-base-groups',
  templateUrl: './sub-base-groups.component.html',
  styleUrls: ['./sub-base-groups.component.less']
})
export class SubBaseGroupsComponent implements OnInit, OnChanges {

  displayedSubGroupColumns: string[] = ['identification', 'groupName'];

  @Input() selectedBaseGroup: BaseGroup | undefined;
  @Input() selectedPrivilegeGroup: PrivilegeGroup | undefined;
  @Input() role: Role | undefined;

  selectedSubGroup: BaseGroup | undefined;
  subgroupDataSource: MatTableDataSource<BaseGroup> = new MatTableDataSource<BaseGroup>([]);
  @ViewChild('subgroupTableSort', { static: false }) subGroupSort!: MatSort;
  @ViewChild('subgroupTableMatPaginator', { static: false }) subgroupPaginator!: MatPaginator;

  constructor(private baseGroupService: BaseGroupService, private baseGroupPermissionsService: BaseGroupPermissionsService
    , public dialog: MatDialog, private snackBar: MatSnackBar) { }


  public ngOnInit() {
    this.loadAllObjects();
  }

  
  public ngOnChanges(changes: SimpleChanges): void {
    this.loadAllObjects();
  }



  /**
   * Loads all relevant sub groubs either from the selected base or privilege group
   */
  private loadAllObjects(): void {
    if (this.selectedBaseGroup != undefined) {
      this.loadAllBasesFromBaseGroup(this.selectedBaseGroup.identification);
    }
    if (this.selectedPrivilegeGroup != undefined && this.role != undefined) {
      this.loadAllBasesFromPrivilegeGroup(this.selectedPrivilegeGroup.identification, this.role);
    }
  }


  /**
   * Loads all sub base groups from an other base one
   * @param identification the identification of the parent base group
   */
  private loadAllBasesFromBaseGroup(identification: string): void {
    this.baseGroupService.getAllBasesAtBaseGroup(identification, undefined, undefined).subscribe(
      groups => {
        this.subgroupDataSource = new MatTableDataSource(groups);
        this.subgroupDataSource.paginator = this.subgroupPaginator;
        this.subgroupDataSource.sort = this.subGroupSort;
      }
    );
  }


  /**
   * Loads all sub base groups of a given role from a privilege one
   * @param identification the identification of the parent privilege group
   * @param role the role to load
   */
  private loadAllBasesFromPrivilegeGroup(identification: string, role: Role): void {
    this.baseGroupService.getAllBasesAtPrivilegeGroup(identification, role, undefined, undefined).subscribe(
      groups => {
        this.subgroupDataSource = new MatTableDataSource(groups);
        this.subgroupDataSource.paginator = this.subgroupPaginator;
        this.subgroupDataSource.sort = this.subGroupSort;
      }
    );
  }


  /**
   * @returns true if the user is allowed to see sub base groups. Otherwise false
   */
  public showSubBaseGroups(): boolean {
    return (this.selectedBaseGroup != undefined && this.baseGroupPermissionsService.isAllowedToGetAllBasesAtBaseGroup())
      || (this.selectedPrivilegeGroup != undefined && this.role != undefined && this.baseGroupPermissionsService.isAllowedToGetAllBasesAtPrivilegeGroup());
  }


  /**
   * Selects and unselects a basegroup
   * @param baseGroup the base group to select or unselect
   */
  public onSelectSubGroup(baseGroup: BaseGroup): void {
    if (this.isSubGroupSelected(baseGroup)) {
      this.selectedSubGroup = undefined;
      return;
    }
    this.selectedSubGroup = BaseGroup.map(baseGroup)
  }


  /**
   * Checks whether a given subgroup is selected or not
   * @param baseGroup the base group to check
   * @returns true if the identification of the selected group equals the given one. Otherwise false
   */
  public isSubGroupSelected(baseGroup: BaseGroup): boolean {
    return this.selectedSubGroup != undefined && baseGroup.identification == this.selectedSubGroup.identification;
  }


  /**
   * Opens a sub dialog to add other base groups to the selected one
   */
  public openAddSubGroupDialog(): void {
    const dialogRef: MatDialogRef<AddBaseGroupDialogComponent, BaseGroup[]> = this.dialog.open(AddBaseGroupDialogComponent, {
      width: '500px',
      maxHeight: '1000px',
      data: this.getDialogData()
    });

    dialogRef.afterClosed().subscribe((result: BaseGroup[] | undefined) => {
      if (result == undefined) {
        return;
      }
      for (let group of result) {
        if (this.selectedBaseGroup != undefined) {
          this.addBaseToBaseGroup(this.selectedBaseGroup.identification, group);
        }
        if (this.selectedPrivilegeGroup != undefined && this.role != undefined) {
          this.addBaseToPrivilegeGroup(this.selectedPrivilegeGroup.identification, this.role, group);
        }
      }
    });
  }


  /**
   * Adds a given base group to an other one
   * @param identification the identification of the parent base group
   * @param groupToAdd the base group to add
   */
  private addBaseToBaseGroup(identification: string, groupToAdd: BaseGroup): void {
    this.baseGroupService.addBaseToBaseGroup(groupToAdd.identification, identification).subscribe(added => {
      if (added) {
        this.subgroupDataSource.data.push(groupToAdd);
        this.subgroupDataSource.data = this.subgroupDataSource.data.slice();
      } else {
        this.openSnackBar(`The base group ${groupToAdd.identification} was not added to the other one ${identification}`, 'Error');
      }
    });
  }


  /**
   * Adds a given base group to a privilege one
   * @param identification the identification of the parent privilege group
   * @param role the role of the base group at the privilege one
   * @param groupToAdd the base group to add
   */
  private addBaseToPrivilegeGroup(identification: string, role: Role, groupToAdd: BaseGroup): void {
    this.baseGroupService.addBaseToPrivilegeGroup(groupToAdd.identification, identification, role).subscribe(added => {
      if (added) {
        this.subgroupDataSource.data.push(groupToAdd);
        this.subgroupDataSource.data = this.subgroupDataSource.data.slice();
      } else {
        this.openSnackBar(`The base group ${groupToAdd.identification} was not added with role ${role} to the privilege one ${identification}`, 'Error');
      }
    });
  }


  /**
   * @returns true if the button to add a base group should be disabled. Otherwise false
   */
  public disableAddBaseGroup(): boolean {
    return !((this.selectedBaseGroup != undefined && this.baseGroupPermissionsService.isAllowedToAddBaseToBaseGroup())
      || (this.selectedPrivilegeGroup != null && this.role != undefined && this.baseGroupPermissionsService.isAllowedToAddBaseToPrivilegeGroup()));
  }

  /**
   * @returns the data for the add dialog
   */
  private getDialogData(): AddBaseGroupDialogData {
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
   * Removes the selected sub group from the parent base or privilege group
   */
  public removeSubGroup(): void {
    if (this.selectedSubGroup == undefined) {
      return;
    }
    if (this.selectedBaseGroup != undefined) {
      this.baseGroupService.removeBaseFromBaseGroup(this.selectedSubGroup.identification, this.selectedBaseGroup.identification).subscribe(
        removed => {
          if (removed) {
            this.removeFromSubgroups(this.selectedSubGroup!.identification);
            this.selectedSubGroup = undefined;
          } else {
            this.openSnackBar(`The base group ${this.selectedSubGroup?.identification} was not removed from the other one ${this.selectedBaseGroup?.identification}`, 'Error')
          }
        });
    }
    if (this.selectedPrivilegeGroup != undefined) {
      this.baseGroupService.removeBaseFromPrivilegeGroup(this.selectedSubGroup.identification, this.selectedPrivilegeGroup.identification).subscribe(
        removed => {
          if (removed) {
            this.removeFromSubgroups(this.selectedSubGroup!.identification);
            this.selectedSubGroup = undefined;
          } else {
            this.openSnackBar(`The base group ${this.selectedSubGroup?.identification} was not removed from the privilege one ${this.selectedBaseGroup?.identification}`, 'Error')
          }
        });
    }
  }


  /**
   * Removes a base group from the list of all subgroups
   * @param identification the identification of the subgroup to remove
   */
  private removeFromSubgroups(identification: string): void {
    for (let i = 0; i < this.subgroupDataSource.data.length; i++) {
      if (this.subgroupDataSource.data[i].getIdentification() == identification) {
        this.subgroupDataSource.data.splice(i, 1);
        this.subgroupDataSource.sort = this.subGroupSort;
        break;
      }
    }
    this.subgroupDataSource.data = this.subgroupDataSource.data.slice();
  }


  /**
   * @returns true if the button to remove a base group should be disabled. Otherwise false
   */
  public disableRemoveBaseGroup(): boolean {
    return this.selectedSubGroup == undefined || !((this.selectedBaseGroup != undefined && this.baseGroupPermissionsService.isAllowedToRemoveBaseFromBaseGroup())
      || (this.selectedPrivilegeGroup != null && this.role != undefined && this.baseGroupPermissionsService.isAllowedToRemoveBaseFromBPrivilegeGroup()));
  }


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
