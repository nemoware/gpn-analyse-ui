import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter/filter.component';
import { SharedModule } from '@shared/shared.module';
import { TranslateModule } from '@root/node_modules/@ngx-translate/core';

@NgModule({
  declarations: [FilterComponent],
  imports: [CommonModule, SharedModule, TranslateModule],
  exports: [FilterComponent]
})
export class FilterModule {}
