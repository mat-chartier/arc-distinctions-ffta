import { Routes } from '@angular/router';
import { ArcherDetailsComponent } from './archer-details/archer-details.component';
import { ResultsUploadComponent } from './results-upload/results-upload.component';
import { ArchersListComponent } from './archers-list/archers-list.component';
import { DistinctionsListComponent } from './distinctions-list/distinctions-list.component';
import { DistinctionsToOrderComponent } from './distinctions-to-order/distinctions-to-order.component';

export const routes: Routes = [
    { path: 'archer/:id', component: ArcherDetailsComponent},
    { path: 'results-upload', component: ResultsUploadComponent},
    { path: 'archers-list', component: ArchersListComponent},
    { path: 'distinctions-list', component: DistinctionsListComponent},
    { path: 'distinctions-to-order', component: DistinctionsToOrderComponent},
];
