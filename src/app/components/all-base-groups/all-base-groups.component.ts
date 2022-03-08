import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BaseGroup } from 'src/app/model/base-group.model';
import { BaseGroupService } from 'src/app/services/backend/base-group.service';
import { ListDetailComponent } from '../list-detail/list-detail.component';
import { BaseGroupPermissionsService } from 'src/app/services/permissions/base-group-permissions.service';
import { BASE_GROUPS_PATH } from 'src/app/app-routing.module';
import { ToolbarSite } from '../toolbar/toolbar-site';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-all-base-groups',
  templateUrl: './all-base-groups.component.html',
  styleUrls: ['../list-detail/list-detail.component.less']
})
export class AllBaseGroupsComponent extends ListDetailComponent<BaseGroup> {
  public toolbarSite = ToolbarSite.BASE_GROUPS;

  constructor(private baseGroupService: BaseGroupService, private baseGroupPermissionsService: BaseGroupPermissionsService
    , route: ActivatedRoute, location: Location, snackBar: MatSnackBar) {

    super(route, location, snackBar);

  }


  createNewEmptyObject(): BaseGroup {
    return {
      identification: '',
      equals: (other) => other == undefined,
      getIdentification: () => ''
    } as BaseGroup;
  }


  protected loadAllObjects(): void {
    console.debug("AllBaseGroupsComponent: get all base groups from service");
    this.baseGroupService.getAllBaseGroups(undefined, undefined).subscribe(
      allBaseGroups => {
        console.debug("AllBaseGroupsComponent: store all base groups from service");
        this.allObjectsfilterDataSource.data = allBaseGroups;
        this.checkUrlId();
      }
    );
  }

  protected loadAllObjectParts(): void {
    console.debug("AllBaseGroupsComponent: get all base group parts from service");
    this.baseGroupService.getAllBaseGroupParts(undefined, undefined).subscribe(
      allBaseGroups => {
        console.debug("AllBaseGroupsComponent: store all base group parts from service");
        this.allObjectsfilterDataSource.data = allBaseGroups;
        this.checkUrlId();
      }
    );
  }

  protected loadObject(identification: string): Observable<BaseGroup> {
    console.debug("AllBaseGroupsComponent: get base group from service");
    return this.baseGroupService.getBaseGroup(identification);
  }


  mapObject(source: BaseGroup): BaseGroup {
    return BaseGroup.map(source);
  }


  protected getBaseRoute(): string {
    return BASE_GROUPS_PATH;
  }


  onSelectObjectTypeSpecific(objectToSelect: BaseGroup): void { }


  disableCreateObject(): boolean {
    return !this.baseGroupPermissionsService.isAllowedCreateBaseGroup();
  }


  protected disableUpdateSelectedObject(): boolean {
    return !this.baseGroupPermissionsService.isAllowedToUpdateBaseGroup();
  }


  protected checkRequiredFields(): boolean {
    return this.selectedObject.groupName != undefined && this.selectedObject.groupName.length > 0;

  }


  disableDeleteObjectTypeSpecific(): boolean {
    return !this.baseGroupPermissionsService.isAllowedToDeleteBaseGroup();
  }


  protected onAcceptNewObject(): void {
    this.baseGroupService.createBaseGroup(this.selectedObject.groupName)
      .subscribe(createdBaseGroup => {
        this.selectedObject.identification = createdBaseGroup.identification
        this.baseGroupService.updateBaseGroup(this.selectedObject)
          .subscribe(updatedCreatedBaseGroup => {
            this.takeOverNewObject(updatedCreatedBaseGroup);
          });
      });
  }


  protected onAcceptExistingObject(): void {
    this.baseGroupService.updateBaseGroup(this.selectedObject).subscribe(storedBaseGroup => {
      this.takeOverUpdatedObject(storedBaseGroup);
    });
  }


  protected onDeleteExistingObject(): void {
    this.baseGroupService.deleteBaseGroup(this.selectedObject.identification).subscribe(deletedBaseGroup => {
      this.removeDeltedObject(deletedBaseGroup);
    });
  }

}
