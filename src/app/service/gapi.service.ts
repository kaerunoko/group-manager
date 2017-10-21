import { Injectable, EventEmitter } from '@angular/core';
import { GoogleApiServiceImpl } from "./impl/gapi.service";
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { GoogleApiServiceMock } from "./mock/gapi.service";

export interface GoogleApiServiceIf {
    loadClient(): EventEmitter<LoginStatus>;
    callScriptFunction(remoteFunction: string, remoteParameters: any): Observable<any>;
    login(): void;
    logout(): void;
}

@Injectable()
export class GoogleApiService implements GoogleApiServiceIf {
    private service: GoogleApiServiceIf;

    constructor(private impl: GoogleApiServiceImpl, private mock: GoogleApiServiceMock) {
        if (environment.mock){
            this.service = mock;
            console.warn("Mock mode");
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

    public callScriptFunction(remoteFunction: string,
        remoteParameters: any): Observable<any> {
            return this.service.callScriptFunction(remoteFunction, remoteParameters);
    }
}

export enum LoginStatus {
    LOADING, LOGIN, LOGOUT
}