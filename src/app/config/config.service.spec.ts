import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ConfigService] });
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('undefined config, if not loaded', () => {
    expect(service.getConfig()).toBeUndefined();
  })

  it('load config', fakeAsync(() => {
    const mockResponse =
    {
      clientId: 'ape.user.ui',
      clientSecret: 'changeIt',
      backendBaseUrl: '//localhost:8080/'
    };

    service.load().then(() => {
      expect(service.getConfig()?.clientId).toBe(mockResponse.clientId);
      expect(service.getConfig()?.clientSecret).toBe(mockResponse.clientSecret);
      expect(service.getConfig()?.backendBaseUrl).toBe(mockResponse.backendBaseUrl);
    });

    const req = httpMock.expectOne('assets/config.json');
    expect(req.request.method).toEqual("GET");
    req.flush(mockResponse);

    tick();

  }));
});

