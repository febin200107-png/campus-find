import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ReportComponent } from './report.component';
import { BrowseComponent } from './browse.component';
import { MatchesComponent } from './matches.component';
export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'CampusFind | Home' },
  { path: 'report', component: ReportComponent, title: 'CampusFind | Report an item' },
  { path: 'browse', component: BrowseComponent, title: 'CampusFind | Browse items' },
  { path: 'matches', component: MatchesComponent, title: 'CampusFind | Possible matches' },
  { path: '**', redirectTo: '' }
];
