import { TestBed } from '@angular/core/testing';
import { ConfigService } from '../../config/config.service';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    const mockConfig =
    {
      clientId: 'ape.user.ui',
      clientSecret: 'changeIt',
      backendBaseUrl: '//localhost:8080/',
      adminGroupId: 'AGAA00001'
    };
    const fake = { getConfig: () => mockConfig };

    service = new CryptoService(fake as ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('encrypt decrypt', () => {
    let toEncrypt = "someSecretText";
    let encrypted = service.encrypt(toEncrypt);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toEqual(toEncrypt);
    let decrypted = service.decrypt(encrypted == undefined ? '' : encrypted);
    expect(decrypted).toBeDefined();
    expect(decrypted).toEqual(toEncrypt);
  });

  it('encrypt decrypt at local storage', () => {
    let someKey = 'anyKey';
    let toEncrypt = "someSecretText";
    service.setEncryptedAtLocalStorage(someKey, toEncrypt);
    let decrypted = service.getDecryptedFromLocalStorage(someKey);
    expect(decrypted).toBeDefined();
    expect(decrypted).toEqual(toEncrypt);
    let decryptedOtherKey = service.getDecryptedFromLocalStorage('otherKey');
    expect(decryptedOtherKey).not.toBeDefined();
  });
});
