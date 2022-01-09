import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { PrivilegeGroup, IPrivilegeGroup } from '../../model/privilege-group.model';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Status } from '../../model/status.model';
import { ConfigService } from '../../config/config.service';
import { BaseBackendService } from '../base/base-backend.service';
import { HTTP_JSON_OPTIONS, HTTP_URL_OPTIONS, RETRIES } from '../base/base.service';
import { INITIAL_COMMON_GROUP_ID_AT_MOCK } from './common-group.service';
import { SelectionService } from '../util/selection.service';


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
  private updatePrivilegeGroupUrl: string | undefined;
  private createPrivilegeGroupUrl: string | undefined;
  private deletePrivilegeGroupUrl: string | undefined;
  private countPrivilegeGroupsUrl: string | undefined;



  constructor(private http: HttpClient, configService: ConfigService, private selectionService: SelectionService) {
    super('PrivilegeGroupService', configService);
  }



  protected initServiceUrls(): boolean {
    if (this.config == undefined) {
      return false;
    }

    let privilegeGroupControllerUrl = this.config.backendBaseUrl.concat('/group/privilege');

    this.getPrivilegeGroupUrl = privilegeGroupControllerUrl.concat('/getPrivilegeGroup');
    this.getAllPrivilegeGroupsUrl = privilegeGroupControllerUrl.concat('/getAllPrivilegeGroups');
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

    return this.getPrivilegeGroupIdsFromMock(commonGroup.identification);
  }

  /**
   * Determines the string array which contains the ids of privilege groups contained by a given common group
   * @param commonGroupIdentification the id of the common group whose privilege groups are searched for 
   * @returns the array of the privilege group ids
   */
  private getPrivilegeGroupIdsFromMock(commonGroupIdentification: string): string[] {
    return this.getIdsFromMock(commonGroupIdentification, PRIVILEGES_AT_COMMON_GROUP);
  }

  /**
   * Determines the string array which contains the ids contained by a given owner at a property at mock
   * @param ownerIdentification the id of owner 
   * @param mockProperty property at the mock where to search at
   * @returns the array of ids
   */
  private getIdsFromMock(ownerIdentification: string, mockProperty: string) {
    let result = (BaseBackendService.mockData.get(mockProperty) as Map<string, string[]>).get(ownerIdentification);
    if (result == undefined) {
      result = [];
      (BaseBackendService.mockData.get(mockProperty) as Map<string, string[]>).set(ownerIdentification, result);
    }
    return result;
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
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while getting privilege group ${identification} from backend`));
        }
        return PrivilegeGroup.map(data.response as IPrivilegeGroup)
      }),
      retry(RETRIES),
      catchError(this.handleError)
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
    return throwError(new Error(`${Status.ERROR} occurs while getting privilege group ${identification} from backend`));
  }



  /**
   * Get all privilege groups from the backend
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the privilege groups
   */
  public getAllPrivilegeGroups(page: number | undefined, size: number | undefined): Observable<PrivilegeGroup[]> {
    this.init();
    if (this.useMock) {
      return this.getAllPrivilegeGroupsMock();
    }
    let url = `${this.getAllPrivilegeGroupsUrl}`;

    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: page == undefined || size == undefined ? undefined : {
        page: `${page}`,
        size: `${size}`
      }
    }).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while getting all privilege groups from backend`));
        }
        let privilegeGroups = data.response as IPrivilegeGroup[];
        let result: PrivilegeGroup[] = new Array(privilegeGroups.length);
        for (let i = 0; i < privilegeGroups.length; i++) {
          result[i] = PrivilegeGroup.map(privilegeGroups[i]);
        }
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for getting all privilege groups
   * @returns the mocked observable of all privilege groups
   */
  private getAllPrivilegeGroupsMock(): Observable<PrivilegeGroup[]> {
    let copy: PrivilegeGroup[] = [];
    for (let bg of this.getAllPrivilegesAtSelectedCommonGroupFromMock()) {
      copy.push(bg)
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
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while counting privilege groups at ${commonGroupIdentification} at backend`));
        }
        return data.response as number;
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * Creates mock for counting  privilege groups
   * @param commonGroupIdentification the id of the common group where to count at
   * @returns the mocked observable of the counted number
   */
  private countPrivilegeGroupsMock(commonGroupIdentification: string): Observable<number> {
    this.initMocks();
    return of(this.getPrivilegeGroupIdsFromMock(commonGroupIdentification).length);
  }



  /**
   * Creates a privilege group
   * @param groupName the name of the group
   * @returns the new created privilege group
   */
  public createPrivilegeGroup(groupName: string): Observable<PrivilegeGroup> {
    this.init();
    if (this.useMock) {
      return this.createPrivilegeGroupMock(groupName);
    }

    let url = `${this.createPrivilegeGroupUrl}`;
    let body = `groupName=${groupName}`;

    return this.http.post<ResponseWrapper>(url, body, HTTP_URL_OPTIONS).pipe(
      map(data => {
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while creating privilege group at backend`));
        }
        return PrivilegeGroup.map(data.response as IPrivilegeGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError)
    );
  }



  /**
   * creates a new privilege group at mock
   * @param groupName name of the group
   * @returns the mocked observable of the new privilege group
   */
  private createPrivilegeGroupMock(groupName: string): Observable<PrivilegeGroup> {
    let commonGroup = this.selectionService.getSelectedCommonGroup();
    if (commonGroup == undefined) {
      return throwError(new Error(`${Status.ERROR} occurs while creating privilege group at backend`));
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
    this.getPrivilegeGroupIdsFromMock(commonGroup.identification).push(addedPrivilegeGroup.identification);

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
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while deleting privilege group ${identification} at backend`));
        }
        return data.response as boolean;
      }),
      retry(RETRIES),
      catchError(this.handleError)
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
      return throwError(new Error(`${Status.ERROR} occurs while deleting privilege group ${identification} at backend`));
    }

    this.initMocks();

    let privilegeGroupIds = this.getPrivilegeGroupIdsFromMock(commonGroup.identification);
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
        if (data.status == Status.ERROR || data.status == Status.FATAL) {
          throw new Error(super.getFirstMessageText(data.messages, data.status, `${data.status} occurs while updating privilege group ${modifiedPrivilegeGroup.identification} at backend`));
        }
        return PrivilegeGroup.map(data.response as IPrivilegeGroup)
      }),
      retry(RETRIES),
      catchError(this.handleError)
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

    if (commonGroup == undefined || !this.getPrivilegeGroupIdsFromMock(commonGroup.identification).includes(modifiedPrivilegeGroup.identification)) {
      return throwError(new Error(`${Status.ERROR} occurs while updating privilege group ${modifiedPrivilegeGroup.identification} at backend`));
    }

    let privilegeGroups = this.getAllPrivilegeGroupsFromMock()
    for (let i = 0; i < privilegeGroups.length; i++) {
      if (privilegeGroups[i].identification == modifiedPrivilegeGroup.identification) {
        privilegeGroups[i] = PrivilegeGroup.map(modifiedPrivilegeGroup);
        return of(PrivilegeGroup.map(modifiedPrivilegeGroup));
      }
    }
    return throwError(new Error(`${Status.ERROR} occurs while updating privilege group ${modifiedPrivilegeGroup.identification} at backend`));
  }

}
