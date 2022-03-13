import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { User } from '../../model/user.model';
import { UserService } from '../../services/backend/user.service';
import { AddElementDialogComponent, AddElementDialogData } from '../add-element-dialog/add-element-dialog.component';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.less']
})
export class AddUserDialogComponent extends AddElementDialogComponent<User, AddUserDialogComponent> {

  constructor(public dialogRef: MatDialogRef<AddUserDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: AddElementDialogData, private userService: UserService) {
    super(dialogRef, data);
  }


  ngOnInit(): void {
    super.ngOnInit();
  }


  protected getDisplayedColumns(): string[] {
    return ['select', 'identification', 'firstName', 'lastName'];
  }


  protected getAvailableElementsForBaseGroup(identification: string): Observable<User[]> {
    return this.userService.getAvailableUserPartsForBaseGroup(identification, undefined, undefined);
  }


  protected getAvailableElementsForPrivilegeGroup(identification: string): Observable<User[]> {
    return this.userService.getAvailableUserPartsForPrivilegeGroup(identification, undefined, undefined);
  }
}
