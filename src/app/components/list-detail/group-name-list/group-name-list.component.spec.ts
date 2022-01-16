import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material/material.module';
import { IEqualsAndIdentifiable } from 'src/app/model/equals-identifiable';

import { GroupNameListComponent } from './group-name-list.component';

describe('GroupNameListComponent', () => {
  let component: GroupNameListComponent<IEqualsAndIdentifiable>;
  let fixture: ComponentFixture<GroupNameListComponent<IEqualsAndIdentifiable>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, BrowserAnimationsModule],
      declarations: [GroupNameListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupNameListComponent);
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
