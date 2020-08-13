import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@root/node_modules/@angular/material';
import { Subject, SubscriptionLike } from '@root/node_modules/rxjs';
import { CharterService } from '@app/features/charter/charter.service';
import { Inject } from '@root/node_modules/@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'gpn-create-charter',
  templateUrl: './create-charter.component.html',
  styleUrls: ['./create-charter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCharterComponent implements OnInit, OnDestroy {
  faTimes = faTimes;
  private _onDestroy = new Subject<void>();
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
      state: 0,
      isActive: true
    };

    this.subscriptions.push(
      this.charterService.postCharter(newCharter).subscribe(
        data => {
          data.analyze_timestamp = Date();
          data.fromDate = '';
          data.toDate = '';
          data.subsidiary = '';
          this.dialogRef.close(data);
        },
        error => console.log(error)
      )
    );
  }

  ngAfterViewInit(): void {}

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  valid(): boolean {
    return this._ftpUrl != null && this._ftpUrl.toString().length > 0;
  }
}
