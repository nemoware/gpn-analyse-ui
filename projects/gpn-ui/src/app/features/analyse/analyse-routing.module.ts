import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuardService } from '@core/core.module';

import { AnalyseComponent } from './analyse/analyse.component';
import { AuthenticatedComponent } from './authenticated/authenticated.component';
import { ContractComponent } from './contract/components/contract.component';
import { DocumentsListComponent } from './search/search.component';

const routes: Routes = [
  {
    path: '',
    component: AnalyseComponent,
    children: [
      {
        path: 'search',
        component: DocumentsListComponent,
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'contract/',
        pathMatch: 'full'
      },
      {
        path: 'contract',
        redirectTo: 'contract/',
        pathMatch: 'full'
      },
      {
        path: 'contract/:id',
        component: ContractComponent,
        data: { title: 'gpn.analyse.menu.contract' }
      },

      {
        path: 'authenticated',
        component: AuthenticatedComponent,
        canActivate: [AuthGuardService],
        data: { title: 'gpn.analyse.menu.auth' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnalyseRoutingModule {}
