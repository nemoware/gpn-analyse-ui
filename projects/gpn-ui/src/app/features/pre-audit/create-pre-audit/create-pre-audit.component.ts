import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Inject, OnDestroy } from '@root/node_modules/@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@root/node_modules/@angular/forms';
import { Observable, Subject } from '@root/node_modules/rxjs';
import {
  DateAdapter,
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@root/node_modules/@angular/material';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { PreAuditService } from '@app/features/pre-audit/pre-audit.service';
import { map, takeUntil } from '@root/node_modules/rxjs/operators';

@Component({
  selector: 'gpn-create-pre-audit',
  templateUrl: './create-pre-audit.component.html',
  styleUrls: ['./create-pre-audit.component.scss'],
  providers: [PreAuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePreAuditComponent implements OnInit, OnDestroy {
  faTimes = faTimes;
  auditForm: FormGroup;
  private destroyStream = new Subject<void>();
  checkTypes = ['InsiderControl', 'InterestControl'];
  //Все документы
  documents: Object[] = [];
  //Цепочка бенефециаров
  chain: Object[] = [];
  //Файлы документов
  filesString = '';
  //Файл цепочки бенефециаров
  chainString = '';
  bookValueRelevance$: Observable<Boolean>;

  public typeControl: FormControl = new FormControl(this.checkTypes);

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private preAuditService: PreAuditService,
    public dialogRef: MatDialogRef<CreatePreAuditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {},
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm() {
    this.auditForm = this.fb.group({});
  }

  ngOnDestroy() {
    this.destroyStream.next();
  }

  CloseForm() {
    this.dialogRef.close();
  }

  valid(): boolean {
    if (this.typeControl.value.includes('InterestControl'))
      return (
        !(this.chainString.length === 0 || this.filesString.length === 0) &&
        this.typeControl.value.length > 0
      );
    else {
      return (
        !(this.filesString.length === 0) && this.typeControl.value.length > 0
      );
    }
  }

  //Загрузка договоров и приложений
  uploadFiles(event) {
    this.documents = [];
    const files = event.target.files;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const that = this;
      reader.onload = () => {
        that.documents.push({
          base64Content: reader.result
            .toString()
            .replace('data:', '')
            .replace(/^.+,/, ''),
          fileName: file.name
        });
      };
      reader.onerror = function() {
        console.log(reader.error);
      };
    });
  }

  //Загрузка цепочки бенефециаров
  uploadChain(event) {
    this.chain = [];
    const files = event.target.files;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const that = this;
      reader.onload = () => {
        that.chain.push({
          base64Content: reader.result
            .toString()
            .replace('data:', '')
            .replace(/^.+,/, ''),
          fileName: file.name,
          documentType: 'BENEFICIARY_CHAIN'
        });
      };
      reader.onerror = function() {
        console.log(reader.error);
      };
    });
  }

  submitFiles() {
    this.documents.push(this.chain[0]);
    this.preAuditService
      .postPreAudit(this.documents, this.typeControl.value)
      .pipe(takeUntil(this.destroyStream))
      .subscribe(() => {
        this.CloseForm();
      });
  }

  ngOnInit(): void {
    this.bookValueRelevance$ = this.preAuditService
      .getBookValueReference()
      .pipe(map(data => data.bookValueRelevant));
  }
}
