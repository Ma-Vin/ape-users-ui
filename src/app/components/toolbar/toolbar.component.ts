import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectionService } from '../../services/util/selection.service';
import { ToolbarSite } from './toolbar-site';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.less']
})
export class ToolbarComponent implements OnInit {
  @Output() onCreateObjectEventEmitter = new EventEmitter<string>();
  @Input() public createObjectName!: string;
  @Input() public activeSite!: ToolbarSite;
  @Input() public disableCreateButton!: boolean;
  public iconName = 'add_box';

  public showAdminItems!: boolean;

  constructor(private selectionService: SelectionService) {
  }

  public ngOnInit(): void {
    this.determineShowAdminItems();
    switch (this.activeSite) {
      case ToolbarSite.ADMINS:
        this.iconName = 'add_moderator';
        break;
      case ToolbarSite.COMMON_GROUPS:
        this.iconName = 'domain_add';
        break;
      case ToolbarSite.USERS:
        this.iconName = 'person_add';
        break;
      default:
        this.iconName = 'add_box';
    }
  }

  private determineShowAdminItems(): void {
    let activeUser = this.selectionService.getActiveUser();
    this.showAdminItems = activeUser != undefined && activeUser.isGlobalAdmin;
  }

  public onCreateObject(): void {
    this.onCreateObjectEventEmitter.emit(this.createObjectName);
  }
}
