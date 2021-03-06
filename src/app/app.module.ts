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
import { AuthService } from './services/backend/auth.service';
import { BearerTokenInterceptor } from './intercept/bearer-token-interceptor';
import { AdminGroupComponent } from './components/admin-group/admin-group.component';
import { registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/de';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AllCommonGroupsComponent } from './components/all-common-groups/all-common-groups.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { DetailButtonRowComponent } from './components/list-detail/detail-button-row/detail-button-row.component';
import { FirstLastNameListComponent } from './components/list-detail/first-last-name-list/first-last-name-list.component';
import { GroupNameListComponent } from './components/list-detail/group-name-list/group-name-list.component';
import { AllBaseGroupsComponent } from './components/all-base-groups/all-base-groups.component';
import { SubBaseGroupsComponent } from './components/sub-base-groups/sub-base-groups.component';
import { AddBaseGroupDialogComponent } from './components/add-base-group-dialog/add-base-group-dialog.component';
import { UsersAtGroupComponent } from './components/users-at-group/users-at-group.component';
import { AddUserDialogComponent } from './components/add-user-dialog/add-user-dialog.component';
import { AllPrivilegeGroupsComponent } from './components/all-privilege-groups/all-privilege-groups.component';
import { UserHistoryComponent } from './components/history/user-history/user-history.component';
import { BaseGroupHistoryComponent } from './components/history/base-group-history/base-group-history.component';
import { CommonGroupHistoryComponent } from './components/history/common-group-history/common-group-history.component';
import { PrivilegeGroupHistoryComponent } from './components/history/privilege-group-history/privilege-group-history.component';
import { AdminGroupHistoryComponent } from './components/history/admin-group-history/admin-group-history.component';

registerLocaleData(localeDE);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminGroupComponent,
    AllCommonGroupsComponent,
    ToolbarComponent,
    AllUsersComponent,
    DetailButtonRowComponent,
    FirstLastNameListComponent,
    GroupNameListComponent,
    AllBaseGroupsComponent,
    SubBaseGroupsComponent,
    AddBaseGroupDialogComponent,
    UsersAtGroupComponent,
    AddUserDialogComponent,
    AllPrivilegeGroupsComponent,
    UserHistoryComponent,
    BaseGroupHistoryComponent,
    CommonGroupHistoryComponent,
    PrivilegeGroupHistoryComponent,
    AdminGroupHistoryComponent
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