import { ComponentType } from '@angular/cdk/portal';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { BaseGroup } from '../../model/base-group.model';
import { Role } from '../../model/role.model';
import { BaseGroupService } from '../../services/backend/base-group.service';
import { BaseGroupPermissionsService } from '../../services/permissions/base-group-permissions.service';
import { AddBaseGroupDialogComponent } from '../add-base-group-dialog/add-base-group-dialog.component';
import { ElementsAtGroupComponent } from '../elements-at-group/elements-at-group.component';

@Component({
  selector: 'app-sub-base-groups',
  templateUrl: './sub-base-groups.component.html',
  styleUrls: ['./sub-base-groups.component.less']
})
export class SubBaseGroupsComponent extends ElementsAtGroupComponent<BaseGroup, AddBaseGroupDialogComponent> {

  constructor(private baseGroupService: BaseGroupService, private baseGroupPermissionsService: BaseGroupPermissionsService
    , public dialog: MatDialog, protected snackBar: MatSnackBar) {
    super(dialog, snackBar);
  }


  protected getElementText(): string {
    return 'base group';
  }


  protected getDisplayedColumns(): string[] {
    return ['identification', 'groupName'];
  }


  protected loadAllElementsFromBaseGroup(identification: string): Observable<BaseGroup[]> {
    return this.baseGroupService.getAllBasesAtBaseGroup(identification, undefined, undefined);
  }


  protected loadAllElementsFromPrivilegeGroup(identification: string, role: Role): Observable<BaseGroup[]> {
    return this.baseGroupService.getAllBasesAtPrivilegeGroup(identification, role, undefined, undefined);
  }


  protected isAllowedToGetAllElementsFromBaseGroup(): boolean {
    return this.baseGroupPermissionsService.isAllowedToGetAllBasesAtBaseGroup();
  }


  protected isAllowedToGetAllElementsFromPrivilegeGroup(): boolean {
    return this.baseGroupPermissionsService.isAllowedToGetAllBasesAtPrivilegeGroup();
  }


  protected map(toMap: BaseGroup): BaseGroup {
    return BaseGroup.map(toMap);
  }

  protected getDialogComponentTyp(): ComponentType<AddBaseGroupDialogComponent> {
    return AddBaseGroupDialogComponent;
  }

  protected isAllowedToAddAnElementToBaseGroup(): boolean {
    return this.baseGroupPermissionsService.isAllowedToAddBaseToBaseGroup();
  }

  protected isAllowedToAddAnElementToPrivilegeGroup(): boolean {
    return this.baseGroupPermissionsService.isAllowedToAddBaseToPrivilegeGroup();
  }

  protected addElementToBaseGroup(elementIdentification: string, baseGroupIdentification: string): Observable<boolean> {
    return this.baseGroupService.addBaseToBaseGroup(elementIdentification, baseGroupIdentification);
  }


  protected addElementToPrivilegeGroup(elementIdentification: string, privilegeGroupIdentification: string, role: Role): Observable<boolean> {
    return this.baseGroupService.addBaseToPrivilegeGroup(elementIdentification, privilegeGroupIdentification, role);
  }


  protected removeElementFromBaseGroup(elementIdentification: string, baseGroupIdentification: string): Observable<boolean> {
    return this.baseGroupService.removeBaseFromBaseGroup(elementIdentification, baseGroupIdentification);
  }


  protected removeElementFromPrivilegeGroup(elementIdentification: string, privilegeGroupIdentification: string): Observable<boolean> {
    return this.baseGroupService.removeBaseFromPrivilegeGroup(elementIdentification, privilegeGroupIdentification);
  }


  protected isAllowedToRemoveAnElementFromBaseGroup(): boolean {
    return this.baseGroupPermissionsService.isAllowedToRemoveBaseFromBaseGroup();
  }


  protected isAllowedToRemoveAnElementFromPrivilegeGroup(): boolean {
    return this.baseGroupPermissionsService.isAllowedToRemoveBaseFromBPrivilegeGroup();
  }


}
