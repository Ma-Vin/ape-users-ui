import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { ADMIN_GROUP_PATH } from '../../app-routing.module';
import { ConfigService } from '../../config/config.service';
import { User } from '../../model/user.model';
import { AdminService } from '../../services/backend/admin.service';
import { SelectionService } from '../../services/util/selection.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ListDetailComponent } from '../list-detail/list-detail.component';
import { ToolbarSite } from '../toolbar/toolbar-site';


const placeHolderAdmin = {
  identification: 'NotValidIdentification',
  equals: (other) => other == undefined
} as User;

@Component({
  selector: 'app-admin-group',
  templateUrl: './admin-group.component.html',
  styleUrls: ['../list-detail/list-detail.component.less']
})
export class AdminGroupComponent extends ListDetailComponent<User> {
  private adminGroupId = '';
  public toolbarSite = ToolbarSite.ADMINS;

  constructor(private configService: ConfigService, private selectionService: SelectionService, private adminService: AdminService
    , route: ActivatedRoute, location: Location, snackBar: MatSnackBar) {

    super(route, location, snackBar);
  }


  ngOnInit(): void {
    this.initAdminGroup()
    super.ngOnInit();
  }


  createNewEmptyObject(): User {
    return User.map({
      identification: '',
      isGlobalAdmin: true
    } as User);
  }


  protected getBaseRoute(): string {
    return ADMIN_GROUP_PATH;
  }

  /**
   * Initialize all values relevant to the admin group
   */
  private initAdminGroup(): void {
    let config = this.configService.getConfig();
    if (config == undefined) {
      return;
    }
    this.adminGroupId = config.adminGroupId;
    this.adminService.getAdminGroup(this.adminGroupId).subscribe(group => this.selectionService.setSelectedAdminGroup(group));
  }


  protected loadAllObjects(): void {
    console.debug("AdminGroupComponent: get all admins from service");
    this.adminService.getAllAdmins(this.adminGroupId, undefined, undefined).subscribe(
      allAdmins => {
        console.debug("AdminGroupComponent: store all admins from service");
        this.allObjectsfilterDataSource.data = allAdmins;
        this.checkUrlId();
      }
    );
  }

  mapObject(source: User) {
    return User.map(source);
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



  protected onAcceptNewObject(): void {
    let adminGroup = this.selectionService.getSelectedAdminGroup();
    if (adminGroup == undefined) {
      throw new Error('There should be any admin group where to add new admin');
    }
    this.adminService.createAdmin(adminGroup.identification, this.selectedObject.firstName, this.selectedObject.lastName)
      .subscribe(createdAdmin => {
        this.selectedObject.identification = createdAdmin.identification;
        this.adminService.updateAdmin(this.selectedObject)
          .subscribe(updatedCreatedAdmin => {
            this.takeOverNewObject(updatedCreatedAdmin);
          });
      });
  }


  protected onAcceptExistingObject(): void {
    this.adminService.updateAdmin(this.selectedObject).subscribe(storedAdmin => {
      this.takeOverUpdatedObject(storedAdmin);
    });
  }


  protected onDeleteExistingObject(): void {
    this.adminService.deleteAdmin(this.selectedObject.identification).subscribe(deleted => {
      this.removeDeltedObject(deleted);
    });
  }


  disableDeleteObjectTypeSpecific(): boolean {
    let activeUser = this.selectionService.getActiveUser();
    return activeUser == undefined || activeUser.identification == this.selectedObject.identification;
  }


  disableUpdateSelectedObject(): boolean { return false; }


  /**
   * @returns true if all required fields are set. Otherwise false
   */
  protected checkRequiredFields(): boolean {
    return this.selectedObject.firstName != undefined && this.selectedObject.firstName.length > 0
      && this.selectedObject.lastName != undefined && this.selectedObject.lastName.length > 0;
  }

  onSelectObjectTypeSpecific(objectToSelect: User): void { }

}
