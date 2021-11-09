import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Location } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_GROUPS_PATH } from 'src/app/app-routing.module';
import { ConfigService } from 'src/app/config/config.service';
import { MaterialModule } from 'src/app/material/material.module';
import { SelectionService } from 'src/app/services/selection.service';

import { CommonGroupComponent } from './common-group.component';
import { CommonGroupService } from 'src/app/services/common-group.service';
import { CommonGroup, ICommonGroup } from 'src/app/model/common-group.model';
import { Role } from 'src/app/model/role.model';
import { of } from 'rxjs';

describe('CommonGroupComponent', () => {
  let component: CommonGroupComponent;
  let fixture: ComponentFixture<CommonGroupComponent>;

  let httpMock: HttpTestingController;
  let http: HttpClient;
  let configService: ConfigService;
  let selectionService: SelectionService;
  let route: ActivatedRoute;
  let location: Location;
  let snackBar: MatSnackBar;
  let commonGroupService: CommonGroupService;


  const commonGroupId = 'CGAA00001';
  const otherCommonGroupId = 'UAA00002';
  const commonGroupName = 'Name of the group';

  const commonGroup = CommonGroup.map({
    identification: commonGroupId,
    groupName: commonGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!',
    defaultRole: Role.VISITOR
  } as ICommonGroup);

  const otherCommonGroup = CommonGroup.map({
    identification: otherCommonGroupId,
    groupName: commonGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!',
    defaultRole: Role.VISITOR
  } as ICommonGroup);


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: COMMON_GROUPS_PATH, component: CommonGroupComponent }]), MaterialModule, BrowserAnimationsModule],
      declarations: [CommonGroupComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient)
    configService = TestBed.inject(ConfigService);
    selectionService = TestBed.inject(SelectionService);
    route = TestBed.inject(ActivatedRoute);
    location = TestBed.inject(Location);
    snackBar = TestBed.inject(MatSnackBar);
    commonGroupService = TestBed.inject(CommonGroupService);

    fixture = TestBed.createComponent(CommonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  /**
   * ngOnInit
   */
  it('ngOnInit - without id at route', fakeAsync(() => {
    let getAllCommonGroupsSpy = spyOn(commonGroupService, 'getAllCommonGroups').and.returnValue(of([otherCommonGroup, commonGroup]));

    component.ngOnInit();

    tick()

    expect(getAllCommonGroupsSpy).toHaveBeenCalled();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
  }));

  it('ngOnInit - with id at route', fakeAsync(() => {
    let getAllCommonGroupsSpy = spyOn(commonGroupService, 'getAllCommonGroups').and.returnValue(of([otherCommonGroup, commonGroup]));

    spyOn(route.snapshot.paramMap, 'has').and.returnValue(true);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(commonGroupId);

    component.ngOnInit();

    tick()

    expect(getAllCommonGroupsSpy).toHaveBeenCalled();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
  }));


  /**
   * applyAllcommonGroupsFilter
   */
  it('applyAllObjectsFilter', () => {
    let filterValue = 'SomeValue';
    let eventTarget = { value: filterValue } as HTMLInputElement;
    let event = { target: eventTarget as EventTarget } as Event;
    component.applyAllObjectsFilter(event);

    expect(component.allObjectsfilterDataSource.filter).toEqual(filterValue.toLocaleLowerCase());
  });


  /**
   * onSelectObject
   */
  it('onSelectObject - non selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let selectionSpy = spyOn(selectionService, 'setSelectedCommonGroup').and.callFake(() => { });

    component.onSelectObject(commonGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${COMMON_GROUPS_PATH}/${commonGroup.identification}`);
    expect(selectionSpy).toHaveBeenCalledOnceWith(commonGroup);

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === commonGroup).toBeFalse();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
  });

  it('onSelectObject - same selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let selectionSpy = spyOn(selectionService, 'setSelectedCommonGroup').and.callFake(() => { });

    component.selectedObject = commonGroup;

    component.onSelectObject(commonGroup);

    expect(loactionSpy).not.toHaveBeenCalledOnceWith(`${COMMON_GROUPS_PATH}/${commonGroup.identification}`);
    expect(selectionSpy).toHaveBeenCalledOnceWith(commonGroup);

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === commonGroup).toBeFalse();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
  });

  it('onSelectObject - other selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let selectionSpy = spyOn(selectionService, 'setSelectedCommonGroup').and.callFake(() => { });

    component.selectedObject = otherCommonGroup;

    component.onSelectObject(commonGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${COMMON_GROUPS_PATH}/${commonGroup.identification}`);
    expect(selectionSpy).toHaveBeenCalledOnceWith(commonGroup);

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === commonGroup).toBeFalse();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
  });


  /**
   * isObjectSelected
   */
  it('isObjectSelected - same commonGroup', () => {
    component.selectedObject = commonGroup;
    expect(component.isObjectSelected(commonGroup)).toBeTrue();
  });

  it('isObjectSelected - other commonGroup', () => {
    component.selectedObject = otherCommonGroup;
    expect(component.isObjectSelected(commonGroup)).toBeFalse();
  });


  /**
   * onCreateObject
   */
  it('onCreateObject', () => {
    component.onCreateObject();

    expect(component.showObjectDetail).toBeTrue();
    expect(component.isNewObject).toBeTrue();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
  });


  /**
   * onAccept
   */
  it('onAccept - create new common group', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherCommonGroup;
    component.allObjectsfilterDataSource.data = [commonGroup];

    let createcommonGroupSpy = spyOn(commonGroupService, 'createCommonGroup').and.returnValue(of(otherCommonGroup));
    let updateCreatedcommonGroupSpy = spyOn(commonGroupService, 'updateCommonGroup').and.returnValue(of(otherCommonGroup));

    component.onAccept();

    tick();

    expect(createcommonGroupSpy).toHaveBeenCalled;
    expect(updateCreatedcommonGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === otherCommonGroup).toBeFalse();
    expect(component.selectedObject.equals(otherCommonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
  }));

  it('onAccept - update existing common group', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedCommonGroup = CommonGroup.map(otherCommonGroup);
    modfiedCommonGroup.groupName = modfiedCommonGroup.groupName.concat('_');
    component.selectedObject = modfiedCommonGroup;
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];

    let updatecommonGroupSpy = spyOn(commonGroupService, 'updateCommonGroup').and.returnValue(of(modfiedCommonGroup));

    component.onAccept();

    tick();

    expect(updatecommonGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === modfiedCommonGroup).toBeFalse();
    expect(component.selectedObject.equals(modfiedCommonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(modfiedCommonGroup)).toBeTrue();
  }));

  it('onAccept - accept disabled', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedCommonGroup = CommonGroup.map(otherCommonGroup);
    modfiedCommonGroup.groupName = '';
    component.selectedObject = modfiedCommonGroup;
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];

    let updatecommonGroupSpy = spyOn(commonGroupService, 'updateCommonGroup').and.returnValue(of(modfiedCommonGroup));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.onAccept();

    tick();

    expect(updatecommonGroupSpy).not.toHaveBeenCalled;
    expect(openMessage).toHaveBeenCalled();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));


  /**
   * onCancel
   */
  it('onCancel', () => {
    component.onCancel();

    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
  });


  /**
   * onDelete
   */
  it('onDelete - delete successful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];
    let deleteCommongroupSpy = spyOn(commonGroupService, 'deleteCommonGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedObject = otherCommonGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteCommongroupSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();


    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
  }));

  it('onDelete - delete unsuccessful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];
    let deleteCommongroupSpy = spyOn(commonGroupService, 'deleteCommonGroup').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

    component.selectedObject = otherCommonGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteCommongroupSpy).toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);

    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
  }));

  it('onDelete - delete disabled', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];
    let deleteCommongroupSpy = spyOn(commonGroupService, 'deleteCommonGroup').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.selectedObject = commonGroup;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.onDelete();

    tick();

    expect(deleteCommongroupSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));


  /**
   * disableAccept
   */
  it('disableAccept - new common group', () => {
    component.isNewObject = true;
    component.selectedObject = commonGroup;

    expect(component.disableAccept()).toBeFalse();
  });

  it('disableAccept - new common group, but missing group name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: commonGroupId
    } as CommonGroup

    expect(component.disableAccept()).toBeTrue();
  });


  it('disableAccept - new common group, but empty group name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: commonGroupId,
      groupName: ''
    } as CommonGroup

    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - existing common group', () => {
    component.isNewObject = false;
    component.selectedObject = commonGroup;

    expect(component.disableAccept()).toBeFalse();
  });

  it('disableAccept - existing common group, but not modified', () => {
    component.onSelectObject(commonGroup);
    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - existing common group, but missing group name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: commonGroupId
    } as CommonGroup

    expect(component.disableAccept()).toBeTrue();
  });

  it('disableAccept - existing common group, but empty group name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: commonGroupId,
      groupName: ''
    } as CommonGroup

    expect(component.disableAccept()).toBeTrue();
  });


  /**
   * disableDelete
   */
  it('disableDelete - new common group', () => {
    component.isNewObject = true;

    expect(component.disableDelete()).toBeTrue();
  });

  it('disableDelete - existing common group', () => {
    component.isNewObject = false;

    expect(component.disableDelete()).toBeFalse();
  });
});
