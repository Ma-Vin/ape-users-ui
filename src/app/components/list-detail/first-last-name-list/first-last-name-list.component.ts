import { Component } from '@angular/core';
import { IEqualsAndIdentifiable } from 'src/app/model/equals-identifiable';
import { ListComponent } from '../list.component';

@Component({
  selector: 'app-first-last-name-list',
  templateUrl: './first-last-name-list.component.html',
  styleUrls: ['./first-last-name-list.component.less']
})
export class FirstLastNameListComponent<T extends IEqualsAndIdentifiable> extends ListComponent<T>{
  allObjectsDisplayedColumns: string[] = ['identification', 'firstName', 'lastName'];
}
