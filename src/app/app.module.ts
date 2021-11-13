import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { ConfigService } from './config/config.service';
import { AuthService } from './services/auth.service';
import { BearerTokenInterceptor } from './intercept/bearer-token-interceptor';
import { AdminGroupComponent } from './components/admin-group/admin-group.component';
import { registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/de';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AllCommonGroupsComponent } from './components/all-common-groups/all-common-groups.component';

registerLocaleData(localeDE);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminGroupComponent,
    AllCommonGroupsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: initializeApp,
    deps: [ConfigService], multi: true
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: BearerTokenInterceptor,
    deps: [AuthService],
    multi: true
  }, {
    provide: MAT_DATE_LOCALE, useValue: 'de'
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }


export function initializeApp(appConfig: ConfigService) {
  return (): Promise<any> => { return appConfig.load() };
}