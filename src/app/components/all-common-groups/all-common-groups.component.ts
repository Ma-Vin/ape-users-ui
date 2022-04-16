import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CommonGroup } from '../../model/common-group.model';
import { Role } from '../../model/role.model';
import { Location } from '@angular/common';
import { CommonGroupService } from '../../services/backend/common-group.service';
import { SelectionService } from '../../services/util/selection.service';
import { COMMON_GROUPS_PATH, HISTORY_DIALOG_MAX_HEIGHT, HISTORY_DIALOG_WIDTH } from '../../app-constants';
import { ListDetailComponent } from '../list-detail/list-detail.component';
import { ToolbarSite } from '../toolbar/toolbar-site';
import { CommonGroupPermissionsService } from '../../services/permissions/common-group-permissions.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CommonGroupHistoryComponent } from '../history/common-group-history/common-group-history.component';


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
  public allowedRoleTexts: string[] = ['Admin', 'Manager', 'Contributor', 'Vistor', 'Blocked'];
  roles: RoleWithText[] = [];
  public toolbarSite = ToolbarSite.COMMON_GROUPS;


  constructor(private selectionService: SelectionService, private commonGroupService: CommonGroupService
    , private commonGroupPermissionsService: CommonGroupPermissionsService, route: ActivatedRoute, location: Location, snackBar: MatSnackBar, public dialog: MatDialog) {

    super(route, location, snackBar);
    for (let i = 0; i < this.allowedRoles.length; i++) {
      this.roles.push({ value: this.allowedRoles[i], text: this.allowedRoleTexts[i] } as RoleWithText);
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
        this.allObjectsfilterDataSource.data = allCommonGroups;
        this.checkUrlId();
      }
    );
  }

  protected loadAllObjectParts(): void {
    console.debug("CommonGroupComponent: get all common group parts from service");
    this.commonGroupService.getAllCommonGroupParts(undefined, undefined).subscribe(
      allCommonGroups => {
        console.debug("CommonGroupComponent: store all common group parts from service");
        this.allObjectsfilterDataSource.data = allCommonGroups;
        this.checkUrlId();
      }
    );
  }

  protected loadObject(identification: string): Observable<CommonGroup> {
    console.debug("CommonGroupComponent: get  common group from service");
    return this.commonGroupService.getCommonGroup(identification);
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

  protected openHistoryDialog(): void {
    this.dialog.open(CommonGroupHistoryComponent, {
      width: HISTORY_DIALOG_WIDTH,
      maxHeight: HISTORY_DIALOG_MAX_HEIGHT,
      data: this.selectedObject
    });
  }
}
