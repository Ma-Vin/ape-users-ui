import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectionService } from 'src/app/services/selection.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.less']
})
export class ToolbarComponent implements OnInit {
  @Output() onCreateObjectEventEmitter = new EventEmitter<string>();
  @Input() public createObjectName!: string;

  public showAdminItems!: boolean;

  constructor(private selectionService: SelectionService) {
  }

  public ngOnInit(): void {
    this.determineShowAdminItems();
  }

  private determineShowAdminItems(): void {
    let activeUser = this.selectionService.getActiveUser();
    this.showAdminItems = activeUser != undefined && activeUser.isGlobalAdmin;
  }

  public onCreateObject():void{
    this.onCreateObjectEventEmitter.emit(this.createObjectName);
  }

}
