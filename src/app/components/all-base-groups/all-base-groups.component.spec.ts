import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ConfigService } from '../../config/config.service';
import { BaseGroupService } from '../../services/backend/base-group.service';
import { CommonGroupService } from '../../services/backend/common-group.service';
import { BaseGroupPermissionsService } from '../../services/permissions/base-group-permissions.service';
import { SelectionService } from '../../services/util/selection.service';
import { AllBaseGroupsComponent } from './all-base-groups.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BASE_GROUPS_PATH } from '../../app-routing.module';
import { MaterialModule } from '../../material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { BaseGroup, IBaseGroup } from 'src/app/model/base-group.model';

describe('AllBaseGroupsComponent', () => {
  let component: AllBaseGroupsComponent;
  let fixture: ComponentFixture<AllBaseGroupsComponent>;

  let httpMock: HttpTestingController;
  let http: HttpClient;
  let configService: ConfigService;
  let selectionService: SelectionService;
  let route: ActivatedRoute;
  let location: Location;
  let snackBar: MatSnackBar;
  let commonGroupService: CommonGroupService;
  let baseGroupService: BaseGroupService;
  let baseGroupPermissionsService: BaseGroupPermissionsService;


  const baseGroupId = 'BGAA00001';
  const otherBaseGroupId = 'BGAA00002';
  const baseGroupName = 'Name of the group';

  const baseGroup = BaseGroup.map({
    identification: baseGroupId,
    groupName: baseGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!'
  } as IBaseGroup);

  const otherBaseGroup = BaseGroup.map({
    identification: otherBaseGroupId,
    groupName: baseGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!'
  } as IBaseGroup);


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: BASE_GROUPS_PATH, component: AllBaseGroupsComponent }]), MaterialModule, BrowserAnimationsModule],
      declarations: [AllBaseGroupsComponent, ToolbarComponent]
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
    baseGroupService = TestBed.inject(BaseGroupService);
    baseGroupPermissionsService = TestBed.inject(BaseGroupPermissionsService);

    fixture = TestBed.createComponent(AllBaseGroupsComponent);
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
    let getAllBaseGroupsSpy = spyOn(baseGroupService, 'getAllBaseGroups').and.returnValue(of([otherBaseGroup, baseGroup]));

    component.ngOnInit();

    tick()

    expect(getAllBaseGroupsSpy).toHaveBeenCalled();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherBaseGroup)).toBeTrue();
  }));

  it('ngOnInit - with id at route', fakeAsync(() => {
    let getAllBaseGroupsSpy = spyOn(baseGroupService, 'getAllBaseGroups').and.returnValue(of([otherBaseGroup, baseGroup]));

    spyOn(route.snapshot.paramMap, 'has').and.returnValue(true);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(baseGroupId);

    component.ngOnInit();

    tick()

    expect(getAllBaseGroupsSpy).toHaveBeenCalled();
    expect(component.selectedObject.equals(baseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherBaseGroup)).toBeTrue();
  }));




  /**
   * applyAllObjectsFilter
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
    let isAllowedToUpdateBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToUpdateBaseGroup').and.returnValue(true);

    component.onSelectObject(baseGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${BASE_GROUPS_PATH}/${baseGroup.identification}`);
    expect(isAllowedToUpdateBaseGroupSpy).toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === baseGroup).toBeFalse();
    expect(component.selectedObject.equals(baseGroup)).toBeTrue();
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - same selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let isAllowedToUpdateBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToUpdateBaseGroup').and.returnValue(true);

    component.selectedObject = baseGroup;

    component.onSelectObject(baseGroup);

    expect(loactionSpy).not.toHaveBeenCalledOnceWith(`${BASE_GROUPS_PATH}/${baseGroup.identification}`);
    expect(isAllowedToUpdateBaseGroupSpy).toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === baseGroup).toBeFalse();
    expect(component.selectedObject.equals(baseGroup)).toBeTrue();
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - other selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let isAllowedToUpdateBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToUpdateBaseGroup').and.returnValue(true);

    component.selectedObject = otherBaseGroup;

    component.onSelectObject(baseGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${BASE_GROUPS_PATH}/${baseGroup.identification}`);
    expect(isAllowedToUpdateBaseGroupSpy).toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === baseGroup).toBeFalse();
    expect(component.selectedObject.equals(baseGroup)).toBeTrue();
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - not allowed to update', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { });
    let isAllowedToUpdateBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToUpdateBaseGroup').and.returnValue(false);

    component.onSelectObject(baseGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${BASE_GROUPS_PATH}/${baseGroup.identification}`);
    expect(isAllowedToUpdateBaseGroupSpy).toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === baseGroup).toBeFalse();
    expect(component.selectedObject.equals(baseGroup)).toBeTrue();
    expect(component.disableUpdate).toBeTrue();
  });




  /**
   * isObjectSelected
   */
  it('isObjectSelected - same baseGroup', () => {
    component.selectedObject = baseGroup;
    expect(component.isObjectSelected(baseGroup)).toBeTrue();
  });

  it('isObjectSelected - other baseGroup', () => {
    component.selectedObject = otherBaseGroup;
    expect(component.isObjectSelected(baseGroup)).toBeFalse();
  });




  /**
   * onCreateObject
   */
  it('onCreateObject', () => {
    spyOn(baseGroupPermissionsService, 'isAllowedToUpdateBaseGroup').and.returnValue(true);

    component.onCreateObject();

    expect(component.showObjectDetail).toBeTrue();
    expect(component.isNewObject).toBeTrue();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.disableUpdate).toBeFalse();
  });




  /**
   * onAccept
   */
  it('onAccept - create new base group', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherBaseGroup;
    component.allObjectsfilterDataSource.data = [baseGroup];

    let createBaseGroupSpy = spyOn(baseGroupService, 'createBaseGroup').and.returnValue(of(otherBaseGroup));
    let updateCreatedBaseGroupSpy = spyOn(baseGroupService, 'updateBaseGroup').and.returnValue(of(otherBaseGroup));

    component.onAccept();

    tick();

    expect(createBaseGroupSpy).toHaveBeenCalled;
    expect(updateCreatedBaseGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === otherBaseGroup).toBeFalse();
    expect(component.selectedObject.equals(otherBaseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherBaseGroup)).toBeTrue();
  }));

  it('onAccept - update existing base group', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedBaseGroup = BaseGroup.map(otherBaseGroup);
    modfiedBaseGroup.groupName = modfiedBaseGroup.groupName.concat('_');
    component.selectedObject = modfiedBaseGroup;
    component.allObjectsfilterDataSource.data = [baseGroup, otherBaseGroup];

    let updateBaseGroupSpy = spyOn(baseGroupService, 'updateBaseGroup').and.returnValue(of(modfiedBaseGroup));

    component.onAccept();

    tick();

    expect(updateBaseGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === modfiedBaseGroup).toBeFalse();
    expect(component.selectedObject.equals(modfiedBaseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(modfiedBaseGroup)).toBeTrue();
  }));

  it('onAccept - accept disabled', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedBaseGroup = BaseGroup.map(otherBaseGroup);
    modfiedBaseGroup.groupName = '';
    component.selectedObject = modfiedBaseGroup;
    component.allObjectsfilterDataSource.data = [baseGroup, otherBaseGroup];

    let updateBaseGroupSpy = spyOn(baseGroupService, 'updateBaseGroup').and.returnValue(of(modfiedBaseGroup));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.onAccept();

    tick();

    expect(updateBaseGroupSpy).not.toHaveBeenCalled;
    expect(openMessage).toHaveBeenCalled();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));




  /**
   * onAcceptCallBack
   */
  it('onAcceptCallBack - create new base group', fakeAsync(() => {
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherBaseGroup;
    component.allObjectsfilterDataSource.data = [baseGroup];

    let createBaseGroupSpy = spyOn(baseGroupService, 'createBaseGroup').and.returnValue(of(otherBaseGroup));
    let updateCreatedBaseGroupSpy = spyOn(baseGroupService, 'updateBaseGroup').and.returnValue(of(otherBaseGroup));

    component.onAcceptCallBack();

    tick();

    expect(createBaseGroupSpy).toHaveBeenCalled;
    expect(updateCreatedBaseGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === otherBaseGroup).toBeFalse();
    expect(component.selectedObject.equals(otherBaseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherBaseGroup)).toBeTrue();
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
   * onCancelCallBack
   */
  it('onCancelCallBack', () => {
    component.onCancelCallBack();

    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
  });




  /**
   * onDelete
   */
  it('onDelete - delete successful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [baseGroup, otherBaseGroup];
    let deleteBaseGroupSpy = spyOn(baseGroupService, 'deleteBaseGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeleteBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToDeleteBaseGroup').and.returnValue(true);

    component.selectedObject = otherBaseGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteBaseGroupSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();
    expect(isAllowedToDeleteBaseGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
  }));

  it('onDelete - delete unsuccessful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [baseGroup, otherBaseGroup];
    let deleteBaseGroupSpy = spyOn(baseGroupService, 'deleteBaseGroup').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeleteBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToDeleteBaseGroup').and.returnValue(true);

    component.selectedObject = otherBaseGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteBaseGroupSpy).toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();
    expect(isAllowedToDeleteBaseGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);

    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherBaseGroup)).toBeTrue();
  }));

  it('onDelete - delete disabled - new item', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [baseGroup, otherBaseGroup];
    let deleteBaseGroupSpy = spyOn(baseGroupService, 'deleteBaseGroup').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });
    let isAllowedToDeleteBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToDeleteBaseGroup').and.returnValue(true);

    component.selectedObject = baseGroup;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.onDelete();

    tick();

    expect(deleteBaseGroupSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();
    expect(isAllowedToDeleteBaseGroupSpy).not.toHaveBeenCalled(); // since new one and short circle check

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherBaseGroup)).toBeTrue();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));

  it('onDelete - delete disabled - not allowed to', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [baseGroup, otherBaseGroup];
    let deleteBaseGroupSpy = spyOn(baseGroupService, 'deleteBaseGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeleteBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToDeleteBaseGroup').and.returnValue(false);

    component.selectedObject = otherBaseGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteBaseGroupSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();
    expect(isAllowedToDeleteBaseGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherBaseGroup)).toBeTrue();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));





  /**
   * onDeleteCallBack
   */
  it('onDeleteCallBack - delete successful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [baseGroup, otherBaseGroup];
    let deleteBaseGroupSpy = spyOn(baseGroupService, 'deleteBaseGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeleteBaseGroupSpy = spyOn(baseGroupPermissionsService, 'isAllowedToDeleteBaseGroup').and.returnValue(true);

    component.selectedObject = otherBaseGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;

    component.onDeleteCallBack();

    tick();

    expect(deleteBaseGroupSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();
    expect(isAllowedToDeleteBaseGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(baseGroup)).toBeTrue();
  }));




  /**
   * disableAccept/Callback
   */
  it('disableAccept - new base group', () => {
    component.isNewObject = true;
    component.selectedObject = baseGroup;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - new base group, but missing group name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: baseGroupId
    } as BaseGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });


  it('disableAccept - new base group, but empty group name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: baseGroupId,
      groupName: ''
    } as BaseGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing base group', () => {
    component.isNewObject = false;
    component.selectedObject = baseGroup;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - existing base group, but not modified', () => {
    component.onSelectObject(baseGroup);
    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing base group, but missing group name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: baseGroupId
    } as BaseGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing base group, but empty group name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: baseGroupId,
      groupName: ''
    } as BaseGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });




  /**
   * disableCreateObject
   */
  it('disableCreateObject - creating a base group is allowed', () => {
    spyOn(baseGroupPermissionsService, 'isAllowedCreateBaseGroup').and.returnValue(true);
    expect(component.disableCreateObject()).toBeFalse();
  });

  it('disableCreateObject - creating a base group is not allowed', () => {
    spyOn(baseGroupPermissionsService, 'isAllowedCreateBaseGroup').and.returnValue(false);
    expect(component.disableCreateObject()).toBeTrue();
  });




  /**
   * disableDelete/Callback
   */
  it('disableDelete - new base group', () => {
    component.isNewObject = true;
    spyOn(baseGroupPermissionsService, 'isAllowedToDeleteBaseGroup').and.returnValue(true);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
  });

  it('disableDelete - existing base group', () => {
    component.isNewObject = false;
    spyOn(baseGroupPermissionsService, 'isAllowedToDeleteBaseGroup').and.returnValue(true);

    expect(component.disableDelete()).toBeFalse();
    expect(component.disableDeleteCallBack()).toBeFalse();
  });

  it('disableDelete - existing base group, but not allowed to', () => {
    component.isNewObject = false;
    spyOn(baseGroupPermissionsService, 'isAllowedToDeleteBaseGroup').and.returnValue(false);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
  });
});
