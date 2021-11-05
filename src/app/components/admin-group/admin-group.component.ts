import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { ADMIN_GROUP_PATH } from 'src/app/app-routing.module';
import { ConfigService } from 'src/app/config/config.service';
import { User } from 'src/app/model/user.model';
import { AdminService } from 'src/app/services/admin.service';
import { SelectionService } from 'src/app/services/selection.service';
import { MatSnackBar } from '@angular/material/snack-bar';


const placeHolderAdmin = {
  identification: 'NotValidIdentification',
  equals: (other) => other == undefined
} as User;

@Component({
  selector: 'app-admin-group',
  templateUrl: './admin-group.component.html',
  styleUrls: ['./admin-group.component.less']
})
export class AdminGroupComponent implements OnInit {
  @Input() @Output() selectedAdmin: User;
  private originalUser: User | undefined;
  showAdminDetail: boolean;
  isNewAdmin = false;
  private adminGroupId = '';


  allAdminsDisplayedColumns: string[] = ['identification', 'firstName', 'lastName'];
  allAdminsfilterDataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);
  @ViewChild('tableAllAdminsSort', { static: false }) sort: MatSort | null = null;
  @ViewChild('tableAllAdminsTable', { static: false }) table: MatTable<User> | undefined;


  constructor(private configService: ConfigService, private selectionService: SelectionService, private adminService: AdminService
    , private route: ActivatedRoute, private location: Location, private snackBar: MatSnackBar) {

    this.selectedAdmin = placeHolderAdmin;
    this.showAdminDetail = false;
  }


  ngOnInit(): void {
    this.initAdminGroup()
    this.loadAllAdmins();
    this.isNewAdmin = false;
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

  /**
   * Applies a value at the filter of the datasource with all admins
   * @param event Event with the value to use at filter.
   */
  applyAllAdminsFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.allAdminsfilterDataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Loads all admins and adds them to the filtered datasource
   */
  private loadAllAdmins(): void {
    console.debug("AdminGroupComponent: get all admins from service");
    this.adminService.getAllAdmins(this.adminGroupId, undefined, undefined).subscribe(
      allAdmins => {
        console.debug("AdminGroupComponent: store all admins from service");
        this.allAdminsfilterDataSource = new MatTableDataSource(allAdmins);
        this.allAdminsfilterDataSource.sort = this.sort;
        this.checkUrlId();
      }
    );
  }

  /**
   * Checks if there exists a identification of an admin at url. If there ist one the coresponding admin will be selected
   */
  private checkUrlId(): void {
    if (!this.route.snapshot.paramMap.has('id')) {
      return;
    }
    let id = this.route.snapshot.paramMap.get('id');
    for (let admin of this.allAdminsfilterDataSource.data) {
      if (admin.identification == id) {
        this.onSelectAdmin(admin);
        break;
      }
    }
  }

  /**
   * Selects a given admin
   * @param admin the admin to select
   */
  onSelectAdmin(admin: User): void {
    if (this.selectedAdmin.identification != admin.identification) {
      this.location.replaceState(`${ADMIN_GROUP_PATH}/${admin.identification}`)
    }
    this.selectedAdmin = User.map(admin);
    this.originalUser = admin;
    this.showAdminDetail = true;
    this.isNewAdmin = false;
  }

  /**
   * Determines wheter a given admin is the selected one or not
   * @param admin The admin to be checked
   * @returns true if the given admin is the selected one. Otherwise false
   */
  isAdminSelected(admin: User): boolean {
    return this.selectedAdmin.identification == admin.identification;
  }


  get lastLogin(): string {
    if (this.selectedAdmin.lastLogin == undefined) {
      return '';
    }
    let pipe = new DatePipe('de');
    let result = pipe.transform(this.selectedAdmin.lastLogin, 'short');
    return result == null ? '' : result;
  }

  set lastLogin(vaule: string) {
    throw new Error(`lastLogin was tried to be set: value=${vaule}`);
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

  /**
   * Creates a new empty admin
   */
  onCreateAdmin(): void {
    this.selectedAdmin = {} as User;
    this.originalUser = undefined;
    this.showAdminDetail = true;
    this.isNewAdmin = true;
  }


  /**
   * Stores the modifications on an existing admin or creates the new one at backend
   */
  onAccept(): void {
    if (this.disableAccept()) {
      this.openSnackBar(`You are not allowed to change admin ${this.selectedAdmin.identification} or nothing was changed`, 'Error');
      this.onCancel();
      return;
    }
    if (this.isNewAdmin) {
      this.onAcceptNewAdmin();
    } else {
      this.onAcceptExistingAdmin();
    }
  }

  /**
   * Creates a new admin at backend
   */
  private onAcceptNewAdmin(): void {
    let adminGroup = this.selectionService.getSelectedAdminGroup();
    if (adminGroup == undefined) {
      throw new Error('There should be any admin group where to add new admin');
    }
    this.adminService.createAdmin(adminGroup.identification, this.selectedAdmin.firstName, this.selectedAdmin.lastName)
      .subscribe(addedAdmin => {
        this.allAdminsfilterDataSource.data.push(addedAdmin);
        this.allAdminsfilterDataSource.sort = this.sort;
        this.table?.renderRows();
        this.onSelectAdmin(addedAdmin);
      });
  }

  /**
   * Stores the modifications on an existing admin
   */
  private onAcceptExistingAdmin(): void {
    this.adminService.updateAdmin(this.selectedAdmin).subscribe(storedAdmin => {
      for (let i = 0; i < this.allAdminsfilterDataSource.data.length; i++) {
        if (this.allAdminsfilterDataSource.data[i].identification == this.selectedAdmin.identification) {
          this.allAdminsfilterDataSource.data[i] = storedAdmin;
          this.allAdminsfilterDataSource.sort = this.sort;
          this.table?.renderRows();
          this.onSelectAdmin(storedAdmin);
          break;
        }
      }
    });
  }

  /**
   * Cancels the modifications on an existing admin or removes a the draft of a new created one 
   */
  onCancel(): void {
    this.showAdminDetail = false;
    this.isNewAdmin = false;
    this.originalUser = undefined;
    this.selectedAdmin = placeHolderAdmin;
  }

  /**
   * Deletes the selected existing admin
   */
  onDelete(): void {
    if (this.disableDelete()) {
      this.openSnackBar(`You are not allowed to delete admin ${this.selectedAdmin.identification}`, 'Error');
      this.onCancel();
      return;
    }
    this.adminService.deleteAdmin(this.selectedAdmin.identification).subscribe(deleted => {
      if (deleted) {
        for (let i = 0; i < this.allAdminsfilterDataSource.data.length; i++) {
          if (this.allAdminsfilterDataSource.data[i].identification == this.selectedAdmin.identification) {
            this.allAdminsfilterDataSource.data.splice(i, 1);
            this.allAdminsfilterDataSource.sort = this.sort;
            this.table?.renderRows();
            this.onCancel();
            break;
          }
        }
      } else {
        this.openSnackBar(`The admin ${this.selectedAdmin.identification} was not deleted`, 'Error');
      }
    });
  }

  /**
   * @returns true if the accept button should be disabled. Otherwise false.
   */
  disableAccept(): boolean {
    return this.disableAcceptNewAdmin() || this.disableAcceptExistingAdmin();
  }

  /**
   * @returns true if the delete button should be disabled. Otherwise false.
   */
  disableDelete(): boolean {
    let activeUser = this.selectionService.getActiveUser();
    return this.isNewAdmin || activeUser == undefined || activeUser.identification == this.selectedAdmin.identification;
  }

  /**
   * @returns true if the accept button should be disabled in case of an new created admin. Otherwise false.
   */
  private disableAcceptNewAdmin(): boolean {
    return this.isNewAdmin && !this.checkRequiredFields();
  }

  /**
   * @returns true if the accept button should be disabled in case of an existing created admin. Otherwise false.
   */
  private disableAcceptExistingAdmin(): boolean {
    return !this.isNewAdmin && (!this.checkRequiredFields() || this.selectedAdmin.equals(this.originalUser));
  }

  /**
   * @returns true if all required fields are set. Otherwise false
   */
  private checkRequiredFields(): boolean {
    return this.selectedAdmin.firstName != undefined && this.selectedAdmin.firstName.length > 0
      && this.selectedAdmin.lastName != undefined && this.selectedAdmin.lastName.length > 0;
  }

}
