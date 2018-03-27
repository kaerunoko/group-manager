import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule, Http, Response } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import 'rxjs/Rx';

import {
  MatButtonModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatDialogModule,
  MatDialogRef,
  MatProgressSpinnerModule,
  MatIconModule,
  MatTabsModule,
  MatInputModule,
  MatSelectModule,
  MatRadioModule,
  MatAutocompleteModule,
  MatCardModule,
  MatTooltipModule,
  MatSnackBarModule
} from '@angular/material';

// my component
import { AppComponent } from './app.component';
import { GroupEditorComponent } from './group-editor/group-editor.component';
import { GridEditorComponent } from './grid-editor/grid-editor.component';
import { UpdateConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { GoogleApiComponent } from './gapi/gapi.component';

// my service
import { GroupService } from './service/group.service';
import { UserService } from './service/user.service';
import { GoogleApiService } from './service/gapi.service';
import { AdminService } from './service/admin.service';

import { GoogleApiServiceImpl } from './service/impl/gapi.service';
import { GoogleApiServiceMock } from './service/mock/gapi.service';
import { AddMemberDialogComponent } from './add-member-dialog/add-member-dialog.component';
import { AdminComponent } from './admin/admin.component';
import { RegisterButtonComponent } from './register-button/register-button.component';
import { AddMemberInputComponent } from './add-member-input/add-member-input.component';

@NgModule({
  declarations: [
    AppComponent,
    GridEditorComponent,
    GroupEditorComponent,
    UpdateConfirmDialogComponent,
    GoogleApiComponent,
    AddMemberDialogComponent,
    AdminComponent,
    RegisterButtonComponent,
    AddMemberInputComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  entryComponents: [
    UpdateConfirmDialogComponent, AddMemberDialogComponent
  ],
  providers: [
    GroupService,
    UserService,
    AdminService,
    GoogleApiService,
    GoogleApiServiceImpl,
    GoogleApiServiceMock
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
