import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material/material.module';
import { IEqualsAndIdentifiable } from 'src/app/model/equals-identifiable';

import { FirstLastNameListComponent } from './first-last-name-list.component';

describe('FirstLastNameListComponent', () => {
  let component: FirstLastNameListComponent<IEqualsAndIdentifiable>;
  let fixture: ComponentFixture<FirstLastNameListComponent<IEqualsAndIdentifiable>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, BrowserAnimationsModule],
      declarations: [FirstLastNameListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstLastNameListComponent);
    component = fixture.componentInstance;
    component.selectObject = (objectToSelect: IEqualsAndIdentifiable) => { };
    component.isObjectSelected = (objectToCheck: IEqualsAndIdentifiable) => { return true };
    component.allObjectsfilterDataSource = new MatTableDataSource<IEqualsAndIdentifiable>();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
