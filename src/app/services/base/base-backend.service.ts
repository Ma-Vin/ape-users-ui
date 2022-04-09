import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Message } from '../../model/message';
import { ResponseWrapper } from '../../model/response-wrapper';
import { Status } from '../../model/status.model';
import { environment } from 'src/environments/environment';
import { ConfigService } from '../../config/config.service';
import { User } from '../../model/user.model';
import { BaseService } from './base.service';
import { Role } from 'src/app/model/role.model';

export const ALL_USERS_MOCK_KEY = 'users';
export const NEXT_USER_ID_MOCK_KEY = 'nextUserId';
export const RETRIES = 3;

export const HTTP_URL_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  })
};

export const HTTP_JSON_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json;charset=UTF-8'
  })
};

export abstract class BaseBackendService extends BaseService {
  protected static mockData: Map<string, any> = new Map();

  public useMock;

  constructor(protected serviceName: string, protected configService: ConfigService) {
    super(serviceName, configService);
    this.useMock = environment.useMock;
    this.initMocks();
  }

  /**
   * initialize the urls to the backend
   * @returns true if initialization was successfull. Otherwise false
   */
  protected abstract initServiceUrls(): boolean;

  protected initService(): boolean {
    return this.initServiceUrls();
  }

  /**
   * clears all data at mock map
   */
  public static clearMockData(): void {
    BaseBackendService.mockData.clear();
  }

  /**
   * creates a new empty Map<string, string[]> if mockData does not have a property asked for 
   * @param mockProperty the property which should be check ad mock
   */
  public static createStringToStringArrayMapIfNotExists(mockProperty: string): void {
    if (!BaseBackendService.mockData.has(mockProperty)) {
      BaseBackendService.mockData.set(mockProperty, new Map<string, string[]>());
    }
  }

  /**
   * Adds a value to an array, if it is not contained, at key of a mock property
   * @param mockProperty mock property which is the Map<string, string[]>
   * @param key the key of the map
   * @param valueToAdd the value to add at the array at the key
   */
  public static addEntryToStringToStringArrayMap(mockProperty: string, key: string, valueToAdd: string): void {
    BaseBackendService.createStringToStringArrayMapIfNotExists(mockProperty);
    let map: Map<string, string[]> = BaseBackendService.mockData.get(mockProperty);
    if (map.has(key)) {
      if (!map.get(key)?.includes(valueToAdd)) {
        map.get(key)?.push(valueToAdd);
      }
    } else {
      map.set(key, [valueToAdd]);
    }
  }

  /**
   * Determines the string array which contains the ids contained by a given owner at a property at mock
   * @param ownerIdentification the id of owner 
   * @param mockProperty property at the mock where to search at
   * @returns the array of ids
   */
  public static getIdsFromMock(ownerIdentification: string, mockProperty: string) {
    let result = (BaseBackendService.mockData.get(mockProperty) as Map<string, string[]>).get(ownerIdentification);
    if (result == undefined) {
      result = [];
      (BaseBackendService.mockData.get(mockProperty) as Map<string, string[]>).set(ownerIdentification, result);
    }
    return result;
  }

  /**
   * Initialize the data at mock
   */
  protected initMocks(): void {
    if (!this.useMock || BaseBackendService.mockData.has(`${this.serviceName}.initMocks`)) {
      return
    }
    if (!BaseBackendService.mockData.has(ALL_USERS_MOCK_KEY)) {
      BaseBackendService.mockData.set(ALL_USERS_MOCK_KEY, [] as User[]);
    }
    if (!BaseBackendService.mockData.has(NEXT_USER_ID_MOCK_KEY)) {
      BaseBackendService.mockData.set(NEXT_USER_ID_MOCK_KEY, 3);
    }
    this.initServiceMocks();
    BaseBackendService.mockData.set(`${this.serviceName}.initMocks`, true);
  }

  /**
   * Initialize the service specific data at mock
   */
  protected abstract initServiceMocks(): void;
  

  protected getFirstMessageText(messages: Message[], status: Status, defaultMessageText: string): string {
    let result: Message | undefined;
    for (let m of messages) {
      if (m.status == status && (result == undefined || m.order < result.order)) {
        result = m;
      }
    }
    return result == undefined ? defaultMessageText : result.messageText;
  }


  /**
   * Checks if there exists an error or fatal at response and throws an Error with the first message
   * @param data response wrapper to check
   * @param defaultMessage message to use if the is not any at data. The status is put at front of this message.
   * @returns the cast response object
   */
  protected checkErrorAndGetResponse<T>(data: ResponseWrapper, defaultMessage: string): T {
    if (data.status == Status.ERROR || data.status == Status.FATAL) {
      throw new Error(this.getFirstMessageText(data.messages, data.status, `${data.status} ${defaultMessage}`));
    }
    return data.response as T;
  }


  /**
   * creates the pageing params
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0. 
   * @returns the params
   */
  protected createPageingParams(page: number | undefined, size: number | undefined): HttpParams | {
    [param: string]: string | number | boolean | readonly (string | number | boolean)[];
  } | undefined {
    return page == undefined || size == undefined
      ? undefined
      : {
        page: `${page}`,
        size: `${size}`
      };
  }

  /**
   * creates the pageing params with role
   * @param role role to add at params
   * @param page zero-based page index, must not be negative.
   * @param size the size of the page to be returned, must be greater than 0. 
   * @returns the params
   */
   protected createPageingRoleParams(role: Role | undefined, page: number | undefined, size: number | undefined): HttpParams | {
    [param: string]: string | number | boolean | readonly (string | number | boolean)[];
  } | undefined {
    if (role == undefined) {
      return this.createPageingParams(page, size);
    }
    if (page == undefined || size == undefined) {
      return { role: `${role}` };
    }
    return {
      page: `${page}`,
      size: `${size}`,
      role: `${role}`
    };
  }
}
