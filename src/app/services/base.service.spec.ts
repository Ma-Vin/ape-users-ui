import { TestBed } from '@angular/core/testing';
import { ConfigService } from '../config/config.service';
import { BaseService } from './base.service';

describe('BaseService', () => {
  let service: TestBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    const mockConfig =
    {
      clientId: 'ape.user.ui',
      clientSecret: 'changeIt',
      backendBaseUrl: '//localhost:8080/'
    };
    const fake = { getConfig: () => mockConfig };

    service = new TestBaseService('TestBaseService', fake as ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('init should set client info', () => {
    service.init()
    expect(service.clientId).toEqual('ape.user.ui');
    expect(service.clientSecret).toEqual('changeIt');
  });

});


class TestBaseService extends BaseService {
  public init(){
    super.init();
  }
 }