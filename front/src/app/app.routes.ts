import { RouterModule, Routes } from '@angular/router';
import { ArcherDetailsComponent } from './archer-details/archer-details.component';
import { ResultsUploadComponent } from './results-upload/results-upload.component';
import { ArchersListComponent } from './archers-list/archers-list.component';
import { DistinctionsListComponent } from './distinctions-list/distinctions-list.component';
import { DistinctionsToOrderComponent } from './distinctions-to-order/distinctions-to-order.component';
import { StocksComponent } from './stocks/stocks.component';
import { AdminGuardService } from './services/admin-guard.service';
import { SelfOrAdminGuardService } from './services/self-or-admin-guard.service';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

export const routes: Routes = [
    { path: 'archer/:id', component: ArcherDetailsComponent, canActivate: [SelfOrAdminGuardService]},
    { path: 'results-upload', component: ResultsUploadComponent, canActivate: [AdminGuardService]},
    { path: 'archers-list', component: ArchersListComponent, canActivate: [AdminGuardService]},
    { path: 'distinctions-list', component: DistinctionsListComponent, canActivate: [AdminGuardService]},
    { path: 'distinctions-to-order', component: DistinctionsToOrderComponent, canActivate: [AdminGuardService]},
    { path: 'stocks', component: StocksComponent, canActivate: [AdminGuardService]},
    { path: 'admin/users', component: AdminUsersComponent, canActivate: [AdminGuardService]},
    { path: '', component: HomeComponent }, // accueil public (référentiel des distinctions)
    { path: 'login', component: LoginComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }