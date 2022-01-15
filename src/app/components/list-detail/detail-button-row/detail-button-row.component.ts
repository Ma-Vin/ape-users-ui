import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-detail-button-row',
  templateUrl: './detail-button-row.component.html',
  styleUrls: ['./detail-button-row.component.less']
})
export class DetailButtonRowComponent {
  @Input() onAccept!: () => void;
  @Input() disableAccept!: () => boolean;
  @Input() onCancel!: () => void;
  @Input() onDelete!: () => void;
  @Input() disableDelete!: () => boolean;
  @Input() isNewObject!: boolean;
}
