import { Injectable, EventEmitter } from '@angular/core';
import { GoogleApiServiceIf, LoginStatus } from './gapi.service.interface';
import { GoogleApiServiceImpl } from './impl/gapi.service';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { GoogleApiServiceMock } from './mock/gapi.service';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class GoogleApiService implements GoogleApiServiceIf {
    private service: GoogleApiServiceIf;

    constructor(private impl: GoogleApiServiceImpl, private mock: GoogleApiServiceMock,
        public snackBar: MatSnackBar) {
        if (environment.mock) {
            this.service = mock;
            console.warn('Mock mode');
        } else {
            this.service = impl;
        }
    }

    public loadClient(): EventEmitter<LoginStatus> {
        return this.service.loadClient();
    }

    public login(): void {
        this.service.login();
    }

    public logout(): void {
        this.service.logout();
    }

    public callScriptFunction(remoteFunction: string, remoteParameters?: any): Observable<any> {
        return this.service.callScriptFunction(remoteFunction, remoteParameters)
            .catch(error => {
                this.openSnackBar(error);
                return Observable.throw(error);
            });
    }

    private openSnackBar(message: string, action?: string) {
        this.snackBar.open(message, action ? action : 'OK', {
            duration: 8000,
        });
    }
}
