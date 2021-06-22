import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AffiliatesListRoutingModule } from './affiliates-list-routing.module';
import { AffiliatesListTableComponent } from './affiliates-list-table/affiliates-list-table.component';
import { SharedModule } from '@shared/shared.module';
import { NgxSpinnerModule } from '@root/node_modules/ngx-spinner';
import { FilterModule } from '@app/features/filter/filter.module';

@NgModule({
  declarations: [AffiliatesListTableComponent],
  imports: [
    CommonModule,
    AffiliatesListRoutingModule,
    SharedModule,
    NgxSpinnerModule,
    FilterModule
  ]
})
export class AffiliatesListModule {}
