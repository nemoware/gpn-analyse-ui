import { DashboardComponent } from './dash.component';
import { FeatureListRoutingModule } from './dash-routing.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, SharedModule, FeatureListRoutingModule]
})
export class FeatureListModule {}
