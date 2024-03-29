import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { HistoryChange } from 'src/app/model/history-change.model';
import { ConfigService } from '../../config/config.service';
import { CommonGroup, ICommonGroup } from '../../model/common-group.model';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Role } from '../../model/role.model';
import { Status } from '../../model/status.model';
import { BaseBackendService, HTTP_JSON_OPTIONS, HTTP_URL_OPTIONS, RETRIES } from '../base/base-backend.service';
import { INITIAL_USER_ID_AT_MOCK } from './user.service';

const ALL_COMMON_GOUP_MOCK_KEY = 'commonGroups'
const NEXT_COMMON_GOUP_ID_MOCK_KEY = 'nextCommonGroupId'
const USERS_AT_COMMON_GROUP = 'usersAtCommonGroup'
export const INITIAL_COMMON_GROUP_ID_AT_MOCK = 'CGAA00001';

@Injectable({
  providedIn: 'root'
})
export class CommonGroupService extends BaseBackendService {
  private createCommonGroupUrl: string | undefined;
  private deleteCommonGroupUrl: string | undefined;
  private getCommonGroupUrl: string | undefined;
  private getParentCommonGroupOfUserUrl: string | undefined;
  private getAllCommonGroupUrl: string | undefined;
  private getAllCommonGroupPartsUrl: string | undefined;
  private getCommonGroupHistoryUrl: string | undefined;
  private updateCommonGroupUrl: string | undefined;


  constructor(protected http: HttpClient, configService: ConfigService) {
    super(http, 'CommonGroupService', configService);
  }


  protected initServiceUrls(): boolean {
    if (this.config == undefined) {
      return false;
    }
    let commonGroupControllerUrl = this.config.backendBaseUrl.concat('/group/common');

    this.createCommonGroupUrl = commonGroupControllerUrl.concat('/createCommonGroup');
    this.deleteCommonGroupUrl = commonGroupControllerUrl.concat('/deleteCommonGroup');
    this.getCommonGroupUrl = commonGroupControllerUrl.concat('/getCommonGroup');
    this.getParentCommonGroupOfUserUrl = commonGroupControllerUrl.concat('/getParentCommonGroupOfUser');
    this.getAllCommonGroupUrl = commonGroupControllerUrl.concat('/getAllCommonGroups');
    this.getAllCommonGroupPartsUrl = commonGroupControllerUrl.concat('/getAllCommonGroupParts');
    this.getCommonGroupHistoryUrl = commonGroupControllerUrl.concat('/getCommonGroupHistory');
    this.updateCommonGroupUrl = commonGroupControllerUrl.concat('/updateCommonGroup');

    return true;
  }


  protected initServiceMocks(): void {
    if (!BaseBackendService.mockData.has(ALL_COMMON_GOUP_MOCK_KEY)) {
      BaseBackendService.mockData.set(ALL_COMMON_GOUP_MOCK_KEY, [] as CommonGroup[]);
    }
    (BaseBackendService.mockData.get(ALL_COMMON_GOUP_MOCK_KEY) as CommonGroup[]).push(
      CommonGroup.map({
        groupName: 'Mocked',
        identification: INITIAL_COMMON_GROUP_ID_AT_MOCK,
        description: 'A common group from the mock',
        defaultRole: Role.VISITOR
      } as CommonGroup)
    );
    if (!BaseBackendService.mockData.has(NEXT_COMMON_GOUP_ID_MOCK_KEY)) {
      BaseBackendService.mockData.set(NEXT_COMMON_GOUP_ID_MOCK_KEY, 2);
    }
    BaseBackendService.addEntryToStringToStringArrayMap(USERS_AT_COMMON_GROUP, INITIAL_COMMON_GROUP_ID_AT_MOCK, INITIAL_USER_ID_AT_MOCK);
  }


  /**
   * Determines all users at mock data
   * @returns array of all users
   */
  private getAllCommonGroupsFromMock(): CommonGroup[] {
    this.initMocks();
    return (BaseBackendService.mockData.get(ALL_COMMON_GOUP_MOCK_KEY) as CommonGroup[]);
  }


  /**
   * Get a common group from the back end
   * @param identification id of the common group
   * @returns the common group
   */
  public getCommonGroup(identification: string): Observable<CommonGroup> {
    this.init();
    if (this.useMock) {
      return this.getCommonGroupGroupMock(identification);
    }
    let url = `${this.getCommonGroupUrl}/${identification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let commonGroup = this.checkErrorAndGetResponse<ICommonGroup>(data, `occurs while getting common group ${identification} from backend`);
        return CommonGroup.map(commonGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }


  /**
   * Creates mock for getting a common group
   * @param identification id of the common group
   * @returns the mocked observable of the common group
   */
  private getCommonGroupGroupMock(identification: string): Observable<CommonGroup> {
    for (let cg of this.getAllCommonGroupsFromMock())
      if (cg.identification == identification) {
        return of(cg);
      }
    return throwError(() => new Error(`${Status.ERROR} occurs while getting common group ${identification} from backend`));
  }


  /**
   * Get all common groups from the backend
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the common groups
   */
  public getAllCommonGroups(page: number | undefined, size: number | undefined): Observable<CommonGroup[]> {
    this.init();
    return this.getAllCommonGroupGroupsWithUrl(page, size, `${this.getAllCommonGroupUrl}`, true);
  }


  /**
   * Get all common group parts from the backend
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0.
   * @returns the common group pars
   */
  public getAllCommonGroupParts(page: number | undefined, size: number | undefined): Observable<CommonGroup[]> {
    this.init();
    return this.getAllCommonGroupGroupsWithUrl(page, size, `${this.getAllCommonGroupPartsUrl}`, false);
  }

  /**
 * Get all common group or group parts with reduced data from the backend
 * @param page zero-based page index, must not be negative.
 * @param size the size of the page to be returned, must be greater than 0.
 * @param url the url where to get the data from backend
 * @param isComplete indicator if the url points to the endpoint which return the complete entity or the one with reduced data
 * @returns the common groups
 */
  private getAllCommonGroupGroupsWithUrl(page: number | undefined, size: number | undefined, url: string, isComplete: boolean): Observable<CommonGroup[]> {
    if (this.useMock) {
      return this.getAllCommonGroupsMock(isComplete);
    }

    return this.http.get<ResponseWrapper>(url, {
      headers: HTTP_URL_OPTIONS.headers,
      params: this.createPageingParams(page, size)
    }).pipe(
      map(data => {
        let commonGroups = this.checkErrorAndGetResponse<ICommonGroup[]>(data, `ooccurs while getting all common groups from backend`);
        let result: CommonGroup[] = new Array(commonGroups.length);
        for (let i = 0; i < commonGroups.length; i++) {
          result[i] = CommonGroup.map(commonGroups[i]);
          result[i].isComplete = isComplete;
        }
        return result;
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }


  /**
   * Creates mock for getting all common groups
   * @param isComplete indicator if the url points to the endpoint which return the complete entity or the one with reduced data
   * @returns the mocked observable of all common groups
   */
  private getAllCommonGroupsMock(isComplete: boolean): Observable<CommonGroup[]> {
    let copy: CommonGroup[] = [];
    for (let cg of this.getAllCommonGroupsFromMock()) {
      let entry = CommonGroup.map(cg);
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
   * Gets the common groupe that  a given user is a member of
   * @param userIdentification identification of user who should be a member
   * @returns The observable of the found common group.
   */
  public getParentCommonGroupOfUser(userIdentification: string): Observable<CommonGroup> {
    this.init();
    if (this.useMock) {
      return this.getParentCommonGroupOfUserMock(userIdentification);
    }
    let url = `${this.getParentCommonGroupOfUserUrl}/${userIdentification}`;

    return this.http.get<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let commonGroup = this.checkErrorAndGetResponse<ICommonGroup>(data, `occurs while getting parent common group of user ${userIdentification} from backend`);
        return CommonGroup.map(commonGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }


  /**
   * Creates mock for getting parent common group of an user
   * @param userIdentification user whose parent is searched for
   * @returns  the mocked observable of the parent common group
   */
  private getParentCommonGroupOfUserMock(userIdentification: string): Observable<CommonGroup> {
    this.initMocks();
    for (let entry of (BaseBackendService.mockData.get(USERS_AT_COMMON_GROUP) as Map<string, string[]>).entries()) {
      if (entry[1].includes(userIdentification)) {
        for (let c of this.getAllCommonGroupsFromMock()) {
          if (c.identification == entry[0]) {
            return of(CommonGroup.map(c));
          }
        }
        break;
      }
    }
    return throwError(() => new Error(`${Status.ERROR} occurs while getting parent common group of user ${userIdentification} from backend`));
  }


  /**
   * Creates a common group
   * @param groupName the name of the group
   * @returns the new created common group
   */
  public createCommonGroup(groupName: string): Observable<CommonGroup> {
    this.init();
    if (this.useMock) {
      return this.createCommonGroupMock(groupName);
    }

    let url = `${this.createCommonGroupUrl}`;
    let body = `groupName=${groupName}`;

    return this.http.post<ResponseWrapper>(url, body, HTTP_URL_OPTIONS).pipe(
      map(data => {
        let commonGroup = this.checkErrorAndGetResponse<ICommonGroup>(data, `occurs while creating common group at backend`);
        return CommonGroup.map(commonGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }


  /**
   * creates a new common group at mock
   * @param groupName name of the group
   * @returns the mocked observable of the new common group
   */
  private createCommonGroupMock(groupName: string): Observable<CommonGroup> {
    let idBase = 'CGAA';

    this.initMocks();
    let nextCommonGroupIdMock = BaseBackendService.mockData.get(NEXT_COMMON_GOUP_ID_MOCK_KEY);

    let idExtend = `${nextCommonGroupIdMock}`;
    while (idExtend.length < 5) {
      idExtend = '0'.concat(idExtend);
    }
    BaseBackendService.mockData.set(NEXT_COMMON_GOUP_ID_MOCK_KEY, nextCommonGroupIdMock + 1);

    let addedCommonGroup: CommonGroup = CommonGroup.map(
      {
        identification: idBase.concat(idExtend),
        groupName: groupName,
        description: undefined,
        validFrom: new Date(),
        validTo: undefined,
        defaultRole: Role.VISITOR
      } as ICommonGroup);

    this.getAllCommonGroupsFromMock().push(addedCommonGroup);

    return of(addedCommonGroup);
  }


  /**
   * Deletes a common group in the backend
   * @param identification id of the common group to delete
   * @returns true if the common group was deleted. Otherwise false
   */
  public deleteCommonGroup(identification: string): Observable<boolean> {
    this.init();
    if (this.useMock) {
      return this.deleteCommonGroupMock(identification);
    }
    let url = `${this.deleteCommonGroupUrl}/${identification}`;

    return this.http.delete<ResponseWrapper>(url, HTTP_URL_OPTIONS).pipe(
      map(data => {
        return this.checkErrorAndGetResponse<boolean>(data, `occurs while deleting common group ${identification} at backend`);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }


  /**
   * deletes a common group at mock
   * @param identification id of the common group to delete
   * @returns the mocked observable of succesfull deletion
   */
  private deleteCommonGroupMock(identification: string): Observable<boolean> {
    let commonGroups = this.getAllCommonGroupsFromMock();
    for (let i = 0; i < commonGroups.length; i++) {
      if (commonGroups[i].identification == identification) {
        commonGroups.splice(i, 1);
        return of(true);
      }
    }
    return of(false);
  }


  /**
 * Updates a common group in the backend
 * @param modifiedGroup the modefied common group to put in the backend
 * @returns the stored common group
 */
  public updateCommonGroup(modifiedCommonGroup: CommonGroup): Observable<CommonGroup> {
    this.init();
    if (this.useMock) {
      return this.updateCommonGroupMock(modifiedCommonGroup);
    }
    let url = `${this.updateCommonGroupUrl}/${modifiedCommonGroup.identification}`;

    return this.http.put<ResponseWrapper>(url, modifiedCommonGroup as ICommonGroup, HTTP_JSON_OPTIONS).pipe(
      map(data => {
        let commonGroup = this.checkErrorAndGetResponse<ICommonGroup>(data, `occurs while updating common group ${modifiedCommonGroup.identification} at backend`);
        return CommonGroup.map(commonGroup);
      }),
      retry(RETRIES),
      catchError(this.handleError.bind(this))
    );
  }


  /**
   * Creates mock for updating a common group
   * @param modifiedCommonGroup the modified common group
   * @returns the mocked observable of the common group
   */
  private updateCommonGroupMock(modifiedCommonGroup: CommonGroup): Observable<CommonGroup> {
    let users = this.getAllCommonGroupsFromMock();
    for (let i = 0; i < users.length; i++) {
      if (users[i].identification == modifiedCommonGroup.identification) {
        users[i] = CommonGroup.map(modifiedCommonGroup);
        return of(CommonGroup.map(modifiedCommonGroup));
      }
    }
    return throwError(() => new Error(`${Status.ERROR} occurs while updating common group ${modifiedCommonGroup.identification} at backend`));
  }


  /**
   * Get all changes of a given common group
   * @param commonGroupIdentification the identification of the common group whose changes are asked for
   * @returns An array with changes
   */
  public getCommonGroupHistory(commonGroupIdentification: string): Observable<HistoryChange[]> {
    this.init();
    return this.getObjectHistory(commonGroupIdentification, this.getCommonGroupHistoryUrl, 'common group');
  }
}
