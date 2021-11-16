import { Component } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/model/user.model';
import { SelectionService } from 'src/app/services/selection.service';
import { UserService } from 'src/app/services/user.service';
import { ListDetailComponent } from '../list-detail/list-detail.component';
import { USERS_PATH } from 'src/app/app-routing.module';
import { Role } from 'src/app/model/role.model';
import { MatTableDataSource } from '@angular/material/table';
import { ToolbarSite } from '../toolbar/toolbar-site';


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

  private commonGroupId = '';
  private defaultRole = Role.NOT_RELEVANT;

  constructor(private selectionService: SelectionService, private userService: UserService
    , route: ActivatedRoute, location: Location, snackBar: MatSnackBar) {
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

  createDisplayedColumns(): string[] {
    return ['identification', 'firstName', 'lastName'];
  }

  protected loadAllObjects(): void {
    console.debug("AllUsersComponent: get all users from service");
    this.userService.getAllUsers(this.commonGroupId, undefined, undefined).subscribe(
      allUsers => {
        console.debug("AllUsersComponent: store all users from service");
        this.allObjectsfilterDataSource = new MatTableDataSource(allUsers);
        this.allObjectsfilterDataSource.sort = this.sort;
        this.checkUrlId();
      }
    );
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
        this.userService.updateUser(this.selectedObject)
          .subscribe(updatedCreatedUser => {
            this.takeOverNewObject(updatedCreatedUser);
          });
      });
  }

  protected onAcceptExistingObject(): void {
    this.userService.updateUser(this.selectedObject)
      .subscribe(updatedCreatedUser => {
        this.takeOverUpdatedObject(updatedCreatedUser);
      });
  }

  protected onDeleteExistingObject(): void {
    this.userService.deleteUser(this.selectedObject.identification)
      .subscribe(deleted => {
        this.removeDeltedObject(deleted);
      });
  }

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
