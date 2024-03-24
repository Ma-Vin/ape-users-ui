import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from '../../../material/material.module';

import { DetailButtonRowComponent } from './detail-button-row.component';

describe('DetailButtonRowComponent', () => {
  let component: DetailButtonRowComponent;
  let fixture: ComponentFixture<DetailButtonRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({  
      imports: [MaterialModule],
      declarations: [DetailButtonRowComponent]
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
