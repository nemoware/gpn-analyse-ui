import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@shared/shared.module';
import { environment } from '@environments/environment';
import { AnalyseRoutingModule } from './analyse-routing.module';
import { AnalyseComponent } from './analyse/analyse.component';

import { ContractComponent } from './contract/components/contract.component';

import { AuthenticatedComponent } from './authenticated/authenticated.component';
import { AnalyseEffects } from './analyse.effects';
import { DocumentsListComponent } from './search/search.component';
import { DocInfoComponent } from './search/doc-info/doc-info.component';
import { ViewDocComponent } from '@app/features/analyse/contract/components/view-doc.component';

@NgModule({
  imports: [
    SharedModule,
    AnalyseRoutingModule,

    EffectsModule.forFeature([
      AnalyseEffects
    ])
  ],
  declarations: [
    AnalyseComponent,
    AuthenticatedComponent,
    ContractComponent,
    DocumentsListComponent, DocInfoComponent, ViewDocComponent
  ],
  providers: []
})
export class AnalyseModule {
  constructor() {}
}
