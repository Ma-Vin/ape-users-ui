import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SelectionService } from 'src/app/services/selection.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService {

  constructor(private selectionService: SelectionService) { }

  canActivate(): Observable<boolean> {
    let activeUser = this.selectionService.getActiveUser();
    return of(activeUser != undefined && activeUser.isGlobalAdmin);
  }
}
