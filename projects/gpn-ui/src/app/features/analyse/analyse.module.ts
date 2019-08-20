import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '@shared/shared.module';
import { environment } from '@environments/environment';

import { ViewDocComponent } from '@app/features/analyse/contract/components/view-doc/view-doc.component';
import { DocFilterComponent } from './search/doc-filter/doc-filter.component';
import { AnalyseRoutingModule } from './analyse-routing.module';
import { AnalyseComponent } from './analyse/analyse.component';
import { ContractComponent } from './contract/components/contract.component';
import { AuthenticatedComponent } from './authenticated/authenticated.component';
import { AnalyseEffects } from './analyse.effects';
import { DocumentsListComponent } from './search/search.component';
import { DocInfoComponent } from './search/doc-info/doc-info.component';
import { FormsModule, ReactiveFormsModule } from '@root/node_modules/@angular/forms';
import { APP_DATE_FORMATS, AppDateAdapter } from '@app/features/analyse/search/doc-filter/app-date-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MatButtonToggleModule } from '@root/node_modules/@angular/material';


@NgModule({
  imports: [
    SharedModule,
    AnalyseRoutingModule,
    EffectsModule.forFeature([
      AnalyseEffects,
      FormsModule,
      ReactiveFormsModule
    ]),
    MatButtonToggleModule
  ],
  declarations: [
    AnalyseComponent,
    AuthenticatedComponent,
    ContractComponent,
    DocumentsListComponent, DocInfoComponent, ViewDocComponent, DocFilterComponent
  ],
  providers: [{
    provide: DateAdapter, useClass: AppDateAdapter
  },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }]
})
export class AnalyseModule {
  constructor() {}
}
