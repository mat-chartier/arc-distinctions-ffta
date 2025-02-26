import { RouterModule, Routes } from '@angular/router';
import { ArcherDetailsComponent } from './archer-details/archer-details.component';
import { ResultsUploadComponent } from './results-upload/results-upload.component';
import { ArchersListComponent } from './archers-list/archers-list.component';
import { DistinctionsListComponent } from './distinctions-list/distinctions-list.component';
import { DistinctionsToOrderComponent } from './distinctions-to-order/distinctions-to-order.component';
import { AuthGuardService } from './services/authguard.service';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';

export const routes: Routes = [
    { path: 'archer/:id', component: ArcherDetailsComponent, canActivate: [AuthGuardService]},
    { path: 'results-upload', component: ResultsUploadComponent, canActivate: [AuthGuardService]},
    { path: 'archers-list', component: ArchersListComponent, canActivate: [AuthGuardService]},
    { path: 'distinctions-list', component: DistinctionsListComponent, canActivate: [AuthGuardService]},
    { path: 'distinctions-to-order', component: DistinctionsToOrderComponent, canActivate: [AuthGuardService]},
    { path: '', component: HomeComponent, canActivate: [AuthGuardService]},
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