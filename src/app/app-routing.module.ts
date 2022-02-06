import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuardService } from './services/guards/admin-guard.service';
import { AdminGroupComponent } from './components/admin-group/admin-group.component';
import { AllCommonGroupsComponent } from './components/all-common-groups/all-common-groups.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardService } from './services/guards/auth-guard.service';
import { AllUsersComponent } from './components/all-users/all-users.component';
import { CommonGroupsGuardService } from './services/guards/common-groups-guard.service';
import { UsersGuardService } from './services/guards/users-guard.service';
import { AllBaseGroupsComponent } from './components/all-base-groups/all-base-groups.component';
import { BaseGroupGuardService } from './services/guards/base-group-guard.service';
import { AllPrivilegeGroupsComponent } from './components/all-privilege-groups/all-privilege-groups.component';
import { PrivilegeGroupGuardService } from './services/guards/privilege-group-guard.service';


export const LOGIN_PATH = 'login';
export const ADMIN_GROUP_PATH = 'admins';
export const COMMON_GROUPS_PATH = 'commongroups';
export const BASE_GROUPS_PATH = 'basegroups';
export const PRIVILEGE_GROUPS_PATH = 'privilegegroups';
export const USERS_PATH = 'users';
export const LOGIN_ABS_PATH = `/${LOGIN_PATH}`;
export const ADMIN_GROUP_ABS_PATH = `/${ADMIN_GROUP_PATH}`;
export const COMMON_GROUPS_ABS_PATH = `/${COMMON_GROUPS_PATH}`;
export const BASE_GROUPS_ABS_PATH = `/${BASE_GROUPS_PATH}`;
export const PRIVILEGE_GROUPS_ABS_PATH = `/${PRIVILEGE_GROUPS_PATH}`;
export const USERS_ABS_PATH = `/${USERS_PATH}`;

const routes: Routes = [
  { path: '', redirectTo: LOGIN_ABS_PATH, pathMatch: 'full' },
  { path: LOGIN_PATH, component: LoginComponent },
  { path: ADMIN_GROUP_PATH, component: AdminGroupComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: `${ADMIN_GROUP_PATH}/:id`, component: AdminGroupComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: COMMON_GROUPS_PATH, component: AllCommonGroupsComponent, canActivate: [AuthGuardService, CommonGroupsGuardService] },
  { path: `${COMMON_GROUPS_PATH}/:id`, component: AllCommonGroupsComponent, canActivate: [AuthGuardService, CommonGroupsGuardService] },
  { path: BASE_GROUPS_PATH, component: AllBaseGroupsComponent, canActivate: [AuthGuardService, BaseGroupGuardService] },
  { path: `${BASE_GROUPS_PATH}/:id`, component: AllBaseGroupsComponent, canActivate: [AuthGuardService, BaseGroupGuardService] },
  { path: PRIVILEGE_GROUPS_PATH, component: AllPrivilegeGroupsComponent, canActivate: [AuthGuardService, PrivilegeGroupGuardService] },
  { path: `${PRIVILEGE_GROUPS_PATH}/:id`, component: AllPrivilegeGroupsComponent, canActivate: [AuthGuardService, PrivilegeGroupGuardService] },
  { path: USERS_PATH, component: AllUsersComponent, canActivate: [AuthGuardService, UsersGuardService] },
  { path: `${USERS_PATH}/:id`, component: AllUsersComponent, canActivate: [AuthGuardService, UsersGuardService] },
  { path: '**', redirectTo: LOGIN_ABS_PATH }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
