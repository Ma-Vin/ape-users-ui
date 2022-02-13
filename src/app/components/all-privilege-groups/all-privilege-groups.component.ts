import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { PrivilegeGroup } from '../../model/privilege-group.model';
import { ListDetailComponent } from '../list-detail/list-detail.component';
import { ToolbarSite } from '../toolbar/toolbar-site';
import { PrivilegeGroupService } from '../../services/backend/privilege-group.service';
import { PrivilegeGroupPermissionsService } from '../../services/permissions/privilege-group-permissions.service';
import { MatTableDataSource } from '@angular/material/table';
import { PRIVILEGE_GROUPS_PATH } from '../../app-routing.module';
import { Role } from '../../model/role.model';

@Component({
  selector: 'app-all-privilege-groups',
  templateUrl: './all-privilege-groups.component.html',
  styleUrls: ['./all-privilege-groups.component.less']
})
export class AllPrivilegeGroupsComponent extends ListDetailComponent<PrivilegeGroup> {
  public toolbarSite = ToolbarSite.PRIVILEGE_GROUPS;
  public cleanFlattenSubGroupsTrigger = false;

  constructor(private privilegeGroupService: PrivilegeGroupService, private privilegeGroupPermissionsService: PrivilegeGroupPermissionsService
    , route: ActivatedRoute, location: Location, snackBar: MatSnackBar) {

    super(route, location, snackBar);
  }


  createNewEmptyObject(): PrivilegeGroup {
    return {
      identification: '',
      equals: (other) => other == undefined,
      getIdentification: () => ''
    } as PrivilegeGroup;
  }


  protected loadAllObjects(): void {
    console.debug("AllPrivilegeGroupsComponent: get all privilege groups from service");
    this.privilegeGroupService.getAllPrivilegeGroups(undefined, undefined).subscribe(
      allBaseGroups => {
        console.debug("AllPrivilegeGroupsComponent: store all privilege groups from service");
        this.allObjectsfilterDataSource = new MatTableDataSource(allBaseGroups);
        this.allObjectsfilterDataSource.sort = this.sort;
        this.checkUrlId();
      }
    );
  }


  mapObject(source: PrivilegeGroup): PrivilegeGroup {
    return PrivilegeGroup.map(source);
  }


  protected getBaseRoute(): string {
    return PRIVILEGE_GROUPS_PATH;
  }


  onSelectObjectTypeSpecific(objectToSelect: PrivilegeGroup): void { }


  disableCreateObject(): boolean {
    return !this.privilegeGroupPermissionsService.isAllowedCreatePrivilegeGroup();
  }


  protected disableUpdateSelectedObject(): boolean {
    return !this.privilegeGroupPermissionsService.isAllowedToUpdatePrivilegeGroup();
  }


  protected checkRequiredFields(): boolean {
    return this.selectedObject.groupName != undefined && this.selectedObject.groupName.length > 0;

  }


  disableDeleteObjectTypeSpecific(): boolean {
    return !this.privilegeGroupPermissionsService.isAllowedToDeletePrivilegeGroup();
  }


  protected onAcceptNewObject(): void {
    this.privilegeGroupService.createPrivilegeGroup(this.selectedObject.groupName)
      .subscribe(createdPrivilegeGroup => {
        this.selectedObject.identification = createdPrivilegeGroup.identification
        this.privilegeGroupService.updatePrivilegeGroup(this.selectedObject)
          .subscribe(updatedCreatedPrivilegeGroup => {
            this.takeOverNewObject(updatedCreatedPrivilegeGroup);
          });
      });
  }


  protected onAcceptExistingObject(): void {
    this.privilegeGroupService.updatePrivilegeGroup(this.selectedObject).subscribe(storedPrivilegeGroup => {
      this.takeOverUpdatedObject(storedPrivilegeGroup);
    });
  }


  protected onDeleteExistingObject(): void {
    this.privilegeGroupService.deletePrivilegeGroup(this.selectedObject.identification).subscribe(deletedPrivilegeGroup => {
      this.removeDeltedObject(deletedPrivilegeGroup);
    });
  }


  public getRole(roleName: string): Role {
    switch (roleName) {
      case 'ADMIN': return Role.ADMIN;
      case 'MANAGER': return Role.MANAGER;
      case 'CONTRIBUTOR': return Role.CONTRIBUTOR;
      case 'VISITOR': return Role.VISITOR;
      case 'BLOCKED': return Role.BLOCKED;
      default: return Role.NOT_RELEVANT;
    }
  }

  onCleanFlattenedGroups(): void {
    this.cleanFlattenSubGroupsTrigger = !this.cleanFlattenSubGroupsTrigger;
  }

}
