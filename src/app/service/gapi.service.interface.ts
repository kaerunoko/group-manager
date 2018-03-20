import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

export interface GoogleApiServiceIf {
    loadClient(): EventEmitter<LoginStatus>;
    callScriptFunction(remoteFunction: string, remoteParameters?: any): Observable<any>;
    login(): void;
    logout(): void;
}

export enum LoginStatus {
    LOADING, LOGIN, LOGOUT
}
