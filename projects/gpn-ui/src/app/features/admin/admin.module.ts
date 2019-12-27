import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

import { AdminRoutingModule } from '@app/features/admin/admin.routing.module';
import { AdministrationComponent } from '@app/features/admin/administration/administration.component';
import { DialogRoleComponent } from '@app/features/admin/dialog.role/dialog.role.component';
import { MatDialogModule } from '@root/node_modules/@angular/material';
import { DialogUserComponent } from '@app/features/admin/dialog.user/dialog.user.component';

@NgModule({
  declarations: [
    AdministrationComponent,
    DialogRoleComponent,
    DialogUserComponent
  ],
  entryComponents: [DialogRoleComponent, DialogUserComponent],
  imports: [CommonModule, SharedModule, AdminRoutingModule, MatDialogModule]
})
export class AdminModule {}
