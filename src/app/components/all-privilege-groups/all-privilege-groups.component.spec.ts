import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Location } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CommonGroupService } from '../../services/backend/common-group.service';
import { SelectionService } from '../../services/util/selection.service';
import { AllPrivilegeGroupsComponent } from './all-privilege-groups.component';
import { ConfigService } from '../../config/config.service';
import { PrivilegeGroupService } from '../../services/backend/privilege-group.service';
import { PrivilegeGroupPermissionsService } from '../../services/permissions/privilege-group-permissions.service';
import { IPrivilegeGroup, PrivilegeGroup } from '../../model/privilege-group.model';
import { PRIVILEGE_GROUPS_PATH } from '../../app-constants';
import { MaterialModule } from '../../material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { of } from 'rxjs';
import { Role } from 'src/app/model/role.model';
import { MatDialog } from '@angular/material/dialog';
import { GroupNameListComponent } from '../list-detail/group-name-list/group-name-list.component';

describe('AllPrivilegeGroupsComponent', () => {
  let component: AllPrivilegeGroupsComponent;
  let fixture: ComponentFixture<AllPrivilegeGroupsComponent>;

  let httpMock: HttpTestingController;
  let http: HttpClient;
  let configService: ConfigService;
  let selectionService: SelectionService;
  let route: ActivatedRoute;
  let location: Location;
  let snackBar: MatSnackBar;
  let dialog: MatDialog;
  let commonGroupService: CommonGroupService;
  let privilegeGroupService: PrivilegeGroupService;
  let privilegeGroupPermissionsService: PrivilegeGroupPermissionsService;

  const privilegeGroupId = 'PGAA00001';
  const otherPrivilegeGroupId = 'PGAA00002';
  const privlegeGroupName = 'Name of the group';

  const privilegeGroup = PrivilegeGroup.map({
    identification: privilegeGroupId,
    groupName: privlegeGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!'
  } as IPrivilegeGroup);

  const otherPrivilegeGroup = PrivilegeGroup.map({
    identification: otherPrivilegeGroupId,
    groupName: privlegeGroupName,
    validFrom: new Date(2021, 9, 1),
    validTo: undefined,
    description: 'Bam!'
  } as IPrivilegeGroup);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: PRIVILEGE_GROUPS_PATH, component: AllPrivilegeGroupsComponent }]), MaterialModule, BrowserAnimationsModule],
      declarations: [AllPrivilegeGroupsComponent, ToolbarComponent, GroupNameListComponent]
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
    privilegeGroupService = TestBed.inject(PrivilegeGroupService);
    privilegeGroupPermissionsService = TestBed.inject(PrivilegeGroupPermissionsService);

    fixture = TestBed.createComponent(AllPrivilegeGroupsComponent);
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
    let getAllPrivilegeGroupsSpy = spyOn(privilegeGroupService, 'getAllPrivilegeGroups').and.returnValue(of([otherPrivilegeGroup, privilegeGroup]));

    component.ngOnInit();

    tick()

    expect(getAllPrivilegeGroupsSpy).toHaveBeenCalled();
    expect(component.selectedObject.identification).toEqual('');
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherPrivilegeGroup)).toBeTrue();
  }));

  it('ngOnInit - with id at route', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    let getAllPrivilegeGroupsSpy = spyOn(privilegeGroupService, 'getAllPrivilegeGroups').and.returnValue(of([otherPrivilegeGroup, privilegeGroup]));

    spyOn(route.snapshot.paramMap, 'has').and.returnValue(true);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(privilegeGroupId);

    component.ngOnInit();

    tick()

    expect(getAllPrivilegeGroupsSpy).toHaveBeenCalled();
    expect(component.selectedObject.equals(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherPrivilegeGroup)).toBeTrue();
  }));

  it('ngOnInit - parts, with id at route', fakeAsync(() => {
    privilegeGroup.isComplete = false;
    otherPrivilegeGroup.isComplete = false;
    let getAllPrivilegeGroupPartsSpy = spyOn(privilegeGroupService, 'getAllPrivilegeGroupParts').and.returnValue(of([otherPrivilegeGroup, privilegeGroup]));
    let getPrivilegeGroupSpy = spyOn(privilegeGroupService, 'getPrivilegeGroup').and.returnValue(of(privilegeGroup));

    spyOn(route.snapshot.paramMap, 'has').and.returnValue(true);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue(privilegeGroupId);

    component.ngOnInit();

    tick()

    expect(getAllPrivilegeGroupPartsSpy).toHaveBeenCalled();
    expect(getPrivilegeGroupSpy).toHaveBeenCalled();
    expect(component.selectedObject.equals(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherPrivilegeGroup)).toBeTrue();
  }));





  /**
   * onSelectObject
   */
  it('onSelectObject - non selected before', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let isAllowedToUpdatePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToUpdatePrivilegeGroup').and.returnValue(true);
    let getPrivilegeGroupSpy = spyOn(privilegeGroupService, 'getPrivilegeGroup').and.returnValue(of(privilegeGroup));

    component.onSelectObject(privilegeGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${PRIVILEGE_GROUPS_PATH}/${privilegeGroup.identification}`);
    expect(isAllowedToUpdatePrivilegeGroupSpy).toHaveBeenCalled();
    expect(getPrivilegeGroupSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === privilegeGroup).toBeFalse();
    expect(component.selectedObject.equals(privilegeGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(privilegeGroupId);
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - parts, non selected before', () => {
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let isAllowedToUpdatePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToUpdatePrivilegeGroup').and.returnValue(true);
    let getPrivilegeGroupSpy = spyOn(privilegeGroupService, 'getPrivilegeGroup').and.returnValue(of(privilegeGroup));


    component.onSelectObject(privilegeGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${PRIVILEGE_GROUPS_PATH}/${privilegeGroup.identification}`);
    expect(isAllowedToUpdatePrivilegeGroupSpy).toHaveBeenCalled();
    expect(getPrivilegeGroupSpy).toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === privilegeGroup).toBeFalse();
    expect(component.selectedObject.equals(privilegeGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(privilegeGroupId);
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - same selected before', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let isAllowedToUpdatePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToUpdatePrivilegeGroup').and.returnValue(true);
    let getPrivilegeGroupSpy = spyOn(privilegeGroupService, 'getPrivilegeGroup').and.returnValue(of(privilegeGroup));

    component.selectedObject = privilegeGroup;

    component.onSelectObject(privilegeGroup);

    expect(loactionSpy).not.toHaveBeenCalledOnceWith(`${PRIVILEGE_GROUPS_PATH}/${privilegeGroup.identification}`);
    expect(isAllowedToUpdatePrivilegeGroupSpy).toHaveBeenCalled();
    expect(getPrivilegeGroupSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === privilegeGroup).toBeFalse();
    expect(component.selectedObject.equals(privilegeGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(privilegeGroupId);
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - other selected before', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { })
    let isAllowedToUpdatePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToUpdatePrivilegeGroup').and.returnValue(true);
    let getPrivilegeGroupSpy = spyOn(privilegeGroupService, 'getPrivilegeGroup').and.returnValue(of(privilegeGroup));

    component.selectedObject = otherPrivilegeGroup;

    component.onSelectObject(privilegeGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${PRIVILEGE_GROUPS_PATH}/${privilegeGroup.identification}`);
    expect(isAllowedToUpdatePrivilegeGroupSpy).toHaveBeenCalled();
    expect(getPrivilegeGroupSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === privilegeGroup).toBeFalse();
    expect(component.selectedObject.equals(privilegeGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(privilegeGroupId);
    expect(component.disableUpdate).toBeFalse();
  });

  it('onSelectObject - not allowed to update', () => {
    component.areOnlyPartsToLoadAtList = false;
    let loactionSpy = spyOn(location, 'replaceState').and.callFake(() => { });
    let isAllowedToUpdatePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToUpdatePrivilegeGroup').and.returnValue(false);
    let getPrivilegeGroupSpy = spyOn(privilegeGroupService, 'getPrivilegeGroup').and.returnValue(of(privilegeGroup));

    component.onSelectObject(privilegeGroup);

    expect(loactionSpy).toHaveBeenCalledOnceWith(`${PRIVILEGE_GROUPS_PATH}/${privilegeGroup.identification}`);
    expect(isAllowedToUpdatePrivilegeGroupSpy).toHaveBeenCalled();
    expect(getPrivilegeGroupSpy).not.toHaveBeenCalled();

    expect(component.isNewObject).toBeFalse();
    expect(component.showObjectDetail).toBeTrue();
    expect(component.selectedObject === privilegeGroup).toBeFalse();
    expect(component.selectedObject.equals(privilegeGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toEqual(privilegeGroupId);
    expect(component.disableUpdate).toBeTrue();
  });




  /**
   * isObjectSelected
   */
  it('isObjectSelected - same privilegeGroup', () => {
    component.selectedObject = privilegeGroup;
    expect(component.isObjectSelected(privilegeGroup)).toBeTrue();
  });

  it('isObjectSelected - other privilegeGroup', () => {
    component.selectedObject = otherPrivilegeGroup;
    expect(component.isObjectSelected(privilegeGroup)).toBeFalse();
  });




  /**
   * onCreateObject
   */
  it('onCreateObject', () => {
    spyOn(privilegeGroupPermissionsService, 'isAllowedToUpdatePrivilegeGroup').and.returnValue(true);

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
  it('onAccept - create new privilege group', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherPrivilegeGroup;
    component.allObjectsfilterDataSource.data = [privilegeGroup];

    let createPrivilegeGroupSpy = spyOn(privilegeGroupService, 'createPrivilegeGroup').and.returnValue(of(otherPrivilegeGroup));
    let updateCreatedPrivilegeGroupSpy = spyOn(privilegeGroupService, 'updatePrivilegeGroup').and.returnValue(of(otherPrivilegeGroup));

    component.onAccept();

    tick();

    expect(createPrivilegeGroupSpy).toHaveBeenCalled;
    expect(updateCreatedPrivilegeGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === otherPrivilegeGroup).toBeFalse();
    expect(component.selectedObject.equals(otherPrivilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherPrivilegeGroup)).toBeTrue();
  }));

  it('onAccept - update existing privilege group', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedPrivilegeGroup = PrivilegeGroup.map(otherPrivilegeGroup);
    modfiedPrivilegeGroup.groupName = modfiedPrivilegeGroup.groupName.concat('_');
    component.selectedObject = modfiedPrivilegeGroup;
    component.allObjectsfilterDataSource.data = [privilegeGroup, otherPrivilegeGroup];

    let updatePrivilegeGroupSpy = spyOn(privilegeGroupService, 'updatePrivilegeGroup').and.returnValue(of(modfiedPrivilegeGroup));

    component.onAccept();

    tick();

    expect(updatePrivilegeGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === modfiedPrivilegeGroup).toBeFalse();
    expect(component.selectedObject.equals(modfiedPrivilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(modfiedPrivilegeGroup)).toBeTrue();
  }));

  it('onAccept - accept disabled', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = false;
    let modfiedPrivilegeGroup = PrivilegeGroup.map(otherPrivilegeGroup);
    modfiedPrivilegeGroup.groupName = '';
    component.selectedObject = modfiedPrivilegeGroup;
    component.allObjectsfilterDataSource.data = [privilegeGroup, otherPrivilegeGroup];

    let updatePrivilegeGroupSpy = spyOn(privilegeGroupService, 'updatePrivilegeGroup').and.returnValue(of(modfiedPrivilegeGroup));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });

    component.onAccept();

    tick();

    expect(updatePrivilegeGroupSpy).not.toHaveBeenCalled;
    expect(openMessage).toHaveBeenCalled();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));




  /**
   * onAcceptCallBack
   */
  it('onAcceptCallBack - create new privilege group', fakeAsync(() => {
    component.areOnlyPartsToLoadAtList = false;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.selectedObject = otherPrivilegeGroup;
    component.allObjectsfilterDataSource.data = [privilegeGroup];

    let createPrivilegeGroupSpy = spyOn(privilegeGroupService, 'createPrivilegeGroup').and.returnValue(of(otherPrivilegeGroup));
    let updateCreatedPrivilegeGroupSpy = spyOn(privilegeGroupService, 'updatePrivilegeGroup').and.returnValue(of(otherPrivilegeGroup));

    component.onAcceptCallBack();

    tick();

    expect(createPrivilegeGroupSpy).toHaveBeenCalled;
    expect(updateCreatedPrivilegeGroupSpy).toHaveBeenCalled;
    expect(component.selectedObject === otherPrivilegeGroup).toBeFalse();
    expect(component.selectedObject.equals(otherPrivilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherPrivilegeGroup)).toBeTrue();
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
    component.allObjectsfilterDataSource.data = [privilegeGroup, otherPrivilegeGroup];
    let deletePrivilegeGroupSpy = spyOn(privilegeGroupService, 'deletePrivilegeGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeletePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToDeletePrivilegeGroup').and.returnValue(true);

    component.selectedObject = otherPrivilegeGroup;
    component.selectedObjectIdentification = otherPrivilegeGroupId;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deletePrivilegeGroupSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();
    expect(isAllowedToDeletePrivilegeGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).not.toBeDefined();
  }));

  it('onDelete - delete unsuccessful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [privilegeGroup, otherPrivilegeGroup];
    let deletePrivilegeGroupSpy = spyOn(privilegeGroupService, 'deletePrivilegeGroup').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeletePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToDeletePrivilegeGroup').and.returnValue(true);

    component.selectedObject = otherPrivilegeGroup;
    component.selectedObjectIdentification = otherPrivilegeGroupId;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deletePrivilegeGroupSpy).toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();
    expect(isAllowedToDeletePrivilegeGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);

    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherPrivilegeGroup)).toBeTrue();
    expect(component.selectedObjectIdentification).toBeDefined();
  }));

  it('onDelete - delete disabled - new item', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [privilegeGroup, otherPrivilegeGroup];
    let deletePrivilegeGroupSpy = spyOn(privilegeGroupService, 'deletePrivilegeGroup').and.returnValue(of(false));
    let openMessage = spyOn(snackBar, 'open').and.callFake((message, action, config) => { return {} as MatSnackBarRef<TextOnlySnackBar> });
    let isAllowedToDeletePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToDeletePrivilegeGroup').and.returnValue(true);

    component.selectedObject = privilegeGroup;
    component.showObjectDetail = true;
    component.isNewObject = true;
    component.onDelete();

    tick();

    expect(deletePrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();
    expect(isAllowedToDeletePrivilegeGroupSpy).not.toHaveBeenCalled(); // since new one and short circle check

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherPrivilegeGroup)).toBeTrue();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));

  it('onDelete - delete disabled - not allowed to', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [privilegeGroup, otherPrivilegeGroup];
    let deletePrivilegeGroupSpy = spyOn(privilegeGroupService, 'deletePrivilegeGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeletePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToDeletePrivilegeGroup').and.returnValue(false);

    component.selectedObject = otherPrivilegeGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;
    component.onDelete();

    tick();

    expect(deletePrivilegeGroupSpy).not.toHaveBeenCalled();
    expect(openMessage).toHaveBeenCalled();
    expect(isAllowedToDeletePrivilegeGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(2);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
    expect(component.allObjectsfilterDataSource.data.includes(otherPrivilegeGroup)).toBeTrue();

    expect(component.selectedObject.identification).toEqual('');
    expect(component.showObjectDetail).toBeFalse();
    expect(component.isNewObject).toBeFalse();
  }));





  /**
   * onDeleteCallBack
   */
  it('onDeleteCallBack - delete successful', fakeAsync(() => {
    component.allObjectsfilterDataSource.data = [privilegeGroup, otherPrivilegeGroup];
    let deletePrivilegeGroupSpy = spyOn(privilegeGroupService, 'deletePrivilegeGroup').and.returnValue(of(true));
    let openMessage = spyOn(snackBar, 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);
    let isAllowedToDeletePrivilegeGroupSpy = spyOn(privilegeGroupPermissionsService, 'isAllowedToDeletePrivilegeGroup').and.returnValue(true);

    component.selectedObject = otherPrivilegeGroup;
    component.showObjectDetail = true;
    component.isNewObject = false;

    component.onDeleteCallBack();

    tick();

    expect(deletePrivilegeGroupSpy).toHaveBeenCalled();
    expect(openMessage).not.toHaveBeenCalled();
    expect(isAllowedToDeletePrivilegeGroupSpy).toHaveBeenCalled();

    expect(component.allObjectsfilterDataSource.data.length).toEqual(1);
    expect(component.allObjectsfilterDataSource.data.includes(privilegeGroup)).toBeTrue();
  }));




  /**
   * disableAccept/Callback
   */
  it('disableAccept - new privilege group', () => {
    component.isNewObject = true;
    component.selectedObject = privilegeGroup;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - new privilege group, but missing group name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: privilegeGroupId
    } as PrivilegeGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });


  it('disableAccept - new privilege group, but empty group name', () => {
    component.isNewObject = true;
    component.selectedObject = {
      identification: privilegeGroupId,
      groupName: ''
    } as PrivilegeGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing privilege group', () => {
    component.isNewObject = false;
    component.selectedObject = privilegeGroup;

    expect(component.disableAccept()).toBeFalse();
    expect(component.disableAcceptCallBack()).toBeFalse();
  });

  it('disableAccept - existing privilege group, but not modified', () => {
    component.onSelectObject(privilegeGroup);
    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing privilege group, but missing group name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: privilegeGroupId
    } as PrivilegeGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });

  it('disableAccept - existing privilege group, but empty group name', () => {
    component.isNewObject = false;
    component.selectedObject = {
      identification: privilegeGroupId,
      groupName: ''
    } as PrivilegeGroup

    expect(component.disableAccept()).toBeTrue();
    expect(component.disableAcceptCallBack()).toBeTrue();
  });




  /**
   * disableCreateObject
   */
  it('disableCreateObject - creating a privilege group is allowed', () => {
    spyOn(privilegeGroupPermissionsService, 'isAllowedCreatePrivilegeGroup').and.returnValue(true);
    expect(component.disableCreateObject()).toBeFalse();
  });

  it('disableCreateObject - creating a privilege group is not allowed', () => {
    spyOn(privilegeGroupPermissionsService, 'isAllowedCreatePrivilegeGroup').and.returnValue(false);
    expect(component.disableCreateObject()).toBeTrue();
  });




  /**
   * disableDelete/Callback
   */
  it('disableDelete - new privilege group', () => {
    component.isNewObject = true;
    spyOn(privilegeGroupPermissionsService, 'isAllowedToDeletePrivilegeGroup').and.returnValue(true);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
  });

  it('disableDelete - existing privilege group', () => {
    component.isNewObject = false;
    spyOn(privilegeGroupPermissionsService, 'isAllowedToDeletePrivilegeGroup').and.returnValue(true);

    expect(component.disableDelete()).toBeFalse();
    expect(component.disableDeleteCallBack()).toBeFalse();
  });

  it('disableDelete - existing privilege group, but not allowed to', () => {
    component.isNewObject = false;
    spyOn(privilegeGroupPermissionsService, 'isAllowedToDeletePrivilegeGroup').and.returnValue(false);

    expect(component.disableDelete()).toBeTrue();
    expect(component.disableDeleteCallBack()).toBeTrue();
  });



  /**
   * getRole
   */
  it('getRole', () => {
    expect(component.getRole('ADMIN')).toEqual(Role.ADMIN);
    expect(component.getRole('MANAGER')).toEqual(Role.MANAGER);
    expect(component.getRole('CONTRIBUTOR')).toEqual(Role.CONTRIBUTOR);
    expect(component.getRole('VISITOR')).toEqual(Role.VISITOR);
    expect(component.getRole('BLOCKED')).toEqual(Role.BLOCKED);
    expect(component.getRole('NOT_RELEVANT')).toEqual(Role.NOT_RELEVANT);
    expect(component.getRole('anything')).toEqual(Role.NOT_RELEVANT);
  });



  /**
   * onCleanFlattenedGroups
   */
  it('onCleanFlattenedGroups', () => {
    component.cleanFlattenSubGroupsTrigger = false;

    component.onCleanFlattenedGroups();
    expect(component.cleanFlattenSubGroupsTrigger).toBeTrue();

    component.onCleanFlattenedGroups();
    expect(component.cleanFlattenSubGroupsTrigger).toBeFalse();
  });



  /**
  * openHistoryDialogCallBack
  */
  it('openHistoryDialogCallBack - all ok', () => {
    component.selectedObject = privilegeGroup;
    let openSpy = spyOn(dialog, 'open');

    component.openHistoryDialogCallBack();

    expect(openSpy).toHaveBeenCalled;
  });
});
