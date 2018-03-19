import { Injectable, EventEmitter, OnInit } from '@angular/core';
import { LoginStatus, GoogleApiServiceIf } from '../gapi.service.interface';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

@Injectable()
export class GoogleApiServiceMock implements GoogleApiServiceIf {
    private event: EventEmitter<LoginStatus> = new EventEmitter<LoginStatus>();

    private delay = 1800;

    private users: any[];
    private groups: any[];
    private groupMembers: any[];
    private accounts: any[];
    private accountAdmins: string[];
    private groupAdmins: string[];

    constructor() {
        this.groups = this.initGroups();
        this.users = this.initUsers();
        this.groupMembers = this.initGroupMembers();
        this.accounts = this.initAccounts();
    }

    private run(callback: () => void) {
        setTimeout(callback, this.delay);
    }

    loadClient(): EventEmitter<LoginStatus> {
        this.login();
        return this.event;
    }

    callScriptFunction(remoteFunction: string, remoteParameters?: any): Observable<any> {
        let subscriber: Subscriber<any> = new Subscriber();
        const obs = new Observable((s) => subscriber = s);
        this.run(() => {
            try {
                switch (remoteFunction) {
                    case 'getGroups':
                        subscriber.next(this.groups);
                        break;
                    case 'getUsers':
                        subscriber.next(this.users);
                        break;
                    case 'getGroupMembers':
                        subscriber.next(this.groupMembers[remoteParameters]);
                        break;
                    case 'removeMember':
                        this.removeMember(remoteParameters[0], remoteParameters[1]);
                        subscriber.next('');
                        break;
                    case 'addMember':
                        this.addMember(remoteParameters[0], remoteParameters[1]);
                        subscriber.next('');
                        break;
                    case 'addUserMail':
                        subscriber.next(this.addUserMail(remoteParameters[0], remoteParameters[1]));
                        break;
                    case 'getAccounts':
                        subscriber.next(this.accounts);
                        break;
                    case 'removeAccountAdmin':
                        subscriber.next(this.removeAccountAdmin(remoteParameters));
                        break;
                    case 'addAccountAdmin':
                        this.accountAdmins.push(remoteParameters);
                        subscriber.next(true);
                        break;
                    default:
                        subscriber.error(`${remoteFunction} is not defined`);

                }
            } catch (error) {
                subscriber.error(error);
            }

            subscriber.complete();
        });
        return obs;
    }

    login(): void {
        this.run(() => {
            this.event.next(LoginStatus.LOGIN);
        });
    }
    logout(): void {
        this.run(() => {
            this.event.next(LoginStatus.LOGOUT);
        });
    }

    private initGroups(): any {
        const result = [
            {
                'mail': 'test1@example.com',
                'name': 'テスト1'
            },
            {
                'mail': 'test2@example.com',
                'name': 'テスト2'
            },
            {
                'mail': 'test3@example.com',
                'name': 'テスト3'
            },
            {
                'mail': 'test4@example.com',
                'name': 'テスト4'
            },
            {
                'mail': 'test5@example.com',
                'name': 'テスト5'
            },
            {
                'mail': 'meibo-admin@example.com',
                'name': '名簿管理チーム'
            }
        ];

        for (let i = 6; i < 20; i++) {
            result.push({
                'name': 'name-' + i,
                'mail': i + '@ml.example.com'
            });
        }

        return result;
    }

    private initUsers(): any[] {
        const result = [
            {
                'id': 1,
                'name': 'サトシ',
                'mail': 'satoshi@example.com'
            },
            {
                'id': 2,
                'name': 'マリオ',
                'mail': 'mario@example.com'
            },
            {
                'id': 3,
                'name': 'カービィ',
                'mail': 'kirby@example.com'
            },
            {
                'id': 3,
                'name': 'カービィ',
                'mail': 'kirby-sdx@example.com'
            },
            {
                'id': 4,
                'name': 'ほたる',
                'mail': 'hotaru@example.com'
            },
            {
                'id': 5,
                'name': 'リンク',
                'mail': 'link@example.com'
            },
            {
                'id': 6,
                'name': 'フォックス',
                'mail': 'fox@example.com'
            },
            {
                'id': 7,
                'name': 'ネス',
                'mail': 'Nes@example.com'
            },
            {
                'id': 900,
                'name': 'スネーク'
            }
        ];

        for (let i = 8; i < 400; i++) {
            result.push({
                'id': i,
                'name': 'name-' + i,
                'mail': i + '@example.com'
            });
        }

        return result;
    }

    private initGroupMembers(): any {
        return {
            'test1@example.com': [
                {
                    'email': 'satoshi@example.com'
                },
                {
                    'email': 'mario@example.com'
                },
                {
                    'email': 'kirby@example.com'
                },
                {
                    'email': 'hotaru@example.com'
                },
                {
                    'email': 'link@example.com'
                },
                {
                    'email': 'fox@example.com'
                },
                {
                    'email': 'Nes@example.com'
                },
                {
                    'email': 'unknown@example.com'
                }
            ],
            'meibo-admin@example.com': [
                {
                    'email': 'mario@example.com'
                }
            ]
        };
    }

    private initAccounts(): any {
        return [
            {
                mail: 'mario@example.com',
                id: 'id-00001',
                firstName: 'Mario',
                lastName: '*',
                org: '/名簿管理チーム',
                isAdmin: false
            }
        ];
    }

    private addUserMail(id: number, mail: string): void {
        const users = this.users.filter(user => user.id === id);

        if (users.length === 0) {
            this.users.push({ 'id': id, 'mail': mail });
            return;
        }

        const userWithoutMail = users.find(m => m.mail === undefined);
        if (userWithoutMail) {
            userWithoutMail.mail = mail;
            return;
        }

        this.users.push({ 'id': id, 'name': users[0].name, 'mail': mail });

    }

    private removeMember(group: string, mail: string): any {
        const members: { 'email': string }[] = this.groupMembers[group];
        const index: number = members.findIndex(member => member.email === mail);
        if (index > -1) {
            members.splice(index, 1);
        }
    }


    private addMember(group: string, mail: string): any {
        let members: { 'email': string }[] = this.groupMembers[group];
        if (members === undefined) {
            members = [];
            this.groupMembers[group] = members;
        }
        members.push({ 'email': mail });
    }

    private removeAccountAdmin(mail: string): boolean {
        const index = this.accountAdmins.findIndex(account => account === mail);
        if (index > -1) {
            this.accountAdmins.splice(index, 1);
            return true;
        }
        return false;
    }
}
