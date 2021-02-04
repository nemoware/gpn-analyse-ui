import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
  Input,
  OnDestroy
} from '@angular/core';
import { AuditService } from '@app/features/audit/audit.service';
import { ActivatedRoute, Router } from '@root/node_modules/@angular/router';
import { Document } from '@app/models/document.model';
import { ViewDocumentComponent } from '@app/features/audit/audit-editor/view-document/view-document.component';
import { TreeAttributesComponent } from '@app/features/audit/audit-editor/tree-attributes/tree-attributes.component';
import { AttributeModel } from '@app/models/attribute-model';
import { Helper } from '@app/features/audit/helper';
// import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';
import { ResizedEvent } from 'angular-resize-event';
import { CompetencechartsComponent } from '@app/features/audit/audit-editor/competencecharts/competencecharts.component';
import { takeUntil } from '@root/node_modules/rxjs/operators';
import { Subject } from '@root/node_modules/rxjs';

@Component({
  selector: 'gpn-audit-editor',
  templateUrl: './audit-editor.component.html',
  styleUrls: ['./audit-editor.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  IdDocument;
  document: Document;
  attributes: Array<AttributeModel>;
  editmode: boolean;
  @ViewChild(ViewDocumentComponent, { static: false })
  view_doc: ViewDocumentComponent;
  @ViewChild(TreeAttributesComponent, { static: false })
  tree: TreeAttributesComponent;
  @ViewChild(CompetencechartsComponent, { static: false })
  competencecharts: CompetencechartsComponent;
  documentType: string[];
  changed = false;
  selectedAttribute: string;
  selectedType: string;
  private destroyStream = new Subject<void>();
  listOfDocumentTypes = [
    'CONTRACT',
    'CHARTER',
    'PROTOCOL',
    'SUPPLEMENTARY_AGREEMENT',
    'ANNEX'
  ];
  subjects = [];
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.IdDocument = this.activatedRoute.snapshot.paramMap.get('id');
    this.editmode = this.activatedRoute.snapshot.data['editmode'];
    this.selectedAttribute = this.activatedRoute.snapshot.queryParams.attribute;
    window.addEventListener('beforeunload', event => {
      if (this.changed) {
        event.preventDefault();
        event.returnValue = '';
      }
    });
  }

  ngAfterViewInit(): void {
    this.refreshData();
  }

  hasWarnings(): boolean {
    return (
      this.document &&
      this.document.analysis &&
      this.document.analysis.warnings &&
      this.document.analysis.warnings.length > 0
    );
  }

  refreshData(needRefresh: boolean = false) {
    this.auditservice
      .getDoument(this.IdDocument)
      .pipe(takeUntil(this.destroyStream))
      .subscribe(data => {
        this.document = data;
        if (this.document.user) {
          this.attributes = Helper.json2array(this.document.user.attributes);
        } else if (this.document.analysis.attributes) {
          this.attributes = Helper.json2array(
            this.document.analysis.attributes
          );
        } else this.attributes = [];
        if (needRefresh) this.view_doc.refreshView(this.attributes);
        this.selectedType = this.document.documentType;
        if (this.document.primary_subject) {
          this.subjects.push(this.document.primary_subject);
        }
        if (this.getAttrValue('subject')) {
          this.subjects.push(this.getAttrValue('subject'));
        }
        console.log(this.subjects.length === 0);
        this.changeDetectorRefs.detectChanges();
      });
  }

  goToAttribute(id: string) {
    this.view_doc.goToAttribute(id);
  }

  changeAttribute(attributes: AttributeModel[]) {
    this.changed = true;
    this.tree.updateAttributes(attributes);
  }

  refresh() {
    this.refreshData(true);
    this.changed = false;
    //
  }

  onResized(event: ResizedEvent) {
    const el1 = document.getElementById('document_v');
    el1.setAttribute('style', 'height:' + event.newHeight + 'px');
    const el = document.getElementById('view_doc');
    el.setAttribute('style', 'height:' + (event.newHeight - 10) + 'px');
  }

  saveChanges() {
    if (this.selectedType === this.document.documentType) {
      this.view_doc.saveChanges();
    } else {
      this.view_doc.saveChanges(this.selectedType);
    }
    if (this.competencecharts)
      this.competencecharts.refreshData(this.view_doc.attributes);
  }

  // editMode() {
  //   this.router.navigate(['audit/edit/', this.document._id]);
  // }

  getAttrValue(attrName: string, default_value = null) {
    if (this.attributes) {
      const atr = this.attributes.find(x => x.key === attrName);
      if (atr) return atr.value;
    }
    return default_value;
  }

  onClick() {
    this.document.isActive = !this.document.isActive;
    this.auditservice
      .deactivateCharter(this.document._id, this.document.isActive)
      .pipe(takeUntil(this.destroyStream))
      .subscribe(
        () => {},
        error => {
          alert(error.message());
        }
      );
  }

  selectionChanged() {
    this.changed = this.selectedType !== this.document.documentType;
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
