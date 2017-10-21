import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { User } from './../model/user';
import { GoogleApiService } from './gapi.service';

@Injectable()
export class UserService {
    constructor(private gapiService: GoogleApiService) {
    }

    private userCache: User[];

    getUserList(reflesh?: boolean): Observable<User[]> {
        if (!reflesh) {
            if (this.userCache) {
                return Observable.of(this.userCache);
            }
        }
        return this.gapiService.callScriptFunction('getUsers', null).map((res) => {
            if (res) {
                this.userCache = res.map(user => new User(user.id, user.mail, user.name))
                    .sort((a, b) => {
                        if (a.id < b.id) { return -1; }
                        if (a.id > b.id) { return 1; }
                        return 0;
                    });
            }
            return this.userCache;
        });
    }

    addUserMail(id: number, mail: string): Observable<string> {
        return this.gapiService.callScriptFunction('addUserMail', [id, mail]);
    }
}
