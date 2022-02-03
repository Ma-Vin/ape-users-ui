import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { User } from '../../model/user.model';
import { UserService } from '../../services/backend/user.service';
import { SelectionService } from '../../services/util/selection.service';
import { AddElementDialogComponent, AddElementDialogData } from '../add-element-dialog/add-element-dialog.component';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.less']
})
export class AddUserDialogComponent extends AddElementDialogComponent<User, AddUserDialogComponent> {

  private commonGroupId = '';

  constructor(public dialogRef: MatDialogRef<AddUserDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: AddElementDialogData, private userService: UserService, private selectionService: SelectionService) {
    super(dialogRef, data);
  }


  ngOnInit(): void {
    this.initCommonGroup()
    super.ngOnInit();
  }


  protected getDisplayedColumns(): string[] {
    return ['select', 'identification', 'firstName', 'lastName'];
  }

  private initCommonGroup(): void {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return;
    }
    this.commonGroupId = commonGroup.identification;
  }


  protected getAllElements(): Observable<User[]> {
    return this.userService.getAllUsers(this.commonGroupId, undefined, undefined);
  }


  protected getAllElementsFromBaseGroup(identification: string): Observable<User[]> {
    return this.userService.getAllUsersFromBaseGroup(identification, undefined, undefined);
  }


  protected getAllElementsFromPrivilegeGroup(identification: string): Observable<User[]> {
    return this.userService.getAllUsersFromPrivilegeGroup(identification, false, undefined, undefined, undefined);
  }
}
