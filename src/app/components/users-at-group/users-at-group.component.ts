import { ComponentType } from '@angular/cdk/portal';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Role } from '../../model/role.model';
import { User } from '../../model/user.model';
import { UserService } from '../../services/backend/user.service';
import { UserPermissionsService } from '../../services/permissions/user-permissions.service';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { ElementsAtGroupComponent } from '../elements-at-group/elements-at-group.component';

@Component({
  selector: 'app-users-at-group',
  templateUrl: './users-at-group.component.html',
  styleUrls: ['./users-at-group.component.less']
})
export class UsersAtGroupComponent extends ElementsAtGroupComponent<User, AddUserDialogComponent> {

  constructor(private userService: UserService, private userPermissionsService: UserPermissionsService
    , public dialog: MatDialog, protected snackBar: MatSnackBar) {
    super(dialog, snackBar);
  }

  protected getElementText(): string {
    return 'user';
  }

  protected getDisplayedColumns(): string[] {
    return ['identification', 'firstName', 'lastName'];
  }

  protected loadAllElementsFromBaseGroup(identification: string): Observable<User[]> {
    return this.userService.getAllUsersFromBaseGroup(identification, undefined, undefined);
  }


  protected loadAllElementsFromPrivilegeGroup(identification: string, role: Role): Observable<User[]> {
    return this.userService.getAllUsersFromPrivilegeGroup(identification, false, role, undefined, undefined);
  }


  protected isAllowedToGetAllElementsFromBaseGroup(): boolean {
    return this.userPermissionsService.isAllowedToGetAllUsersAtBaseGroup();
  }


  protected isAllowedToGetAllElementsFromPrivilegeGroup(): boolean {
    return this.userPermissionsService.isAllowedToGetAllUsersAtPrivilegeGroup();
  }


  protected map(toMap: User): User {
    return User.map(toMap);
  }

  protected getDialogComponentTyp(): ComponentType<AddUserDialogComponent> {
    return AddUserDialogComponent;
  }

  protected isAllowedToAddAnElementToBaseGroup(): boolean {
    return this.userPermissionsService.isAllowedToAddUserToBaseGroup();
  }

  protected isAllowedToAddAnElementToPrivilegeGroup(): boolean {
    return this.userPermissionsService.isAllowedToAddUserToPrivilegeGroup();
  }

  protected addElementToBaseGroup(elementIdentification: string, baseGroupIdentification: string): Observable<boolean> {
    return this.userService.addUserToBaseGroup(elementIdentification, baseGroupIdentification);
  }


  protected addElementToPrivilegeGroup(elementIdentification: string, privilegeGroupIdentification: string, role: Role): Observable<boolean> {
    return this.userService.addUserToPrivilegeGroup(elementIdentification, privilegeGroupIdentification, role);
  }


  protected removeElementFromBaseGroup(elementIdentification: string, baseGroupIdentification: string): Observable<boolean> {
    return this.userService.removeUserFromBaseGroup(elementIdentification, baseGroupIdentification);
  }


  protected removeElementFromPrivilegeGroup(elementIdentification: string, privilegeGroupIdentification: string): Observable<boolean> {
    return this.userService.removeUserFromPrivilegeGroup(elementIdentification, privilegeGroupIdentification);
  }


  protected isAllowedToRemoveAnElementFromBaseGroup(): boolean {
    return this.userPermissionsService.isAllowedToRemoveUserFromBaseGroup();
  }


  protected isAllowedToRemoveAnElementFromPrivilegeGroup(): boolean {
    return this.userPermissionsService.isAllowedToRemoveUserFromPrivilegeGroup();
  }

}