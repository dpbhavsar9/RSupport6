import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErrorPageComponent } from './error-page/error-page.component';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';
import { AuthGuard } from './services/auth-guard.service';
import { WelcomeComponent } from './welcome/welcome.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardToolsComponent } from './dashboard/dashboard-tools/dashboard-tools.component';
import { UserComponent } from './master/user/user.component';
import { ProjectComponent } from './master/project/project.component';
import { TicketTypeComponent } from './master/ticket-type/ticket-type.component';
import { CompanyComponent } from './master/company/company.component';
import { CreateUserComponent } from './master/user/create-user/create-user.component';
import { CreateProjectComponent } from './master/project/create-project/create-project.component';
import { CreateCompanyComponent } from './master/company/create-company/create-company.component';
import { CreateTicketComponent } from './transaction/create-ticket/create-ticket.component';
import { CreateTeamComponent } from './master/team/create-team/create-team.component';
import { TeamComponent } from './master/team/team.component';
import { CreateTicketTypeComponent } from './master/ticket-type/create-ticket-type/create-ticket-type.component';
// import { KanbanComponent } from './dashboard/kanban/kanban.component';
// import { NewKanbanComponent } from './dashboard/new-kanban/new-kanban.component';
import { EditCompanyComponent } from './master/modal/edit-company/edit-company.component';
import { EditProjectComponent } from './master/modal/edit-project/edit-project.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { EditAuthGuard } from './services/edit-auth-guard.service';



const appRoutes: Routes = [
  {
    path: '', component: WelcomeComponent,
    children: [
      { path: '', component: LoginComponent },
      // { path: 'signup', component: SignupComponent }
    ]
  },
  {
    path: 'dashboard', component: DashboardComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
    children: [
      { path: '', component: DashboardToolsComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'company/create-company', component: CreateCompanyComponent, canActivate: [EditAuthGuard] },
      { path: 'project', component: ProjectComponent },
      { path: 'project/create-project', component: CreateProjectComponent, canActivate: [EditAuthGuard] },
      { path: 'team', component: TeamComponent },
      { path: 'team/create-team', component: CreateTeamComponent, canActivate: [EditAuthGuard] },
      { path: 'ticket-type', component: TicketTypeComponent },
      { path: 'ticket-type/create-ticket-type', component: CreateTicketTypeComponent, canActivate: [EditAuthGuard] },
      { path: 'user', component: UserComponent },
      { path: 'user/create-user', component: CreateUserComponent, canActivate: [EditAuthGuard] },
      { path: 'create-ticket', component: CreateTicketComponent }
    ]
  },
  {
    path: 'not-found',
    component: PageNotFoundComponent,
    data: { message: 'Page not found!' }
  },
  { path: '**', redirectTo: '/not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
