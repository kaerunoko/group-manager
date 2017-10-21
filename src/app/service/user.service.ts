import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from "rxjs/Subscriber";
import { User } from './../model/user'
import { GoogleApiService } from "./gapi.service";

@Injectable()
export class UserService {
    constructor(private gapiService: GoogleApiService) {
    }

    getUserList(): Observable<User[]> {
        return this.gapiService.callScriptFunction('getUsers', null).map((res) => {
            return res && res.map(user => new User(user.mail, user.name))
        })
    }
}