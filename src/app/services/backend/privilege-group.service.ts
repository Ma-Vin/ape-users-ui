import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { PrivilegeGroup, IPrivilegeGroup } from '../../model/privilege-group.model';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Status } from '../../model/status.model';
import { ConfigService } from '../../config/config.service';
import { BaseBackendService, HTTP_JSON_OPTIONS, HTTP_URL_OPTIONS, RETRIES } from '../base/base-backend.service';
import { INITIAL_COMMON_GROUP_ID_AT_MOCK } from './common-group.service';
import { SelectionService } from '../util/selection.service';
import { HistoryChange } from 'src/app/model/history-change.model';


const ALL_PRIVILEGE_GOUPS_MOCK_KEY = 'privilegeGroups'
const NEXT_PRIVILEGE_GOUP_ID_MOCK_KEY = 'nextPrivilegeGroupId'
export const PRIVILEGES_AT_COMMON_GROUP = 'privilegesAtCommonGroup'
export const INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK = 'PGAA00001'

@Injectable({
  providedIn: 'root'
})
export class PrivilegeGroupService extends BaseBackendService {

  private getPrivilegeGroupUrl: string | undefined;
  private getAllPrivilegeGroupsUrl: string | undefined;
  private getAllPrivilegeGroupPartsUrl: string | undefined;
  private getPrivilegeGroupHistoryUrl: string | undefined;
  private updatePrivilegeGroupUrl: string | undefined;
  private createPrivilegeGroupUrl: string | undefined;
  private deletePrivilegeGroupUrl: string | undefined;
  private countPrivilegeGroupsUrl: string | undefined;



  constructor(protected http: HttpClient, configService: ConfigService, private selectionService: SelectionService) {
    super(http, 'PrivilegeGroupService', configService);
  }



  protected initServiceUrls(): boolean {
    if (this.config == undefined) {
      return false;
    }

    let privilegeGroupControllerUrl = this.config.backendBaseUrl.concat('/group/privilege');

    this.getPrivilegeGroupUrl = privilegeGroupControllerUrl.concat('/getPrivilegeGroup');
    this.getAllPrivilegeGroupsUrl = privilegeGroupControllerUrl.concat('/getAllPrivilegeGroups');
    this.getAllPrivilegeGroupPartsUrl = privilegeGroupControllerUrl.concat('/getAllPrivilegeGroupParts');
    this.getPrivilegeGroupHistoryUrl = privilegeGroupControllerUrl.concat('/getPrivilegeGroupHistory');
    this.updatePrivilegeGroupUrl = privilegeGroupControllerUrl.concat('/updatePrivilegeGroup');
    this.createPrivilegeGroupUrl = privilegeGroupControllerUrl.concat('/createPrivilegeGroup');
    this.deletePrivilegeGroupUrl = privilegeGroupControllerUrl.concat('/deletePrivilegeGroup');
    this.countPrivilegeGroupsUrl = privilegeGroupControllerUrl.concat('/countPrivilegeGroups');
    return true;
  }



  protected initServiceMocks(): void {
    if (!BaseBackendService.mockData.has(ALL_PRIVILEGE_GOUPS_MOCK_KEY)) {
      BaseBackendService.mockData.set(ALL_PRIVILEGE_GOUPS_MOCK_KEY, [] as PrivilegeGroup[]);
    }
    (BaseBackendService.mockData.get(ALL_PRIVILEGE_GOUPS_MOCK_KEY) as PrivilegeGroup[]).push(
      PrivilegeGroup.map({
        groupName: 'Mocked',
        identification: INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK,
        description: 'A privilege group from the mock'
      } as PrivilegeGroup)
    );
    if (!BaseBackendService.mockData.has(NEXT_PRIVILEGE_GOUP_ID_MOCK_KEY)) {
      BaseBackendService.mockData.set(NEXT_PRIVILEGE_GOUP_ID_MOCK_KEY, 2);
    }
    BaseBackendService.addEntryToStringToStringArrayMap(PRIVILEGES_AT_COMMON_GROUP, INITIAL_COMMON_GROUP_ID_AT_MOCK, INITIAL_PRIVILEGE_GROUP_ID_AT_MOCK);
  }



  /**
   * Determines all privilege groups at mock data
   * @returns array of all privilege groups
   */
  private getAllPrivilegeGroupsFromMock(): PrivilegeGroup[] {
    this.initMocks();
    return (BaseBackendService.mockData.get(ALL_PRIVILEGE_GOUPS_MOCK_KEY) as PrivilegeGroup[]);
  }



  /**
   * Determines all privilege groups at mock data for the selected common group
   * @returns array of all privilege groups at commongroup
   */
  private getAllPrivilegesAtSelectedCommonGroupFromMock(): PrivilegeGroup[] {
    let result: PrivilegeGroup[] = [];
    let relevantPrivilegeGroupIds = this.getAllPrivielgeIdsAtSelectedCommonGroupFromMock();

    for (let bg of this.getAllPrivilegeGroupsFromMock()) {
      if (relevantPrivilegeGroupIds?.includes(bg.identification)) {
        result.push(bg);
      }
    }
    return result;
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
   * Determines the string array which contains the ids of privilege groups contained by a given common group
   * @param commonGroupIdentification the id of the common group whose privilege groups are searched for 
   * @returns the array of the privilege group ids
   */
  public static getPrivilegeGroupIdsFromMock(commonGroupIdentification: string): string[] {
    return BaseBackendService.getIdsFromMock(commonGroupIdentification, PRIVILEGES_AT_COMMON_GROUP);
  }


  /**
   * Get a privilege group from the back end
   * @param identification id of the privilege group
   * @returns the privilege group
   */
  public getPrivilegeGroup(identification: string): Observable<PrivilegeGroup> {
    this.init();
    if (this.useMock) {
      return this.getPrivilegeGroupMock(identification);
    }
    let url = `${this.getPrivilegeGroupUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let privilegeGroup = this.checkErrorAndGetResponse<IPrivilegeGroup>(data, `occurs while getting privilege group ${identification} from backend`);
        return PrivilegeGroup.map(privilegeGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }



  /**
   * Creates mock for getting a privilege group
   * @param identification id of the privilege group
   * @returns the mocked observable of the privilege group
   */
  private getPrivilegeGroupMock(identification: string): Observable<PrivilegeGroup> {
    for (let bg of this.getAllPrivilegesAtSelectedCommonGroupFromMock())
      if (bg.identification == identification) {
        return of(bg);
      }
    return throwError(() => new Error(`${Status.ERROR} occurs while getting privilege group ${identification} from backend`));
  }



  /**
   * Get all privilege groups from the backend
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the privilege groups
   */
  public getAllPrivilegeGroups(page: number | undefined, size: number | undefined): Observable<PrivilegeGroup[]> {
    this.init();
    return this.getAllPrivilegeGroupsWithUrl(page, size, `${this.getAllPrivilegeGroupsUrl}`, true);
  }



  /**
   * Get all privilege group parts from the backend
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the privilege group parts
   */
  public getAllPrivilegeGroupParts(page: number | undefined, size: number | undefined): Observable<PrivilegeGroup[]> {
    this.init();
    return this.getAllPrivilegeGroupsWithUrl(page, size, `${this.getAllPrivilegeGroupPartsUrl}`, false);
  }



  /**
   * Get all privilege group or group parts with reduced data from the backend
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @param url the url where to get the data from backend
   * @param isComplete indicator if the url points to the endpoint which return the complete entity or the one with reduced data
   * @returns the privilege groups
   */
  private getAllPrivilegeGroupsWithUrl(page: number | undefined, size: number | undefined, url: string, isComplete: boolean): Observable<PrivilegeGroup[]> {
    if (this.useMock) {
      return this.getAllPrivilegeGroupsMock(isComplete);
    }

    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(() => new Error(`${Status.ERROR} occurs while privilege base group at backend`));
    }

    return this.http.get<ResponseWrapper>(`${url}/${commonGroup.identification}`, {
      headers: HTTP_URL_OPTIONS.headers,
      params: this.createPageingParams(page, size)
    }).pipe(
      map(data => {
        let privilegeGroups = this.checkErrorAndGetResponse<IPrivilegeGroup[]>(data, `ooccurs while getting all privilege groups from backend`);
        let result: PrivilegeGroup[] = new Array(privilegeGroups.length);
        for (let i = 0; i < privilegeGroups.length; i++) {
          result[i] = PrivilegeGroup.map(privilegeGroups[i]);
          result[i].isComplete = isComplete;
        }
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }


  /**
   * Creates mock for getting all privilege groups
   * @param isComplete indicator whether return privilege groups completly or with reduced data
   * @returns the mocked observable of all privilege groups
   */
  private getAllPrivilegeGroupsMock(isComplete: boolean): Observable<PrivilegeGroup[]> {
    let copy: PrivilegeGroup[] = [];
    for (let bg of this.getAllPrivilegesAtSelectedCommonGroupFromMock()) {
      let entry = PrivilegeGroup.map(bg);
      if (!isComplete) {
        entry.description = undefined;
        entry.validFrom = undefined;
        entry.validTo = undefined;
      }
      entry.isComplete = isComplete;
      copy.push(entry);
    }
    return of(copy);
  }



  /**
   * Count privilege groups at the backend
   * @param commonGroupIdentification the id of the common group where to count at
   * @returns the number privilege groups at the common group
   */
  public countPrivilegeGroups(commonGroupIdentification: string): Observable<number> {
    this.init();
    if (this.useMock) {
      return this.countPrivilegeGroupsMock(commonGroupIdentification);
    }
    let url = `${this.countPrivilegeGroupsUrl}/${commonGroupIdentification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<number>(data, `occurs while counting privilege groups at ${commonGroupIdentification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }



  /**
   * Creates mock for counting  privilege groups
   * @param commonGroupIdentification the id of the common group where to count at
   * @returns the mocked observable of the counted number
   */
  private countPrivilegeGroupsMock(commonGroupIdentification: string): Observable<number> {
    this.initMocks();
    return of(PrivilegeGroupService.getPrivilegeGroupIdsFromMock(commonGroupIdentification).length);
  }



  /**
   * Creates a privilege group
   * @param groupName the name of the group
   * @returns the new created privilege group
   */
  public createPrivilegeGroup(groupName: string): Observable<PrivilegeGroup> {
    this.init();
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(() => new Error(`${Status.ERROR} occurs while creating privilege group at backend`));
    }
    if (this.useMock) {
      return this.createPrivilegeGroupMock(groupName, commonGroup.identification);
    }

    let url = `${this.createPrivilegeGroupUrl}`;
    let body = `groupName=${groupName}&commonGroupIdentification=${commonGroup.identification}`;

    return this.http.post<ResponseWrapper>(url, body, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let privilegeGroup = this.checkErrorAndGetResponse<IPrivilegeGroup>(data, `occurs while creating privilege group at backend`);
        return PrivilegeGroup.map(privilegeGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }



  /**
   * creates a new privilege group at mock
   * @param groupName name of the group
   * @param commonGroupIdentification identification of the common group
   * @returns the mocked observable of the new privilege group
   */
  private createPrivilegeGroupMock(groupName: string, commonGroupIdentification: string): Observable<PrivilegeGroup> {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(() => new Error(`${Status.ERROR} occurs while creating privilege group at backend`));
    }
    this.initMocks();
    let idBase = 'PGAA';
    let nextPrivilegeGroupIdMock = BaseBackendService.mockData.get(NEXT_PRIVILEGE_GOUP_ID_MOCK_KEY);

    let idExtend = `${nextPrivilegeGroupIdMock}`;
    while (idExtend.length < 5) {
      idExtend = '0'.concat(idExtend);
    }
    BaseBackendService.mockData.set(NEXT_PRIVILEGE_GOUP_ID_MOCK_KEY, nextPrivilegeGroupIdMock + 1);

    let addedPrivilegeGroup: PrivilegeGroup = PrivilegeGroup.map(
      {
        identification: idBase.concat(idExtend),
        groupName: groupName,
        description: undefined,
        validFrom: new Date(),
        validTo: undefined
      } as IPrivilegeGroup);

    this.getAllPrivilegeGroupsFromMock().push(addedPrivilegeGroup);
    PrivilegeGroupService.getPrivilegeGroupIdsFromMock(commonGroupIdentification).push(addedPrivilegeGroup.identification);

    return of(addedPrivilegeGroup);
  }



  /**
   * Deletes a privilege group in the backend
   * @param identification id of the privilege group to delete
   * @returns true if the privilege group was deleted. Otherwise false
   */
  public deletePrivilegeGroup(identification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.deletePrivilegeGroupMock(identification);
    }
    let url = `${this.deletePrivilegeGroupUrl}/${identification}`;

    return this.http.delete<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while deleting privilege group ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }



  /**
   * deletes a privilege group at mock
   * @param identification id of the privilege group to delete
   * @returns the mocked observable of succesfull deletion
   */
  private deletePrivilegeGroupMock(identification: string): Observable<boolean> {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(() => new Error(`${Status.ERROR} occurs while deleting privilege group ${identification} at backend`));
    }

    this.initMocks();

    let privilegeGroupIds = PrivilegeGroupService.getPrivilegeGroupIdsFromMock(commonGroup.identification);
    if (!privilegeGroupIds.includes(identification)) {
      return of(false);
    }
    privilegeGroupIds.splice(privilegeGroupIds.indexOf(identification), 1);

    let privilegeGroups = this.getAllPrivilegeGroupsFromMock();
    for (let i = 0; i < privilegeGroups.length; i++) {
      if (privilegeGroups[i].identification == identification) {
        privilegeGroups.splice(i, 1);
        return of(true);
      }
    }
    return of(false);
  }



  /**
   * Updates a privilege group in the backend
   * @param modifiedGroup the modefied privilege group to put in the backend
   * @returns the stored privilege group
   */
  public updatePrivilegeGroup(modifiedPrivilegeGroup: PrivilegeGroup): Observable<PrivilegeGroup> {
    this.init();
    if (this.useMock) {
      return this.updatePrivilegeGroupMock(modifiedPrivilegeGroup);
    }
    let url = `${this.updatePrivilegeGroupUrl}/${modifiedPrivilegeGroup.identification}`;

    return this.http.put<ResponseWrapper>(url, modifiedPrivilegeGroup as IPrivilegeGroup, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        let privilegeGroup = this.checkErrorAndGetResponse<IPrivilegeGroup>(data, `occurs while updating privilege group ${modifiedPrivilegeGroup.identification} at backend`);
        return PrivilegeGroup.map(privilegeGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }



  /**
   * Creates mock for updating a privilege group
   * @param modifiedPrivilegeGroup the modified privilege group
   * @returns the mocked observable of the privilege group
   */
  private updatePrivilegeGroupMock(modifiedPrivilegeGroup: PrivilegeGroup): Observable<PrivilegeGroup> {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    this.initMocks();

    if (commonGroup == undefined || !PrivilegeGroupService.getPrivilegeGroupIdsFromMock(commonGroup.identification).includes(modifiedPrivilegeGroup.identification)) {
      return throwError(() => new Error(`${Status.ERROR} occurs while updating privilege group ${modifiedPrivilegeGroup.identification} at backend`));
    }

    let privilegeGroups = this.getAllPrivilegeGroupsFromMock()
    for (let i = 0; i < privilegeGroups.length; i++) {
      if (privilegeGroups[i].identification == modifiedPrivilegeGroup.identification) {
        privilegeGroups[i] = PrivilegeGroup.map(modifiedPrivilegeGroup);
        return of(PrivilegeGroup.map(modifiedPrivilegeGroup));
      }
    }
    return throwError(() => new Error(`${Status.ERROR} occurs while updating privilege group ${modifiedPrivilegeGroup.identification} at backend`));
  }



  /**
   * Get all changes of a given privilege group
   * @param privilegeGroupIdentification the identification of the privilege group whose changes are asked for
   * @returns An array with changes
   */
  public getPrivilegeGroupHistory(privilegeGroupIdentification: string): Observable<HistoryChange[]> {
    this.init();
    return this.getObjectHistory(privilegeGroupIdentification, this.getPrivilegeGroupHistoryUrl, 'privilege group');
  }

}
