import { Routes } from '@angular/router';
import { ArcherDetailsComponent } from './archer-details/archer-details.component';
import { ResultsUploadComponent } from './results-upload/results-upload.component';
import { ArchersListComponent } from './archers-list/archers-list.component';

export const routes: Routes = [
    { path: 'archer/:licenceId', component: ArcherDetailsComponent},
    { path: 'results-upload', component: ResultsUploadComponent},
    { path: 'archers-list', component: ArchersListComponent},
];
