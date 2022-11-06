import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';

import { DetailButtonRowComponent } from './detail-button-row.component';

describe('DetailButtonRowComponent', () => {
  let component: DetailButtonRowComponent;
  let fixture: ComponentFixture<DetailButtonRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailButtonRowComponent, MatIcon]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailButtonRowComponent);
    component = fixture.componentInstance;
    component.onAccept = () => { };
    component.disableAccept = () => { return true };
    component.onCancel = () => { };
    component.onDelete = () => { };
    component.disableDelete = () => { return true };
    component.isNewObject = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
