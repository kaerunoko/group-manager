import { Injectable, EventEmitter } from '@angular/core';
import { GoogleApiServiceIf, LoginStatus } from "../gapi.service";
import { Observable } from 'rxjs/Observable';
import { Subscriber } from "rxjs/Subscriber";

@Injectable()
export class GoogleApiServiceMock implements GoogleApiServiceIf {
    private event: EventEmitter<LoginStatus> = new EventEmitter<LoginStatus>();

    private delay: number = 10;

    private run(callback: () => void) {
        setTimeout(callback, this.delay)
    };

    loadClient(): EventEmitter<LoginStatus> {
        this.login();
        return this.event;
    }

    callScriptFunction(remoteFunction: string, remoteParameters: any): Observable<any> {
        let subscriber: Subscriber<any> = new Subscriber();
        let obs = new Observable((s) => subscriber = s);
        this.run(() => {
            switch (remoteFunction) {
                case "getGroupList":
                    subscriber.next(this.getGroupList())
                    break;
                case "getUsers":
                    subscriber.next(this.getUsers())
                    break;
                case "getGroupUser":
                    subscriber.next(this.getGroupUser(remoteParameters))
                    break;
            }
        });
        return obs;
    }

    login(): void {
        this.run(() => {
            this.event.next(LoginStatus.LOGIN)
        });
    }
    logout(): void {
        this.run(() => {
            this.event.next(LoginStatus.LOGOUT)
        })
    }

    private getGroupList(): any {
        return {
            "groups": [
                {
                    "mail": "test1@kaerunoko.com",
                    "name": "テスト1"
                },
                {
                    "mail": "test2@kaerunoko.com",
                    "name": "テスト2"
                },
                {
                    "mail": "test3@kaerunoko.com",
                    "name": "テスト3"
                },
                {
                    "mail": "test4@kaerunoko.com",
                    "name": "テスト4"
                },
                {
                    "mail": "test5@kaerunoko.com",
                    "name": "テスト5"
                }
            ]
        }
    }

    private getUsers(): any {
        return {
            "users": [
                {
                    "name": "サトシ",
                    "mail": "satoshi@example.com"
                },
                {
                    "name": "マリオ",
                    "mail": "mario@example.com"
                },
                {
                    "name": "カービィ",
                    "mail": "kirby@example.com"
                },
                {
                    "name": "ほたる",
                    "mail": "hotaru@example.com"
                },
                {
                    "name": "リンク",
                    "mail": "link@example.com"
                },
                {
                    "name": "フォックス",
                    "mail": "fox@example.com"
                },
                {
                    "name": "ネス",
                    "mail": "Nes@example.com"
                }
            ]
        }
    }

    private getGroupUser(groupEmail: string) {
        return {
            "group": "test1@kaerunoko.com",
            "users": [
                {
                    "email": "satoshi@example.com"
                },
                {
                    "email": "mario@example.com"
                },
                {
                    "email": "kirby@example.com"
                },
                {
                    "email": "hotaru@example.com"
                },
                {
                    "email": "link@example.com"
                },
                {
                    "email": "fox@example.com"
                },
                {
                    "email": "Nes@example.com"
                }
            ]
        }
    }
}