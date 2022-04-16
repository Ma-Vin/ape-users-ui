import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ADMIN_GROUP_PATH, USERS_PATH } from '../../app-constants';
import { SelectionService } from '../../services/util/selection.service';
import { ToolbarSite } from './toolbar-site';

const NOT_SELECTED_TEXT = 'not selected';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.less']
})
export class ToolbarComponent implements OnInit, OnChanges {
  @Output() onCreateObjectEventEmitter = new EventEmitter<string>();
  @Input() public createObjectName!: string;
  @Input() public activeSite!: ToolbarSite;
  @Input() public disableCreateButton!: boolean;

  @Input() public commonGroupIdentification: string | undefined;
  public commonGroupText = NOT_SELECTED_TEXT;
  public activeUserIdentification: string | undefined;
  public activeUserParentUrl: string | undefined;
  public activeUserText = NOT_SELECTED_TEXT;
  public iconName = 'add_box';

  public showAdminItems!: boolean;

  constructor(private selectionService: SelectionService) {
  }

  public ngOnInit(): void {
    this.determineShowAdminItems();
    this.determineActiveUserValues();
    switch (this.activeSite) {
      case ToolbarSite.ADMINS:
        this.iconName = 'add_moderator';
        break;
      case ToolbarSite.COMMON_GROUPS:
        this.iconName = 'domain_add';
        break;
      case ToolbarSite.BASE_GROUPS:
      case ToolbarSite.PRIVILEGE_GROUPS:
        this.iconName = 'group_add';
        break;
      case ToolbarSite.USERS:
        this.iconName = 'person_add';
        break;
      default:
        this.iconName = 'add_box';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    this.commonGroupIdentification = commonGroup == undefined ? undefined : commonGroup.identification;
    this.commonGroupText = this.commonGroupIdentification == undefined ? NOT_SELECTED_TEXT : this.commonGroupIdentification;
  }

  private determineShowAdminItems(): void {
    let activeUser = this.selectionService.getActiveUser();
    this.showAdminItems = activeUser != undefined && activeUser.isGlobalAdmin;
  }

  private determineActiveUserValues(): void {
    let user = this.selectionService.getActiveUser();
    if (user != undefined) {
      this.activeUserIdentification = user.identification;
      this.activeUserParentUrl = user.isGlobalAdmin ? ADMIN_GROUP_PATH : USERS_PATH;
      this.activeUserText = `${user.lastName}, ${user.firstName}: ${this.activeUserIdentification}`;
    } else {
      this.activeUserIdentification = undefined;
      this.activeUserParentUrl = undefined;
      this.activeUserText = NOT_SELECTED_TEXT;
    }
  }

  public onCreateObject(): void {
    this.onCreateObjectEventEmitter.emit(this.createObjectName);
  }
}
