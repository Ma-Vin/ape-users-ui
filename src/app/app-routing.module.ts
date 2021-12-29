import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuardService } from './services/guards/admin-guard.service';
import { AdminGroupComponent } from './components/admin-group/admin-group.component';
import { AllCommonGroupsComponent } from './components/all-common-groups/all-common-groups.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardService } from './services/guards/auth-guard.service';
import { AllUsersComponent } from './components/all-users/all-users.component';


export const LOGIN_PATH = 'login';
export const ADMIN_GROUP_PATH = 'admins';
export const COMMON_GROUPS_PATH = 'commongroups';
export const USERS_PATH = 'users';
export const LOGIN_ABS_PATH = `/${LOGIN_PATH}`;
export const ADMIN_GROUP_ABS_PATH = `/${ADMIN_GROUP_PATH}`;
export const COMMON_GROUPS_ABS_PATH = `/${COMMON_GROUPS_PATH}`;
export const USERS_ABS_PATH = `/${USERS_PATH}`;

const routes: Routes = [
  { path: '', redirectTo: LOGIN_ABS_PATH, pathMatch: 'full' },
  { path: LOGIN_PATH, component: LoginComponent },
  { path: ADMIN_GROUP_PATH, component: AdminGroupComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: `${ADMIN_GROUP_PATH}/:id`, component: AdminGroupComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: COMMON_GROUPS_PATH, component: AllCommonGroupsComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: `${COMMON_GROUPS_PATH}/:id`, component: AllCommonGroupsComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: USERS_PATH, component: AllUsersComponent, canActivate: [AuthGuardService] },
  { path: `${USERS_PATH}/:id`, component: AllUsersComponent, canActivate: [AuthGuardService] },
  { path: '**', redirectTo: LOGIN_ABS_PATH }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
