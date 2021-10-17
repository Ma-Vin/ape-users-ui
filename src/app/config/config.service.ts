import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Config } from './config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private http: HttpClient) { }

  private configUrl = 'assets/config.json';
  private config: Config | undefined;

  getConfig(): Config | undefined {
    return this.config;
  }

  load() {
    return new Promise<Config>((resolve, reject) => {
      this.config = undefined;
      this.http.get<Config>(this.configUrl).toPromise().then((response: Config) => {
        this.config = response;
        resolve(this.config);
      }).catch((response: any) => {
        reject(`Could not load file '${this.configUrl}': ${JSON.stringify(response)}`);
      });
    });
  };

}
