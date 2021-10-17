import { Injectable } from '@angular/core';
import { ConfigService } from '../config/config.service';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor(private configService: ConfigService) { }

  encrypt(plaintext: string): string | null {
    let config = this.configService.getConfig();
    if (config === undefined) {
      return null;
    }
    let result = CryptoJS.AES.encrypt(plaintext, config.clientSecret);
    return result.toString();
  }

  decrypt(encryptedText: string): string | null {
    let config = this.configService.getConfig();
    if (config === undefined) {
      return null;
    }
    let result = CryptoJS.AES.decrypt(encryptedText, config.clientSecret);
    return result.toString(CryptoJS.enc.Utf8);
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

  getDecryptedFromLocalStorage(key: string): string | null {
    let keyValue = localStorage.getItem(key);
    if (keyValue === null || keyValue === undefined) {
      return null;
    }
    let result = this.decrypt(keyValue);
    console.debug(`getDecryptedFromLocalStorage ${key}`);
    return result;
  }
}
