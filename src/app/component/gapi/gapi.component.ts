import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { GoogleApiService, LoginStatus } from "../../service/gapi.service";
import { Observable } from 'rxjs/Observable';
import { Subscriber } from "rxjs/Subscriber";
import { environment } from '../../../environments/environment';

@Component({
    templateUrl: './gapi.component.html',
    selector: 'google-api'
})
export class GoogleApi implements OnInit {
    @Output()
    onChange: EventEmitter<LoginStatus> = new EventEmitter();

    private loginStatus: LoginStatus;

    private setStatus(state: LoginStatus) {
        this.loginStatus = state;
        this.onChange.emit(state);
    }

    constructor(private gapiService: GoogleApiService) {
    }

    public execute(remoteFunction: string, remoteParameters: any): Observable<any> {
        if (this.loginStatus === LoginStatus.LOGIN) {
            return this.gapiService.callScriptFunction(remoteFunction, remoteParameters)
        } else {
            console.log("not logged in!")
            return null;
        }
    }

    ngOnInit(): void {
        this.loginStatus = LoginStatus.LOADING;
        this.gapiService.loadClient().subscribe(this.setStatus.bind(this))
    }

    public login(): void {
        this.gapiService.login();
    }

    public logout(): void {
        this.gapiService.logout()
    }
}
