import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseGroup, IBaseGroup } from '../../model/base-group.model';
import { BaseGroupIdRole } from '../../model/base-group-id-role.model';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Role } from '../../model/role.model';
import { Status } from '../../model/status.model';
import { ConfigService } from '../../config/config.service';
import { BaseBackendService, HTTP_JSON_OPTIONS, HTTP_URL_OPTIONS, RETRIES } from '../base/base-backend.service';
import { INITIAL_COMMON_GROUP_ID_AT_MOCK } from './common-group.service';
import { SelectionService } from '../util/selection.service';
import { INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK, PrivilegeGroupService, PRIVILEGES_AT_COMMON_GROUP } from './privilege-group.service';


const ALL_BASE_GOUPS_MOCK_KEY = 'baseGroups'
const NEXT_BASE_GOUP_ID_MOCK_KEY = 'nextBaseGroupId'
export const BASES_AT_COMMON_GROUP = 'basesAtCommonGroup'
const BASES_AT_BASE_GROUP = 'basesAtBaseGroup'
const BASES_AT_PRIVILEGE_GROUP = 'basesAtPrivilegeGroup'
export const INITIAL_BASE_GROUP_ID_AT_MOCK = 'BGAA00001'

@Injectable({
  providedIn: 'root'
})
export class BaseGroupService extends BaseBackendService {

  private getBaseGroupUrl: string | undefined;
  private getAllBaseGroupsUrl: string | undefined;
  private updateBaseGroupUrl: string | undefined;
  private createBaseGroupUrl: string | undefined;
  private deleteBaseGroupUrl: string | undefined;
  private countBaseGroupsUrl: string | undefined;
  private addBaseToBaseGroupUrl: string | undefined;
  private removeBaseFromBaseGroupUrl: string | undefined;
  private countBasesAtBaseGroupUrl: string | undefined;
  private getAllBasesAtBaseGroupUrl: string | undefined;
  private addBaseToPrivilegeGroupUrl: string | undefined;
  private removeBaseFromPrivilegeGroupUrl: string | undefined;
  private countBasesAtPrivilegeGroupUrl: string | undefined;
  private getAllBasesAtPrivilegeGroupUrl: string | undefined;


  constructor(private http: HttpClient, configService: ConfigService, private selectionService: SelectionService) {
    super('BaseGroupService', configService);
  }



  protected initServiceUrls(): boolean {
    if (this.config == undefined) {
      return false;
    }

    let baseGroupControllerUrl = this.config.backendBaseUrl.concat('/group/base');

    this.getBaseGroupUrl = baseGroupControllerUrl.concat('/getBaseGroup');
    this.getAllBaseGroupsUrl = baseGroupControllerUrl.concat('/getAllBaseGroups');
    this.updateBaseGroupUrl = baseGroupControllerUrl.concat('/updateBaseGroup');
    this.createBaseGroupUrl = baseGroupControllerUrl.concat('/createBaseGroup');
    this.deleteBaseGroupUrl = baseGroupControllerUrl.concat('/deleteBaseGroup');
    this.countBaseGroupsUrl = baseGroupControllerUrl.concat('/countBaseGroups');
    this.addBaseToBaseGroupUrl = baseGroupControllerUrl.concat('/addBaseToBaseGroup');
    this.removeBaseFromBaseGroupUrl = baseGroupControllerUrl.concat('/removeBaseFromBaseGroup');
    this.countBasesAtBaseGroupUrl = baseGroupControllerUrl.concat('/countBaseAtBaseGroup');
    this.getAllBasesAtBaseGroupUrl = baseGroupControllerUrl.concat('/findAllBaseAtBaseGroup');
    this.addBaseToPrivilegeGroupUrl = baseGroupControllerUrl.concat('/addBaseToPrivilegeGroup');
    this.removeBaseFromPrivilegeGroupUrl = baseGroupControllerUrl.concat('/removeBaseFromPrivilegeGroup');
    this.countBasesAtPrivilegeGroupUrl = baseGroupControllerUrl.concat('/countBaseAtPrivilegeGroup');
    this.getAllBasesAtPrivilegeGroupUrl = baseGroupControllerUrl.concat('/findAllBaseAtPrivilegeGroup');

    return true;
  }



  protected initServiceMocks(): void {
    if (!BaseBackendService.mockData.has(ALL_BASE_GOUPS_MOCK_KEY)) {
      BaseBackendService.mockData.set(ALL_BASE_GOUPS_MOCK_KEY, [] as BaseGroup[]);
    }
    (BaseBackendService.mockData.get(ALL_BASE_GOUPS_MOCK_KEY) as BaseGroup[]).push(
      BaseGroup.map({
        groupName: 'Mocked',
        identification: 'BGAA00001',
        description: 'A base group from the mock'
      } as BaseGroup)
    );
    if (!BaseBackendService.mockData.has(NEXT_BASE_GOUP_ID_MOCK_KEY)) {
      BaseBackendService.mockData.set(NEXT_BASE_GOUP_ID_MOCK_KEY, 2);
    }
    BaseBackendService.addEntryToStringToStringArrayMap(BASES_AT_COMMON_GROUP, INITIAL_COMMON_GROUP_ID_AT_MOCK, INITIAL_BASE_GROUP_ID_AT_MOCK);
    BaseBackendService.addEntryToStringToStringArrayMap(PRIVILEGES_AT_COMMON_GROUP, INITIAL_COMMON_GROUP_ID_AT_MOCK, INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK);
    if (!BaseBackendService.mockData.has(BASES_AT_BASE_GROUP)) {
      BaseBackendService.mockData.set(BASES_AT_BASE_GROUP, new Map<string, string[]>());
    }
    if (!BaseBackendService.mockData.has(BASES_AT_PRIVILEGE_GROUP)) {
      BaseBackendService.mockData.set(BASES_AT_PRIVILEGE_GROUP, new Map<string, BaseGroupIdRole[]>());
    }
  }



  /**
   * Determines all base groups at mock data
   * @returns array of all base groups
   */
  private getAllBaseGroupsFromMock(): BaseGroup[] {
    this.initMocks();
    return (BaseBackendService.mockData.get(ALL_BASE_GOUPS_MOCK_KEY) as BaseGroup[]);
  }



  /**
   * Determines all base groups at mock data for the selected common group
   * @returns array of all base groups at commongroup
   */
  private getAllBasesAtSelectedCommonGroupFromMock(): BaseGroup[] {
    let result: BaseGroup[] = [];
    let relevantBaseGroupIds = this.getAllBaseIdsAtSelectedCommonGroupFromMock();

    for (let bg of this.getAllBaseGroupsFromMock()) {
      if (relevantBaseGroupIds?.includes(bg.identification)) {
        result.push(bg);
      }
    }
    return result;
  }

  /**
   * Determines all base groups ids at mock data for the selected common group
   * @returns array of all base group ids at commongroup
   */
  private getAllBaseIdsAtSelectedCommonGroupFromMock(): string[] {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return [];
    }

    this.initMocks();

    return BaseGroupService.getBaseGroupIdsFromMock(commonGroup.identification);
  }

  /**
   * Determines all privilege groups ids at mock data for the selected common group
   * @returns array of all privilege group ids at commongroup
   */
  private getAllPrivielgeIdsAtSelectedCommonGroupFromMock(): string[] {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return [];
    }

    this.initMocks();

    return PrivilegeGroupService.getPrivilegeGroupIdsFromMock(commonGroup.identification);
  }

  /**
   * Determines the string array which contains the ids of base groups contained by a given common group
   * @param commonGroupIdentification the id of the common group whose base groups are searched for 
   * @returns the array of the base group ids
   */
  public static getBaseGroupIdsFromMock(commonGroupIdentification: string): string[] {
    return BaseBackendService.getIdsFromMock(commonGroupIdentification, BASES_AT_COMMON_GROUP);
  }

  /**
   * Determines the string array which contains the ids of base groups contained by a given other base group
   * @param baseGroupIdentification the id of the base group whose base groups are searched for 
   * @returns the array of the base group ids
   */
  public static getSubBaseGroupIdsFromMock(baseGroupIdentification: string): string[] {
    return BaseBackendService.getIdsFromMock(baseGroupIdentification, BASES_AT_BASE_GROUP);
  }

  /**
   * Determines the string array which contains the ids of base groups contained by a given other privilege group
   * @param baseGroupIdentification the id of the privilege group whose base groups are searched for 
   * @returns the array of the base group ids and their roles
   */
  public static getBaseGroupIdRolesAtPrivilegeFromMock(privilegeGroupIdentification: string): BaseGroupIdRole[] {
    let result = (BaseBackendService.mockData.get(BASES_AT_PRIVILEGE_GROUP) as Map<string, BaseGroupIdRole[]>).get(privilegeGroupIdentification);
    if (result == undefined) {
      result = [];
      (BaseBackendService.mockData.get(BASES_AT_PRIVILEGE_GROUP) as Map<string, BaseGroupIdRole[]>).set(privilegeGroupIdentification, result);
    }
    return result;
  }


  /**
   * Get a base group from the back end
   * @param identification id of the base group
   * @returns the base group
   */
  public getBaseGroup(identification: string): Observable<BaseGroup> {
    this.init();
    if (this.useMock) {
      return this.getBaseGroupMock(identification);
    }
    let url = `${this.getBaseGroupUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let baseGroup = this.checkErrorAndGetResponse<IBaseGroup>(data, `occurs while getting base group ${identification} from backend`);
        return BaseGroup.map(baseGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for getting a base group
   * @param identification id of the base group
   * @returns the mocked observable of the base group
   */
  private getBaseGroupMock(identification: string): Observable<BaseGroup> {
    for (let bg of this.getAllBasesAtSelectedCommonGroupFromMock())
      if (bg.identification == identification) {
        return of(bg);
      }
    return throwError(new Error(`${Status.ERROR} occurs while getting base group ${identification} from backend`));
  }



  /**
   * Get all base groups from the backend
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the base groups
   */
  public getAllBaseGroups(page: number | undefined, size: number | undefined): Observable<BaseGroup[]> {
    this.init();
    if (this.useMock) {
      return this.getAllBaseGroupsMock();
    }
    let url = `${this.getAllBaseGroupsUrl}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: this.createPageingParams(page, size)
    }).pipe(
      map(data => {
        let baseGroups = this.checkErrorAndGetResponse<IBaseGroup[]>(data, `ooccurs while getting all base groups from backend`);
        let result: BaseGroup[] = new Array(baseGroups.length);
        for (let i = 0; i < baseGroups.length; i++) {
          result[i] = BaseGroup.map(baseGroups[i]);
        }
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for getting all base groups
   * @returns the mocked observable of all base groups
   */
  private getAllBaseGroupsMock(): Observable<BaseGroup[]> {
    let copy: BaseGroup[] = [];
    for (let bg of this.getAllBasesAtSelectedCommonGroupFromMock()) {
      copy.push(bg)
    }
    return of(copy);
  }



  /**
   * Count base groups at the backend
   * @param commonGroupIdentification the id of the common group where to count at
   * @returns the number base groups at the common group
   */
  public countBaseGroups(commonGroupIdentification: string): Observable<number> {
    this.init();
    if (this.useMock) {
      return this.countBaseGroupsMock(commonGroupIdentification);
    }
    let url = `${this.countBaseGroupsUrl}/${commonGroupIdentification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<number>(data, `occurs while counting base groups at ${commonGroupIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for counting  base groups
   * @param commonGroupIdentification the id of the common group where to count at
   * @returns the mocked observable of the counted number
   */
  private countBaseGroupsMock(commonGroupIdentification: string): Observable<number> {
    this.initMocks();
    return of(BaseGroupService.getBaseGroupIdsFromMock(commonGroupIdentification).length);
  }



  /**
   * Creates a base group
   * @param groupName the name of the group
   * @returns the new created base group
   */
  public createBaseGroup(groupName: string): Observable<BaseGroup> {
    this.init();
    if (this.useMock) {
      return this.createBaseGroupMock(groupName);
    }

    let url = `${this.createBaseGroupUrl}`;
    let body = `groupName=${groupName}`;

    return this.http.post<ResponseWrapper>(url, body, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let baseGroup = this.checkErrorAndGetResponse<IBaseGroup>(data, `occurs while creating base group at backend`);
        return BaseGroup.map(baseGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * creates a new base group at mock
   * @param groupName name of the group
   * @returns the mocked observable of the new base group
   */
  private createBaseGroupMock(groupName: string): Observable<BaseGroup> {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(new Error(`${Status.ERROR} occurs while creating base group at backend`));
    }
    this.initMocks();
    let idBase = 'BGAA';
    let nextBaseGroupIdMock = BaseBackendService.mockData.get(NEXT_BASE_GOUP_ID_MOCK_KEY);

    let idExtend = `${nextBaseGroupIdMock}`;
    while (idExtend.length < 5) {
      idExtend = '0'.concat(idExtend);
    }
    BaseBackendService.mockData.set(NEXT_BASE_GOUP_ID_MOCK_KEY, nextBaseGroupIdMock + 1);

    let addedBaseGroup: BaseGroup = BaseGroup.map(
      {
        identification: idBase.concat(idExtend),
        groupName: groupName,
        description: undefined,
        validFrom: new Date(),
        validTo: undefined
      } as IBaseGroup);

    this.getAllBaseGroupsFromMock().push(addedBaseGroup);
    BaseGroupService.getBaseGroupIdsFromMock(commonGroup.identification).push(addedBaseGroup.identification);

    return of(addedBaseGroup);
  }



  /**
   * Deletes a base group in the backend
   * @param identification id of the base group to delete
   * @returns true if the base group was deleted. Otherwise false
   */
  public deleteBaseGroup(identification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.deleteBaseGroupMock(identification);
    }
    let url = `${this.deleteBaseGroupUrl}/${identification}`;

    return this.http.delete<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while deleting base group ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * deletes a base group at mock
   * @param identification id of the base group to delete
   * @returns the mocked observable of succesfull deletion
   */
  private deleteBaseGroupMock(identification: string): Observable<boolean> {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(new Error(`${Status.ERROR} occurs while deleting base group ${identification} at backend`));
    }

    this.initMocks();

    let baseGroupIds = BaseGroupService.getBaseGroupIdsFromMock(commonGroup.identification);
    if (!baseGroupIds.includes(identification)) {
      return of(false);
    }
    baseGroupIds.splice(baseGroupIds.indexOf(identification), 1);

    let baseGroups = this.getAllBaseGroupsFromMock();
    for (let i = 0; i < baseGroups.length; i++) {
      if (baseGroups[i].identification == identification) {
        baseGroups.splice(i, 1);
        return of(true);
      }
    }
    return of(false);
  }



  /**
   * Updates a base group in the backend
   * @param modifiedGroup the modefied base group to put in the backend
   * @returns the stored base group
   */
  public updateBaseGroup(modifiedBaseGroup: BaseGroup): Observable<BaseGroup> {
    this.init();
    if (this.useMock) {
      return this.updateBaseGroupMock(modifiedBaseGroup);
    }
    let url = `${this.updateBaseGroupUrl}/${modifiedBaseGroup.identification}`;

    return this.http.put<ResponseWrapper>(url, modifiedBaseGroup as IBaseGroup, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        let baseGroup = this.checkErrorAndGetResponse<IBaseGroup>(data, `occurs while updating base group ${modifiedBaseGroup.identification} at backend`);
        return BaseGroup.map(baseGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for updating a base group
   * @param modifiedBaseGroup the modified base group
   * @returns the mocked observable of the base group
   */
  private updateBaseGroupMock(modifiedBaseGroup: BaseGroup): Observable<BaseGroup> {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    this.initMocks();

    if (commonGroup == undefined || !BaseGroupService.getBaseGroupIdsFromMock(commonGroup.identification).includes(modifiedBaseGroup.identification)) {
      return throwError(new Error(`${Status.ERROR} occurs while updating base group ${modifiedBaseGroup.identification} at backend`));
    }

    let baseGroups = this.getAllBaseGroupsFromMock()
    for (let i = 0; i < baseGroups.length; i++) {
      if (baseGroups[i].identification == modifiedBaseGroup.identification) {
        baseGroups[i] = BaseGroup.map(modifiedBaseGroup);
        return of(BaseGroup.map(modifiedBaseGroup));
      }
    }
    return throwError(new Error(`${Status.ERROR} occurs while updating base group ${modifiedBaseGroup.identification} at backend`));
  }



  /**
   * Adds a base group to an other one
   * @param childIdentification id of the child base group to add
   * @param parentIdentification id of the parent base group where to add at
   * @returns true if the group was added. Otherwise false
   */
  addBaseToBaseGroup(childIdentification: string, parentIdentification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.addBaseToBaseGroupMock(childIdentification, parentIdentification);
    }
    let url = `${this.addBaseToBaseGroupUrl}/${parentIdentification}`;

    return this.http.patch<ResponseWrapper>(url, {
      baseGroupIdentification: childIdentification
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while adding base group ${childIdentification} to base group ${parentIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Adds a base group to an other one at mock
   * @param childIdentification id of the child base group to add
   * @param parentIdentification id of the parent base group where to add at
   * @returns mocked reponse of adding the sub base group
   */
  private addBaseToBaseGroupMock(childIdentification: string, parentIdentification: string): Observable<boolean> {
    this.initMocks();

    let allBaseGroupIds = this.getAllBaseIdsAtSelectedCommonGroupFromMock();
    if (!allBaseGroupIds.includes(childIdentification) || !allBaseGroupIds.includes(parentIdentification)) {
      return throwError(new Error(`${Status.ERROR} occurs while adding base group ${childIdentification} to base group ${parentIdentification} at backend`));
    }

    let subBaseGroups = BaseGroupService.getSubBaseGroupIdsFromMock(parentIdentification);
    if (subBaseGroups.includes(childIdentification)) {
      return of(false);
    }

    subBaseGroups.push(childIdentification);
    return of(true);
  }



  /**
   * Removes a base group from an other one
   * @param childIdentification id of the child base group to remove
   * @param parentIdentification id of the parent base group where to remove from
   * @returns true if the group was removed. Otherwise false
   */
  removeBaseFromBaseGroup(childIdentification: string, parentIdentification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.removeBaseFromBaseGroupMock(childIdentification, parentIdentification);
    }
    let url = `${this.removeBaseFromBaseGroupUrl}/${parentIdentification}`;

    return this.http.patch<ResponseWrapper>(url, {
      baseGroupIdentification: childIdentification
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while removing base group ${childIdentification} from base group ${parentIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Removes a base group from an other one at mock
   * @param childIdentification id of the child base group to remove
   * @param parentIdentification id of the parent base group where to remove fromt
   * @returns mocked reponse of removing the sub base group
   */
  private removeBaseFromBaseGroupMock(childIdentification: string, parentIdentification: string): Observable<boolean> {
    this.initMocks();

    let allBaseGroupIds = this.getAllBaseIdsAtSelectedCommonGroupFromMock();
    if (!allBaseGroupIds.includes(childIdentification) || !allBaseGroupIds.includes(parentIdentification)) {
      return throwError(new Error(`${Status.ERROR} occurs while removing base group ${childIdentification} from base group ${parentIdentification} at backend`));
    }

    let subBaseGroups = BaseGroupService.getSubBaseGroupIdsFromMock(parentIdentification);
    if (!subBaseGroups.includes(childIdentification)) {
      return of(false);
    }

    subBaseGroups.splice(subBaseGroups.indexOf(childIdentification), 1);
    return of(true);
  }



  /**
   * Count sub base groups of an other one at the backend
   * @param baseGroupIdentification the id of the base group where to count at
   * @returns the number sub base groups at the base group
   */
  public countBasesAtBaseGroup(baseGroupIdentification: string): Observable<number> {
    this.init();
    if (this.useMock) {
      return this.countBasesAtBaseGroupMock(baseGroupIdentification);
    }
    let url = `${this.countBasesAtBaseGroupUrl}/${baseGroupIdentification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<number>(data, `occurs while counting base groups at ${baseGroupIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for counting sub base groups of an other one
   * @param baseGroupIdentification the id of the base group where to count at
   * @returns the mocked observable of the counted number
   */
  private countBasesAtBaseGroupMock(baseGroupIdentification: string): Observable<number> {
    this.initMocks();
    return of(BaseGroupService.getSubBaseGroupIdsFromMock(baseGroupIdentification).length);
  }



  /**
   * Get all sub base groups of an other one from the backend
   * @param parentIdentification Id of the parent base group
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the base groups
   */
  public getAllBasesAtBaseGroup(parentIdentification: string, page: number | undefined, size: number | undefined): Observable<BaseGroup[]> {
    this.init();
    if (this.useMock) {
      return this.getAllBasesAtBaseGroupMock(parentIdentification);
    }
    let url = `${this.getAllBasesAtBaseGroupUrl}/${parentIdentification}`;

    return this.getAllBaseFromGroup(url, parentIdentification, undefined, page, size);
  }



  /**
   * Creates mock for getting all sub base groups of an other one
   * @param parentIdentification Id of the parent base group
   * @returns the mocked observable of all sub base groups
   */
  private getAllBasesAtBaseGroupMock(parentIdentification: string): Observable<BaseGroup[]> {
    let result: BaseGroup[] = [];
    let subBaseGroupIds = BaseGroupService.getSubBaseGroupIdsFromMock(parentIdentification);
    for (let bg of this.getAllBasesAtSelectedCommonGroupFromMock()) {
      if (subBaseGroupIds.includes(bg.identification)) {
        result.push(bg)
      }
    }
    return of(result);
  }



  /**
  * Adds a base group to a privilege one
  * @param childIdentification id of the child base group to add
  * @param parentIdentification id of the parent privilege group where to add at
  * @param role the role which the base group should have at the privilege group
  * @returns true if the group was added. Otherwise false
  */
  addBaseToPrivilegeGroup(childIdentification: string, parentIdentification: string, role: Role): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.addBaseToPrivilegeGroupMock(childIdentification, parentIdentification, role);
    }
    let url = `${this.addBaseToPrivilegeGroupUrl}/${parentIdentification}`;

    let baseGroupIdRole = new BaseGroupIdRole(childIdentification, role);

    return this.http.patch<ResponseWrapper>(url, {
      baseGroupRole: baseGroupIdRole
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while adding base group ${childIdentification} to privilege group ${parentIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Adds a base group to a privilege one at mock
   * @param childIdentification id of the child base group to add
   * @param parentIdentification id of the parent privilege group where to add at
   * @param role the role which the base group should have at the privilege group
   * @returns mocked reponse of adding the sub base group
   */
  private addBaseToPrivilegeGroupMock(childIdentification: string, parentIdentification: string, role: Role): Observable<boolean> {
    this.initMocks();

    let allBaseGroupIds = this.getAllBaseIdsAtSelectedCommonGroupFromMock();
    let allPrivilegeGroupIds = this.getAllPrivielgeIdsAtSelectedCommonGroupFromMock();

    if (!allBaseGroupIds.includes(childIdentification) || !allPrivilegeGroupIds.includes(parentIdentification)) {
      return throwError(new Error(`${Status.ERROR} occurs while adding base group ${childIdentification} to privilege group ${parentIdentification} at backend`));
    }

    let subBaseGroups = BaseGroupService.getBaseGroupIdRolesAtPrivilegeFromMock(parentIdentification);
    for (let br of subBaseGroups) {
      if (br.baseGroupIdentification == childIdentification) {
        return of(false);
      }
    }

    let baseGroupIdRole = new BaseGroupIdRole(childIdentification, role);
    subBaseGroups.push(baseGroupIdRole);
    return of(true);
  }



  /**
   * Removes a base group from a privilege one
   * @param childIdentification id of the child base group to remove
   * @param parentIdentification id of the parent privilege group where to remove from
   * @returns true if the group was removed. Otherwise false
   */
  removeBaseFromPrivilegeGroup(childIdentification: string, parentIdentification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.removeBaseFromPrivilegeGroupMock(childIdentification, parentIdentification);
    }
    let url = `${this.removeBaseFromPrivilegeGroupUrl}/${parentIdentification}`;

    return this.http.patch<ResponseWrapper>(url, {
      baseGroupIdentification: childIdentification
    }, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while removing base group ${childIdentification} from privilege group ${parentIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }


  /**
   * Removes a base group from a privilege one at mock
   * @param childIdentification id of the child base group to remove
   * @param parentIdentification id of the parent privilege group where to remove fromt
   * @returns mocked reponse of removing the sub base group
   */
  private removeBaseFromPrivilegeGroupMock(childIdentification: string, parentIdentification: string): Observable<boolean> {
    this.initMocks();

    let allBaseGroupIds = this.getAllBaseIdsAtSelectedCommonGroupFromMock();
    let allPrivilegeGroupIds = this.getAllPrivielgeIdsAtSelectedCommonGroupFromMock();

    if (!allBaseGroupIds.includes(childIdentification) || !allPrivilegeGroupIds.includes(parentIdentification)) {
      return throwError(new Error(`${Status.ERROR} occurs while removing base group ${childIdentification} from privilege group ${parentIdentification} at backend`));
    }

    let subBaseGroups = BaseGroupService.getBaseGroupIdRolesAtPrivilegeFromMock(parentIdentification);
    for (let i = 0; i < subBaseGroups.length; i++) {
      if (subBaseGroups[i].baseGroupIdentification == childIdentification) {
        subBaseGroups.splice(i, 1);
        return of(true);
      }
    }

    return of(false);
  }



  /**
   * Count sub base groups of a privilege one at the backend
   * @param privilegeGroupIdentification the id of the privilege group where to count at
   * @param role the role which filter the base groups to be count. If undefined all will becount.
   * @returns the number sub base groups at the privilege group
   */
  public countBasesAtPrivilegeGroup(privilegeGroupIdentification: string, role: Role | undefined): Observable<number> {
    this.init();
    if (this.useMock) {
      return this.countBasesAtPrivilegeGroupMock(privilegeGroupIdentification, role);
    }
    let url = `${this.countBasesAtPrivilegeGroupUrl}/${privilegeGroupIdentification}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: this.createPageingRoleParams(role, undefined, undefined)
    }).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<number>(data, `occurs while counting base groups at ${privilegeGroupIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for counting sub base groups of a privilege one at mock
   * @param privilegeGroupIdentification the id of the privilege group where to count at
   * @param role the role which filter the base groups to be count. If undefined all will becount.
   * @returns the mocked observable of the counted number
   */
  private countBasesAtPrivilegeGroupMock(privilegeGroupIdentification: string, role: Role | undefined): Observable<number> {
    this.initMocks();
    let subBaseGroups = BaseGroupService.getBaseGroupIdRolesAtPrivilegeFromMock(privilegeGroupIdentification);
    if (role == undefined) {
      return of(subBaseGroups.length);
    }
    let count = 0;
    for (let br of subBaseGroups) {
      if (br.role == role) {
        count++;
      }
    }
    return of(count);
  }



  /**
   * Get all sub base groups of a privilege one from the backend
   * @param parentIdentification Id of the parent base group
   * @param role the role which filter the base groups. If undefined all will be determined
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the base groups
   */
  public getAllBasesAtPrivilegeGroup(parentIdentification: string, role: Role | undefined, page: number | undefined, size: number | undefined): Observable<BaseGroup[]> {
    this.init();
    if (this.useMock) {
      return this.getAllBasesAtrivilegeGroupMock(parentIdentification, role);
    }
    let url = `${this.getAllBasesAtPrivilegeGroupUrl}/${parentIdentification}`;

    return this.getAllBaseFromGroup(url, parentIdentification, role, page, size);
  }

  /**
   * Get all base groups of an other parent group from the backend
   * @param url url of the get target, including parameters
   * @param parentIdentification Id of the parent base group
   * @param role the role which filter the base groups. If undefined all will be determined
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the base groups
   */
  private getAllBaseFromGroup(url: string, parentIdentification: string, role: Role | undefined, page: number | undefined, size: number | undefined): Observable<BaseGroup[]> {
    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: this.createPageingRoleParams(role, page, size)
    }).pipe(
      map(data => {
        let baseGroups = this.checkErrorAndGetResponse<IBaseGroup[]>(data, `occurs while getting all sub base groups of ${parentIdentification} from backend`);
        let result: BaseGroup[] = new Array(baseGroups.length);
        for (let i = 0; i < baseGroups.length; i++) {
          result[i] = BaseGroup.map(baseGroups[i]);
        }
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for getting all sub base groups of a privilege one
   * @param parentIdentification Id of the parent base group
   * @param role the role which filter the base groups. If undefined all will be determined
   * @returns the mocked observable of all sub base groups
   */
  private getAllBasesAtrivilegeGroupMock(parentIdentification: string, role: Role | undefined): Observable<BaseGroup[]> {
    this.initMocks();
    let result: BaseGroup[] = [];
    let baseGroups = this.getAllBasesAtSelectedCommonGroupFromMock();

    for (let br of BaseGroupService.getBaseGroupIdRolesAtPrivilegeFromMock(parentIdentification)) {
      if (role != undefined && br.role != role) {
        continue;
      }
      for (let bg of baseGroups) {
        if (bg.identification == br.baseGroupIdentification) {
          result.push(bg);
          break;
        }
      }
    }

    return of(result);
  }
}
