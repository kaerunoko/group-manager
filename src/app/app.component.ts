import { Component, ViewChild } from '@angular/core';

import { MatDialog} from '@angular/material';

import { UpdateConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ChangeEvent } from './model/editor';
import { LoginStatus } from './service/gapi.service.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public isLoggedIn = false;

  constructor(private dialog: MatDialog) {

  }

  groupMemberChange(event: ChangeEvent) {
    const confirmDialog = this.dialog.open(UpdateConfirmDialogComponent, { data: { groupChangeRequests: event.data } });
    confirmDialog.afterClosed().toPromise()
      .then(event.resolve)
      .catch(event.reject);
  }

  onLoginStatusChange(event): void {
    this.isLoggedIn = event === LoginStatus.LOGIN;
  }
}
