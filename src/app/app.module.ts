import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule, Http, Response } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import 'rxjs/Rx';

import {
  MdButtonModule,
  MdCheckboxModule,
  MdSlideToggleModule,
  MdDialogModule,
  MdDialogRef,
  MdProgressSpinnerModule,
  MdIconModule,
  MdTabsModule,
  MdInputModule,
  MdSelectModule,
  MdRadioModule
} from '@angular/material';

// my component
import { AppComponent } from './app.component';
import { MainControl } from "./component/main-control/main-control.component";
import { GridEditor, BulkEditor } from './component/editor/editor.component'
import { UpdateConfirmDialog } from './component/dialog/dialog.component'
import { GoogleApi } from "./component/gapi/gapi.component";

// my service
import { GroupService } from './service/group.service';
import { UserService } from './service/user.service';
import { GoogleApiService } from "./service/gapi.service";

import { GoogleApiServiceImpl } from "./service/impl/gapi.service";
import { GoogleApiServiceMock } from "./service/mock/gapi.service";

@NgModule({
  declarations: [
    AppComponent,
    GridEditor,
    BulkEditor,
    MainControl,
    UpdateConfirmDialog,
    GoogleApi
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    MdButtonModule,
    MdCheckboxModule,
    MdSlideToggleModule,
    MdDialogModule,
    MdProgressSpinnerModule,
    MdIconModule,
    MdTabsModule,
    MdInputModule,
    MdSelectModule,
    MdRadioModule
  ],
  entryComponents: [
    UpdateConfirmDialog
  ],
  providers: [
    GroupService,
    UserService,
    GoogleApiService,
    GoogleApiServiceImpl,
    GoogleApiServiceMock
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
