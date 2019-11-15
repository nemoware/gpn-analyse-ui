import {
  TRANSLATIONS,
  TRANSLATIONS_FORMAT,
  LOCALE_ID,
  NgModule
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListAuditComponent } from '@app/features/audit/list.audit/list.audit.component';
import { SharedModule } from '@shared/shared.module';
import { ListAuditRoutingModule } from '@app/features/audit/audit-routing.module';
import { CreateAuditComponent } from './create-audit/create-audit.component';
import { NgxMatSelectSearchModule } from '@root/node_modules/ngx-mat-select-search';
import { ReactiveFormsModule } from '@root/node_modules/@angular/forms';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatFormFieldModule,
  MatSelectModule,
  MAT_DATE_LOCALE,
  MatTreeModule,
  MatDialogModule,
  MatExpansionModule
} from '@root/node_modules/@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from '@app/format/app-date-adapter';
import { FontAwesomeModule } from '@root/node_modules/@fortawesome/angular-fontawesome';
import { AuditResultComponent } from './audit-parser-result/audit-parser-result.component';
import { ScrollingModule } from '@root/node_modules/@angular/cdk/scrolling';
import { TranslateModule } from '@root/node_modules/@ngx-translate/core';
import { AuditAnalyseResultComponent } from './audit-analyse-result/audit-analyse-result.component';
import { AuditEditorComponent } from './audit-editor/audit-editor.component';
import { ViewDocumentComponent } from './audit-editor/view-document/view-document.component';
import { TreeAttributesComponent } from './audit-editor/tree-attributes/tree-attributes.component';
import { EditAttributeComponent } from './audit-editor/edit-attribute/edit-attribute.component';
import { DragDropModule } from '@root/node_modules/@angular/cdk/drag-drop';
import { DocumentDetailsComponent } from './audit-editor/document-details/document-details.component';
import { SearchDocumentComponent } from './audit-editor/search-document/search-document.component';
import { NgxSpinnerModule } from '@root/node_modules/ngx-spinner';
import { CompetencechartsComponent } from './audit-editor/competencecharts/competencecharts.component';
import { HighchartsChartComponent } from '@root/node_modules/highcharts-angular';

@NgModule({
  declarations: [
    ListAuditComponent,
    CreateAuditComponent,
    AuditResultComponent,
    AuditAnalyseResultComponent,
    AuditEditorComponent,
    ViewDocumentComponent,
    TreeAttributesComponent,
    EditAttributeComponent,
    DocumentDetailsComponent,
    SearchDocumentComponent,
    CompetencechartsComponent,
    HighchartsChartComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ListAuditRoutingModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    FontAwesomeModule,
    MatTreeModule,
    MatDialogModule,
    ScrollingModule,
    TranslateModule,
    DragDropModule,
    NgxSpinnerModule,
    MatExpansionModule
  ],
  entryComponents: [
    CreateAuditComponent,
    AuditResultComponent,
    EditAttributeComponent,
    SearchDocumentComponent
  ],
  exports: [ViewDocumentComponent],
  providers: [
    {
      provide: DateAdapter,
      useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    { provide: LOCALE_ID, useValue: 'ru' }
  ]
})
export class AuditModule {}
