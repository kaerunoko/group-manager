import { Component, ViewChild } from '@angular/core';

import { MdDialog} from '@angular/material';

import { GroupChangeRequest } from "./model/change-request";
import { UpdateConfirmDialog } from "./component/dialog/dialog.component";
import { GridEditor } from "./component/editor/grid.component";
import { LoginStatus } from "./service/gapi.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(GridEditor)
  private gridEditor: GridEditor;

  constructor(private dialog: MdDialog) {

  }

  gridChange(event: GroupChangeRequest[]) {
    let confirmDialog = this.dialog.open(UpdateConfirmDialog, { data: { groupChangeRequests: event } });
    confirmDialog.afterClosed().toPromise()
      .then(() => this.editorReset())
      .catch(() => this.editorReset());
  }

  private editorReset(): void{
    this.gridEditor.clearGroupUsers();
  }

  private onLoginStatusChange(event): void {
    this.isLoggedIn = event === LoginStatus.LOGIN;
  };

  private isLoggedIn: boolean = false;
}
