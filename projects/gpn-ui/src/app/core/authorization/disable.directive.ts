import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { AuthGroup } from '@app/models/permissions';
import { AuthorizationData } from '@core/authorization/authorization.data';

@Directive({
  selector: '[gpnDisable]',
  providers: [AuthorizationData]
})
export class DisableDirective implements OnInit {

  @Input('DisableComponent') permission: AuthGroup;

  constructor(private el: ElementRef, private authorizationService: AuthorizationData) { }
  ngOnInit() {
    if (!this.authorizationService.hasAccess(this.permission)) {
      this.el.nativeElement.disabled = true;
    }
  }
}
