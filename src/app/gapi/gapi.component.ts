import { Component, Output, Input, EventEmitter, OnInit, NgZone } from '@angular/core';
import { GoogleApiService } from '../service/gapi.service';
import { LoginStatus } from '../service/gapi.service.interface';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { environment } from '../../environments/environment';

@Component({
    templateUrl: './gapi.component.html',
    selector: 'app-google-api'
})
export class GoogleApiComponent implements OnInit {
    @Output()
    onChange: EventEmitter<LoginStatus> = new EventEmitter();

    loginStatus: LoginStatus;

    private setStatus(state: LoginStatus) {
        this.loginStatus = state;
        this.onChange.emit(state);
    }

    constructor(private gapiService: GoogleApiService) {
    }

    ngOnInit(): void {
        this.loginStatus = LoginStatus.LOADING;
        this.gapiService.loadClient().subscribe(this.setStatus.bind(this));
    }

    public login(): void {
        this.gapiService.login();
    }

    public logout(): void {
        this.gapiService.logout();
    }
}
