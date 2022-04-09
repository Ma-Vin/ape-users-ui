import { Injectable } from '@angular/core';
import { AES, enc } from 'crypto-js';
import { ConfigService } from '../../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  // is only used to store the tokens in such a way that they cannot be used directly
  private phrase = btoa(window.navigator.userAgent);

  constructor(private configService: ConfigService) { }

  encrypt(plaintext: string): string | null {
    let config = this.configService.getConfig();
    if (config === undefined) {
      return null;
    }
    let result = AES.encrypt(plaintext, this.phrase);
    return result.toString();
  }

  decrypt(encryptedText: string): string | undefined {
    let config = this.configService.getConfig();
    if (config === undefined) {
      return undefined;
    }
    let result = AES.decrypt(encryptedText, this.phrase);
    return result.toString(enc.Utf8);
  }

  setEncryptedAtLocalStorage(key: string, value: string): void {
    console.debug(`setEncryptedAtLocalStorage ${key}`);
    let encrypted = this.encrypt(value);
    if (encrypted === null) {
      console.error(`could not encrypt value for ${key}`);
      return;
    }
    localStorage.setItem(key, encrypted);
  }

  getDecryptedFromLocalStorage(key: string): string | undefined {
    let keyValue = localStorage.getItem(key);
    if (keyValue === null || keyValue === undefined) {
      return undefined;
    }
    let result = this.decrypt(keyValue);
    console.debug(`getDecryptedFromLocalStorage ${key}`);
    return result;
  }
}
