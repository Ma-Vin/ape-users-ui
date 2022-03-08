import { Component } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../model/user.model';
import { SelectionService } from '../../services/util/selection.service';
import { UserService } from '../../services/backend/user.service';
import { ListDetailComponent } from '../list-detail/list-detail.component';
import { USERS_PATH } from '../../app-routing.module';
import { Role } from '../../model/role.model';
import { ToolbarSite } from '../toolbar/toolbar-site';
import { UserPermissionsService } from '../../services/permissions/user-permissions.service';
import { Observable } from 'rxjs';


interface RoleWithText {
  value: Role;
  text: string;
}

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['../list-detail/list-detail.component.less']
})
export class AllUsersComponent extends ListDetailComponent<User> {
  public allowedRoles: Role[] = [Role.ADMIN, Role.MANAGER, Role.CONTRIBUTOR, Role.VISITOR, Role.BLOCKED];
  public roles: RoleWithText[] = [];
  public toolbarSite = ToolbarSite.USERS;
  public disableUpdateCreationRequired = false;
  public disableUpdateRole = false;

  private commonGroupId = '';
  private defaultRole = Role.NOT_RELEVANT;

  constructor(private selectionService: SelectionService, private userService: UserService
    , route: ActivatedRoute, location: Location, snackBar: MatSnackBar, private userPermissionSerivce: UserPermissionsService) {
    super(route, location, snackBar);
    for (let r of this.allowedRoles) {
      this.roles.push({ value: r, text: `${r}` } as RoleWithText);
    }
  }

  ngOnInit(): void {
    this.initCommonGroup()
    super.ngOnInit();
  }

  private initCommonGroup(): void {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return;
    }
    this.commonGroupId = commonGroup.identification;
    this.defaultRole = commonGroup.defaultRole;
  }

  createNewEmptyObject(): User {
    return {
      identification: '',
      role: this.defaultRole,
      equals: (other) => other == undefined,
      getIdentification: () => ''
    } as User;
  }

  disableCreateObject(): boolean {
    return !this.userPermissionSerivce.isAllowedToCreateUser();
  }

  protected loadAllObjects(): void {
    console.debug("AllUsersComponent: get all users from service");
    this.userService.getAllUsers(this.commonGroupId, undefined, undefined).subscribe(
      allUsers => {
        console.debug("AllUsersComponent: store all users from service");
        this.allObjectsfilterDataSource.data = allUsers;
        this.checkUrlId();
      }
    );
  }

  protected loadAllObjectParts(): void {
    this.loadAllObjects();
  }

  protected loadObject(identification: string): Observable<User> {
    console.debug("AllUsersComponent: get user from service");
    return this.userService.getUser(identification);
  }

  mapObject(source: User): User {
    return User.map(source);
  }

  protected getBaseRoute(): string {
    return USERS_PATH;
  }

  protected checkRequiredFields(): boolean {
    return this.selectedObject.firstName != undefined && this.selectedObject.firstName.length > 0
      && this.selectedObject.lastName != undefined && this.selectedObject.lastName.length > 0
      && this.selectedObject.role != undefined;
  }

  protected onAcceptNewObject(): void {
    this.userService.createUser(this.commonGroupId, this.selectedObject.firstName, this.selectedObject.lastName)
      .subscribe(createdUser => {
        this.selectedObject.identification = createdUser.identification
        this.updateUserAndTakeOver();
      });
  }

  protected onAcceptExistingObject(): void {
    this.updateUserAndTakeOver();
  }

  private updateUserAndTakeOver(): void {
    this.userService.updateUser(this.selectedObject)
      .subscribe(updatedUser => {
        if (this.selectedObject.role != undefined && this.selectedObject.role != updatedUser.role) {
          this.userService.setRole(updatedUser.identification, this.selectedObject.role).subscribe(
            roleAdopted => {
              if (roleAdopted) {
                updatedUser.role = this.selectedObject.role;
              }
              this.isNewObject ? this.takeOverNewObject(updatedUser) : this.takeOverUpdatedObject(updatedUser);
            }
          );
        } else {
          this.isNewObject ? this.takeOverNewObject(updatedUser) : this.takeOverUpdatedObject(updatedUser);
        }
      });
  }

  protected onDeleteExistingObject(): void {
    this.userService.deleteUser(this.selectedObject.identification)
      .subscribe(deleted => {
        this.removeDeltedObject(deleted);
      });
  }



  disableDeleteObjectTypeSpecific(): boolean {
    return !this.userPermissionSerivce.isAllowedToDeleteUser(this.selectedObject);
  }



  disableUpdateSelectedObject(): boolean {
    let updateAllowed = this.userPermissionSerivce.isAllowedToUpdateUser(this.selectedObject);
    this.disableUpdateCreationRequired = !(this.isNewObject || updateAllowed);
    this.disableUpdateRole = !this.userPermissionSerivce.isAllowedToSetRoleOfUser();
    return !updateAllowed;
  }


  onSelectObjectTypeSpecific(objectToSelect: User): void { }


  get lastLogin(): string {
    if (this.selectedObject.lastLogin == undefined) {
      return '';
    }
    let pipe = new DatePipe('de');
    let result = pipe.transform(this.selectedObject.lastLogin, 'short');
    return result == null ? '' : result;
  }

  set lastLogin(vaule: string) {
    throw new Error(`lastLogin was tried to be set: value=${vaule}`);
  }

}
