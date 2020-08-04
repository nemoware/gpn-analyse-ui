import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSelect
} from '@root/node_modules/@angular/material';
import {
  ReplaySubject,
  Subject,
  SubscriptionLike
} from '@root/node_modules/rxjs';
import { CharterService } from '@app/features/charter/charter.service';
import { FormControl } from '@root/node_modules/@angular/forms';
import { Subsidiary } from '@app/models/subsidiary.model';
import { Inject, ViewChild } from '@root/node_modules/@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { take, takeUntil } from '@root/node_modules/rxjs/operators';

@Component({
  selector: 'gpn-create-charter',
  templateUrl: './create-charter.component.html',
  styleUrls: ['./create-charter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCharterComponent implements OnInit, OnDestroy {
  faTimes = faTimes;
  public subsidiaryCtrl: FormControl = new FormControl();
  public subsidiaryFilterCtrl: FormControl = new FormControl();
  public filteredSubsidiaries: ReplaySubject<Subsidiary[]> = new ReplaySubject<
    Subsidiary[]
  >(1);
  private subsidiaries: Subsidiary[];
  private _onDestroy = new Subject<void>();
  @ViewChild('selectSubsidiary', { static: false }) selectSubsidiary: MatSelect;
  _ftpUrl: string = null;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    public dialogRef: MatDialogRef<CreateCharterComponent>,
    private charterService: CharterService,
    @Inject(MAT_DIALOG_DATA) public data: {}
  ) {}

  ngOnInit() {}

  CloseForm() {
    this.dialogRef.close();
  }

  uploadCharter() {
    const newCharter = {
      ftpUrl: this._ftpUrl,
      createDate: new Date(),
      author: null,
      parse: {
        documentType: 'CHARTER'
      },
      isActive: true,
      subsidiary: {
        name: this.subsidiaryCtrl.value.name
      }
    };

    this.subscriptions.push(
      this.charterService.postCharter(newCharter).subscribe(
        data => {
          data.subsidiary = data.subsidiary.name;
          data.fromDate = 'Ожидает анализа';
          this.dialogRef.close(data);
        },
        error => console.log(error)
      )
    );
  }

  ngAfterViewInit(): void {
    this.charterService.getSubsidiaries().subscribe(data => {
      this.subsidiaries = data;
      const allSubs = { name: '* Все ДО' };
      this.subsidiaries.unshift(allSubs);

      this.filteredSubsidiaries.next(this.subsidiaries.slice());
      this.subsidiaryFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterSubsidiaries();
        });
      this.setInitialValue();
    });
  }

  private setInitialValue() {
    this.filteredSubsidiaries
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectSubsidiary.compareWith = (a: Subsidiary, b: Subsidiary) =>
          a.name === b.name;
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterSubsidiaries() {
    if (!this.subsidiaries) {
      return;
    }
    let search = this.subsidiaryFilterCtrl.value;
    if (!search) {
      this.filteredSubsidiaries.next(this.subsidiaries.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredSubsidiaries.next(
      this.subsidiaries.filter(
        subsidiary => subsidiary.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  valid(): boolean {
    return (
      this._ftpUrl != null &&
      this._ftpUrl.toString().length > 0 &&
      this.subsidiaryCtrl.value != null
    );
  }
}
