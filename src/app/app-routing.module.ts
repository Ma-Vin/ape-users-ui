import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuardService } from './services/admin-guard.service';
import { AdminGroupComponent } from './components/admin-group/admin-group.component';
import { CommonGroupComponent } from './components/common-group/common-group.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuardService } from './services/auth-guard.service';


export const LOGIN_PATH = 'login';
export const ADMIN_GROUP_PATH = 'admins';
export const COMMON_GROUPS_PATH = 'commongroups';
export const LOGIN_ABS_PATH = `/${LOGIN_PATH}`;
export const ADMIN_GROUP_ABS_PATH = `/${ADMIN_GROUP_PATH}`;
export const COMMON_GROUPS_ABS_PATH = `/${COMMON_GROUPS_PATH}`;

const routes: Routes = [
  { path: '', redirectTo: LOGIN_ABS_PATH, pathMatch: 'full' },
  { path: LOGIN_PATH, component: LoginComponent },
  { path: ADMIN_GROUP_PATH, component: AdminGroupComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: `${ADMIN_GROUP_PATH}/:id`, component: AdminGroupComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: COMMON_GROUPS_PATH, component: CommonGroupComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: `${COMMON_GROUPS_PATH}/:id`, component: CommonGroupComponent, canActivate: [AuthGuardService, AdminGuardService] },
  { path: '**', redirectTo: LOGIN_ABS_PATH }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
