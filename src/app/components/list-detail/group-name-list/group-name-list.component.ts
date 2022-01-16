import { Component } from '@angular/core';
import { IEqualsAndIdentifiable } from 'src/app/model/equals-identifiable';
import { ListComponent } from '../list.component';

@Component({
  selector: 'app-group-name-list',
  templateUrl: './group-name-list.component.html',
  styleUrls: ['./group-name-list.component.less']
})
export class GroupNameListComponent<T extends IEqualsAndIdentifiable> extends ListComponent<T>{
  allObjectsDisplayedColumns: string[] = ['identification', 'groupName'];
}
