import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Location } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { COMMON_GROUPS_PATH } from '../../app-constants'
import { ConfigService } from '../../config/config.service';
import { MaterialModule } from '../../material/material.module';
import { SelectionService } from '../../services/util/selection.service';

import { AllCommonGroupsComponent } from './all-common-groups.component';
import { CommonGroupService } from '../../services/backend/common-group.service';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { Role } from '../../model/role.model';
import { of } from 'rxjs';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { CommonGroupPermissionsService } from 'src/app/services/permissions/common-group-permissions.service';
import { MatDialog } from '@angular/material/dialog';

describe('CommonGroupComponent', () => {
  let component: AllCommonGroupsComponent;
  let fixture: ComponentFixture<AllCommonGroupsComponent>;

  let httpMock: HttpTestingController;
  let http: HttpClient;
  let configService: ConfigService;
  let selectionService: SelectionService;
  let route: ActivatedRoute;
  let location: Location;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;
  let commonGroupService: CommonGroupService;
  let commonGroupPermissionsService: CommonGroupPermissionsService;


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
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: COMMON_GROUPS_PATH, component: AllCommonGroupsComponent }]), MaterialModule, BrowserAnimationsModule],
      declarations: [AllCommonGroupsComponent, ToolbarComponent]
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
    dialog = TestBed.inject(MatDialog);
    commonGroupService = TestBed.inject(CommonGroupService);
    commonGroupPermissionsService = TestBed.inject(CommonGroupPermissionsService);

    fixture = TestBed.createComponent(AllCommonGroupsComponent);
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
    component.areOnlyPartsToLoadAtList = false;
    let getAllCommonGroupsSpy = spyOn(commonGroupService, 'getAllCommonGroups').and.returnValue(of([otherCommonGroup, commonGroup]));
    let getCommonGroupSpy = spyOn(commonGroupService, 'getCommonGroup').and.returnValue(of(commonGroup));

    component.ngOnInit();

    tick()

    expect(getAllCommonGroupsSpy).toHaveBeenCalled();
    expect(getCommonGroupSpy).not.toHaveBeenCalled();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
  }));

  it('ngOnInit - with id at route', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllCommonGroupsSpy = spyOn(commonGroupService, 'getAllCommonGroups').and.returnValue(of([otherCommonGroup, commonGroup]));
    let getCommonGroupSpy = spyOn(commonGroupService, 'getCommonGroup').and.returnValue(of(commonGroup));

    spyOn(route.snapshot.paramMap, 'has').and.returnValue(true);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(commonGroupId);

    component.ngOnInit();

    tick()

    expect(getAllCommonGroupsSpy).toHaveBeenCalled();
    expect(getCommonGroupSpy).not.toHaveBeenCalled();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
  }));

  it('ngOnInit - parts, with id at route', fakeAsync(() => {
    let getAllCommonGroupPartsSpy = spyOn(commonGroupService, 'getAllCommonGroupParts').and.returnValue(of([otherCommonGroup, commonGroup]));
    let getCommonGroupSpy = spyOn(commonGroupService, 'getCommonGroup').and.returnValue(of(commonGroup));

    spyOn(route.snapshot.paramMap, 'has').and.returnValue(true);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(commonGroupId);

    component.ngOnInit();

    tick()

    expect(getAllCommonGroupPartsSpy).toHaveBeenCalled();
    expect(getCommonGroupSpy).toHaveBeenCalled();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
  }));



  /**
   * onSelectObject
   */
  it('onSelectObject - non selected before', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let selectionSpy = spyOn(selectionService, 'setSelectedCommonGroup').and.callFake(() => { });
    let isAllowedToUpdateCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToUpdateCommonGroup').and.returnValue(true);
    let getCommonGroupSpy = spyOn(commonGroupService, 'getCommonGroup').and.returnValue(of(commonGroup));

    component.onSelectObject(commonGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${COMMON_GROUPS_PATH}/${commonGroup.identification}`);
    expect(selectionSpy).toHaveBeenCalledOnceWith(commonGroup);
    expect(isAllowedToUpdateCommonGroupSpy).toHaveBeenCalled();
    expect(getCommonGroupSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === commonGroup).toBeFalse();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(commonGroupId);
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - parts, non selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let selectionSpy = spyOn(selectionService, 'setSelectedCommonGroup').and.callFake(() => { });
    let isAllowedToUpdateCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToUpdateCommonGroup').and.returnValue(true);
    let getCommonGroupSpy = spyOn(commonGroupService, 'getCommonGroup').and.returnValue(of(commonGroup));

    component.onSelectObject(commonGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${COMMON_GROUPS_PATH}/${commonGroup.identification}`);
    expect(selectionSpy).toHaveBeenCalledOnceWith(commonGroup);
    expect(isAllowedToUpdateCommonGroupSpy).toHaveBeenCalled();
    expect(getCommonGroupSpy).toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === commonGroup).toBeFalse();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(commonGroupId);
    expect(component.disableUpdate).toBeFalse();
  });


  it('onSelectObject - same selected before', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let selectionSpy = spyOn(selectionService, 'setSelectedCommonGroup').and.callFake(() => { });
    let isAllowedToUpdateCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToUpdateCommonGroup').and.returnValue(true);
    let getCommonGroupSpy = spyOn(commonGroupService, 'getCommonGroup').and.returnValue(of(commonGroup));

    component.selectedObject = commonGroup;

    component.onSelectObject(commonGroup);

    expect(loactionSpy).not.toHaveBeenCalledOnceWith(`${COMMON_GROUPS_PATH}/${commonGroup.identification}`);
    expect(selectionSpy).toHaveBeenCalledOnceWith(commonGroup);
    expect(isAllowedToUpdateCommonGroupSpy).toHaveBeenCalled();
    expect(getCommonGroupSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === commonGroup).toBeFalse();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(commonGroupId);
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - other selected before', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let selectionSpy = spyOn(selectionService, 'setSelectedCommonGroup').and.callFake(() => { });
    let isAllowedToUpdateCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToUpdateCommonGroup').and.returnValue(true);
    let getCommonGroupSpy = spyOn(commonGroupService, 'getCommonGroup').and.returnValue(of(commonGroup));

    component.selectedObject = otherCommonGroup;

    component.onSelectObject(commonGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${COMMON_GROUPS_PATH}/${commonGroup.identification}`);
    expect(selectionSpy).toHaveBeenCalledOnceWith(commonGroup);
    expect(isAllowedToUpdateCommonGroupSpy).toHaveBeenCalled();
    expect(getCommonGroupSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === commonGroup).toBeFalse();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(commonGroupId);
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - not allowed to update', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let selectionSpy = spyOn(selectionService, 'setSelectedCommonGroup').and.callFake(() => { });
    let isAllowedToUpdateCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToUpdateCommonGroup').and.returnValue(false);
    let getCommonGroupSpy = spyOn(commonGroupService, 'getCommonGroup').and.returnValue(of(commonGroup));

    component.onSelectObject(commonGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${COMMON_GROUPS_PATH}/${commonGroup.identification}`);
    expect(selectionSpy).toHaveBeenCalledOnceWith(commonGroup);
    expect(isAllowedToUpdateCommonGroupSpy).toHaveBeenCalled();
    expect(getCommonGroupSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === commonGroup).toBeFalse();
    expect(component.selectedObject.equals(commonGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(commonGroupId);
    expect(component.disableUpdate).toBeTrue();
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
    spyOn(commonGroupPermissionsService, 'isAllowedToUpdateCommonGroup').and.returnValue(true);

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
  it('onAccept - create new common group', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherCommonGroup;
    component.allObjectsfilterDataSource.data = [commonGroup];

    let createCommonGroupSpy = spyOn(commonGroupService, 'createCommonGroup').and.returnValue(of(otherCommonGroup));
    let updateCreatedcommonGroupSpy = spyOn(commonGroupService, 'updateCommonGroup').and.returnValue(of(otherCommonGroup));

    component.onAccept();

    tick();

    expect(createCommonGroupSpy).toHaveBeenCalled;
    expect(updateCreatedcommonGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === otherCommonGroup).toBeFalse();
    expect(component.selectedObject.equals(otherCommonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
  }));

  it('onAccept - update existing common group', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedCommonGroup = CommonGroup.map(otherCommonGroup);
    modfiedCommonGroup.groupName = modfiedCommonGroup.groupName.concat('_');
    component.selectedObject = modfiedCommonGroup;
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];

    let updateCommonGroupSpy = spyOn(commonGroupService, 'updateCommonGroup').and.returnValue(of(modfiedCommonGroup));

    component.onAccept();

    tick();

    expect(updateCommonGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === modfiedCommonGroup).toBeFalse();
    expect(component.selectedObject.equals(modfiedCommonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(modfiedCommonGroup)).toBeTrue();
  }));

  it('onAccept - accept disabled', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedCommonGroup = CommonGroup.map(otherCommonGroup);
    modfiedCommonGroup.groupName = '';
    component.selectedObject = modfiedCommonGroup;
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];

    let updateCommonGroupSpy = spyOn(commonGroupService, 'updateCommonGroup').and.returnValue(of(modfiedCommonGroup));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.onAccept();

    tick();

    expect(updateCommonGroupSpy).not.toHaveBeenCalled;
    expect(openMessage).toHaveBeenCalled();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));



  /**
   * onAcceptCallBack
   */
  it('onAcceptCallBack - create new common group', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherCommonGroup;
    component.allObjectsfilterDataSource.data = [commonGroup];

    let createCommonGroupSpy = spyOn(commonGroupService, 'createCommonGroup').and.returnValue(of(otherCommonGroup));
    let updateCreatedcommonGroupSpy = spyOn(commonGroupService, 'updateCommonGroup').and.returnValue(of(otherCommonGroup));

    component.onAcceptCallBack();

    tick();

    expect(createCommonGroupSpy).toHaveBeenCalled;
    expect(updateCreatedcommonGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === otherCommonGroup).toBeFalse();
    expect(component.selectedObject.equals(otherCommonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
  }));



  /**
   * onCancel
   */
  it('onCancel', () => {
    component.selectedObjectIdentification = 'a';
    component.onCancel();

    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
    expect(component.selectedObject).toBeTruthy();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.selectedObjectIdentification).not.toBeDefined();
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
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];
    let deleteCommonGroupSpy = spyOn(commonGroupService, 'deleteCommonGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeleteCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToDeleteCommonGroup').and.returnValue(true);

    component.selectedObject = otherCommonGroup;
    component.selectedObjectIdentification = otherCommonGroupId;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteCommonGroupSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();
    expect(isAllowedToDeleteCommonGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).not.toBeDefined();
  }));

  it('onDelete - delete unsuccessful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];
    let deleteCommonGroupSpy = spyOn(commonGroupService, 'deleteCommonGroup').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeleteCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToDeleteCommonGroup').and.returnValue(true);

    component.selectedObject = otherCommonGroup;
    component.selectedObjectIdentification = otherCommonGroupId;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteCommonGroupSpy).toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();
    expect(isAllowedToDeleteCommonGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);

    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toBeDefined();
  }));

  it('onDelete - delete disabled - new item', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];
    let deleteCommonGroupSpy = spyOn(commonGroupService, 'deleteCommonGroup').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });
    let isAllowedToDeleteCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToDeleteCommonGroup').and.returnValue(true);

    component.selectedObject = commonGroup;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.onDelete();

    tick();

    expect(deleteCommonGroupSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();
    expect(isAllowedToDeleteCommonGroupSpy).not.toHaveBeenCalled(); // since new one and short circle check

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));

  it('onDelete - delete disabled - not allowed to', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];
    let deleteCommonGroupSpy = spyOn(commonGroupService, 'deleteCommonGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeleteCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToDeleteCommonGroup').and.returnValue(false);

    component.selectedObject = otherCommonGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deleteCommonGroupSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();
    expect(isAllowedToDeleteCommonGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherCommonGroup)).toBeTrue();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));



  /**
   * onDeleteCallBack
   */
  it('onDeleteCallBack - delete successful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [commonGroup, otherCommonGroup];
    let deleteCommonGroupSpy = spyOn(commonGroupService, 'deleteCommonGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeleteCommonGroupSpy = spyOn(commonGroupPermissionsService, 'isAllowedToDeleteCommonGroup').and.returnValue(true);

    component.selectedObject = otherCommonGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;

    component.onDeleteCallBack();

    tick();

    expect(deleteCommonGroupSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();
    expect(isAllowedToDeleteCommonGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(commonGroup)).toBeTrue();
  }));



  /**
   * disableAccept/Callback
   */
  it('disableAccept - new common group', () => {
    component.isNewObject = true;
    component.selectedObject = commonGroup;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - new common group, but missing group name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: commonGroupId
    } as CommonGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });


  it('disableAccept - new common group, but empty group name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: commonGroupId,
      groupName: ''
    } as CommonGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing common group', () => {
    component.isNewObject = false;
    component.selectedObject = commonGroup;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - existing common group, but not modified', () => {
    component.onSelectObject(commonGroup);
    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing common group, but missing group name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: commonGroupId
    } as CommonGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing common group, but empty group name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: commonGroupId,
      groupName: ''
    } as CommonGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });



  /**
   * disableCreateObject
   */
  it('disableCreateObject - creating a common group is allowed', () => {
    spyOn(commonGroupPermissionsService, 'isAllowedCreateCommonGroup').and.returnValue(true);
    expect(component.disableCreateObject()).toBeFalse();
  });

  it('disableCreateObject - creating a common group is not allowed', () => {
    spyOn(commonGroupPermissionsService, 'isAllowedCreateCommonGroup').and.returnValue(false);
    expect(component.disableCreateObject()).toBeTrue();
  });


  /**
   * disableDelete/Callback
   */
  it('disableDelete - new common group', () => {
    component.isNewObject = true;
    spyOn(commonGroupPermissionsService, 'isAllowedToDeleteCommonGroup').and.returnValue(true);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
  });

  it('disableDelete - existing common group', () => {
    component.isNewObject = false;
    spyOn(commonGroupPermissionsService, 'isAllowedToDeleteCommonGroup').and.returnValue(true);

    expect(component.disableDelete()).toBeFalse();
    expect(component.disableDeleteCallBack()).toBeFalse();
  });

  it('disableDelete - existing common group, but not allowed to', () => {
    component.isNewObject = false;
    spyOn(commonGroupPermissionsService, 'isAllowedToDeleteCommonGroup').and.returnValue(false);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
  });



  /**
  * openHistoryDialogCallBack
  */
  it('openHistoryDialogCallBack - all ok', () => {
    component.selectedObject = commonGroup;
    let openSpy = spyOn(dialog, 'open');

    component.openHistoryDialogCallBack();

    expect(openSpy).toHaveBeenCalled;
  });
});
