import { environment } from 'src/environments/environment';
import { ConfigService } from '../config/config.service';
import { User } from '../model/user.model';
import { BaseService } from './base.service';

export const ALL_USERS_MOCK_KEY = 'users';
export const NEXT_USER_ID_MOCK_KEY = 'nextUserId';

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
}
