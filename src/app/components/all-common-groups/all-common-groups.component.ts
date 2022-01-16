import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CommonGroup } from '../../model/common-group.model';
import { Role } from '../../model/role.model';
import { Location } from '@angular/common';
import { CommonGroupService } from '../../services/backend/common-group.service';
import { SelectionService } from '../../services/util/selection.service';
import { COMMON_GROUPS_PATH } from '../../app-routing.module';
import { ListDetailComponent } from '../list-detail/list-detail.component';
import { ToolbarSite } from '../toolbar/toolbar-site';
import { CommonGroupPermissionsService } from '../../services/permissions/common-group-permissions.service';


interface RoleWithText {
  value: Role;
  text: string;
}


@Component({
  selector: 'app-all-common-groups',
  templateUrl: './all-common-groups.component.html',
  styleUrls: ['../list-detail/list-detail.component.less']
})
export class AllCommonGroupsComponent extends ListDetailComponent<CommonGroup>{
  allowedRoles: Role[] = [Role.ADMIN, Role.MANAGER, Role.CONTRIBUTOR, Role.VISITOR, Role.BLOCKED];
  roles: RoleWithText[] = [];
  public toolbarSite = ToolbarSite.COMMON_GROUPS;


  constructor(private selectionService: SelectionService, private commonGroupService: CommonGroupService
    , private commonGroupPermissionsService: CommonGroupPermissionsService, route: ActivatedRoute, location: Location, snackBar: MatSnackBar) {

    super(route, location, snackBar);
    for (let r of this.allowedRoles) {
      this.roles.push({ value: r, text: `${r}` } as RoleWithText);
    }
  }


  createNewEmptyObject(): CommonGroup {
    return {
      identification: '',
      equals: (other) => other == undefined,
      getIdentification: () => ''
    } as CommonGroup;
  }


  mapObject(source: CommonGroup): CommonGroup {
    return CommonGroup.map(source);
  }



  protected loadAllObjects(): void {
    console.debug("CommonGroupComponent: get all common groups from service");
    this.commonGroupService.getAllCommonGroups(undefined, undefined).subscribe(
      allCommonGroups => {
        console.debug("CommonGroupComponent: store all common groups from service");
        this.allObjectsfilterDataSource = new MatTableDataSource(allCommonGroups);
        this.allObjectsfilterDataSource.sort = this.sort;
        this.checkUrlId();
      }
    );
  }


  protected getBaseRoute(): string {
    return COMMON_GROUPS_PATH;
  }


  onSelectObjectTypeSpecific(objectToSelect: CommonGroup): void {
    this.selectionService.setSelectedCommonGroup(objectToSelect);
  }


  protected onAcceptNewObject(): void {
    this.commonGroupService.createCommonGroup(this.selectedObject.groupName)
      .subscribe(createdCommonGroup => {
        this.selectedObject.identification = createdCommonGroup.identification
        this.commonGroupService.updateCommonGroup(this.selectedObject)
          .subscribe(updatedCreatedommonGroup => {
            this.takeOverNewObject(updatedCreatedommonGroup);
          });
      });
  }


  protected onAcceptExistingObject(): void {
    this.commonGroupService.updateCommonGroup(this.selectedObject).subscribe(storedCommonGroup => {
      this.takeOverUpdatedObject(storedCommonGroup);
    });
  }


  protected onDeleteExistingObject(): void {
    this.commonGroupService.deleteCommonGroup(this.selectedObject.identification).subscribe(deleted => {
      this.removeDeltedObject(deleted);
    });
  }


  protected checkRequiredFields(): boolean {
    return this.selectedObject.groupName != undefined && this.selectedObject.groupName.length > 0
      && this.selectedObject.defaultRole != undefined && this.allowedRoles.includes(this.selectedObject.defaultRole);
  }


  disableCreateObject(): boolean { return !this.commonGroupPermissionsService.isAllowedCreateCommonGroup(); }


  disableDeleteObjectTypeSpecific(): boolean { return !this.commonGroupPermissionsService.isAllowedToDeleteCommonGroup(); }


  disableUpdateSelectedObject(): boolean { return !this.commonGroupPermissionsService.isAllowedToUpdateCommonGroup(this.selectedObject.identification); }
}
