import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonGroupPermissionsService } from '../permissions/common-group-permissions.service';
import { SelectionService } from '../util/selection.service';

@Injectable({
  providedIn: 'root'
})
export class CommonGroupsGuardService {

  constructor(private commonGroupPermissionsService: CommonGroupPermissionsService, private selectionService: SelectionService) { }


  canActivate(): Observable<boolean> {
    let selectedCommonGroup = this.selectionService.getSelectedCommonGroup();
    return of((this.commonGroupPermissionsService.isAllowedToGetAllCommonGroup() && this.commonGroupPermissionsService.isAllowedToGetAllCommonGroupParts())
      || (selectedCommonGroup !== undefined && this.commonGroupPermissionsService.isAllowedToGetCommonGroup(selectedCommonGroup.getIdentification())));
  }
}
