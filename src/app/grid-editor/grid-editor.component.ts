import { Component, Output, Input, EventEmitter, NgZone } from '@angular/core';
import { Http, Response } from '@angular/http';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { MatSlideToggleModule, MatCheckboxModule } from '@angular/material';

import { ChangeEvent, GroupChangeRequest, GroupUserChangeRequestMode, compareString } from '../model/editor';
import { User } from '../model/user';
import { GroupMembers, GroupMember } from '../model/groupUsers';

import { GroupService } from '../service/group.service';
import { UserService } from '../service/user.service';

@Component({
    selector: 'app-grid-editor',
    templateUrl: 'grid-editor.component.html',
    providers: [GroupService],
    styleUrls: ['../editor.component.scss', 'grid-editor.component.scss']
})
export class GridEditorComponent implements OnInit {
    users: User[] = [];
    groupStatus: GridGroupState[];

    userIdFilter = '';
    userNameFilter = '';
    userMailFilter = '';
    limit = 20;
    filteredUsersCount = 0;
    limits: { 'val': number, 'title': string }[] = [
        { 'val': 20, 'title': '20件' },
        { 'val': 50, 'title': '50件' },
        { 'val': 100, 'title': '100件' },
        { 'val': 200, 'title': '200件 (動作が遅くなることがあります)' },
        { 'val': 500, 'title': '500件 (動作が遅くなることがあります)' },
    ];
    showOnlyActiveGroup = false;
    orderCol: string;
    orderAsc: boolean;

    @Output() onSave: EventEmitter<ChangeEvent> = new EventEmitter();

    // it will be tooooo slow to filter in View if there are lot of data
    filteredUsers(): User[] {
        if (!this.users) { return null; }

        const res = this.users
            .filter(user => this.filterById(user.id))
            .filter(user => this.filterByName(user.name))
            .filter(user => this.filterByMail(user.mail));
        this.filteredUsersCount = res.length;
        return res.filter((user, index) => index < this.limit);
    }

    private filterById(id: number): boolean {
        return id === -1
            || this.userIdFilter.length === 0
            || id === Number(this.userIdFilter);
    }
    private filterByName(name: string): boolean {
        return name === ''
            || name === undefined
            || name === null
            || this.userNameFilter.length === 0
            || name.indexOf(this.userNameFilter) > -1;
    }
    private filterByMail(mail: string): boolean {
        return mail === ''
            || mail === undefined
            || mail === null
            || this.userMailFilter.length === 0
            || mail.indexOf(this.userMailFilter) > -1;
    }

    orderByText(col: string): string {
        if (col === this.orderCol) {
            return this.orderAsc ? '▲' : '▼';
        }
        return '';
    }
    orderBy(col: string): void {
        if (this.orderCol === col) {
            this.orderAsc = !this.orderAsc;
        } else {
            this.orderCol = col;
            this.orderAsc = true;
        }
        this.users.sort((a, b) => {
            let res = 0;
            switch (col) {
                case 'ID': res = a.id - b.id; break;
                case 'NAME': res = compareString(a.name, b.name); break;
                case 'MAIL': res = compareString(a.mail, b.mail); break;
            }
            return res * (this.orderAsc ? 1 : -1);
        });
    }

    constructor(
        private groupService: GroupService,
        private userService: UserService,
        private zone: NgZone
    ) { }

    ngOnInit() {
        this.groupStatus = [];
        this.initGroups();
        this.initUsers();
    }

    reload() {
        this.groupStatus = [];
        this.users = [];
        this.showOnlyActiveGroup = false;
        this.initGroups();
        this.initUsers(true);
    }

    private onToggleEnabled(event, groupMail: string) {
        const groupState = this.findGroup(groupMail);
        if (event.checked) {
            this.groupService.getGroupUsers(groupMail)
                .subscribe(groupUsers => {
                    const userMails: string[] = groupUsers.members.map(user => user.mail);
                    groupState.initUsers(userMails);
                    groupState.enabled = true;
                }, result => {
                    groupState.enabled = false;
                    console.error(result);
                });
        } else {
            // TODO
            // alert
            groupState.init();
            if (!this.hasEnabledGroup()) {
                this.showOnlyActiveGroup = false;
            }
        }
    }

    hasEnabledGroup(): boolean {
        return this.groupStatus.filter(g => g.enabled).length !== 0;
    }

    private onCheck($event, groupMail: string, userMail: string) {
        const groupState = this.findGroup(groupMail);
        if ($event.checked) {
            groupState.addUser(userMail);
        } else {
            groupState.removeUser(userMail);
        }
    }

    private findGroup(groupMail: string): GridGroupState {
        return this.groupStatus.find(g => g.mail === groupMail);
    }

    private initGroups() {
        this.groupService.getGroups()
            .subscribe(result => {
                result.forEach(group => this.groupStatus.push(new GridGroupState(group.mail)));
            });
    }

    private initUsers(reload?: boolean) {
        this.userService.getUserList(reload)
            .subscribe(result => {
                this.users = result;
            });
    }

    public save() {
        const requests: GroupChangeRequest[] = [];

        this.groupStatus.forEach(groupState => {
            if (!groupState.enabled) {
                return;
            }
            const removed = groupState.removedUsers.map(user => new GroupMember(user));
            if (removed.length !== 0) {
                requests.push(new GroupChangeRequest(GroupUserChangeRequestMode.REMOVE_USER_GROUP, groupState.mail, removed));
            }

            const added = groupState.addedUsers.map(user => new GroupMember(user));
            if (added.length !== 0) {
                requests.push(new GroupChangeRequest(GroupUserChangeRequestMode.ADD_USER_GROUP, groupState.mail, added));
            }
        });
        if (requests.length > 0) {
            this.onSave.emit({
                data: requests,
                resolve: (saved) => {
                    if (saved) {
                        this.reload();
                    }
                },
                reject: (reason) => {
                    console.error(reason);
                    this.reload();
                }
            });
        }
    }
}

class GridGroupState {
    private _enabled = false;
    private _mail: string;
    private _savedUsers: string[];
    private _changedUsers: string[];
    constructor(address: string) {
        this._mail = address;
        this.init();
    }
    get enabled(): boolean {
        return this._enabled;
    }
    set enabled(enabled: boolean) {
        this._enabled = enabled;
    }
    get mail(): string {
        return this._mail;
    }
    public init(): void {
        this._savedUsers = [];
        this._changedUsers = [];
        this._enabled = false;
    }
    public initUsers(savedUsers: string[]): void {
        this._savedUsers = savedUsers.concat();
        this._changedUsers = savedUsers.concat();
    }
    public removeUser(userMail: string) {
        const i = this._changedUsers.indexOf(userMail);
        if (i > -1) {
            this._changedUsers.splice(i, 1);
        }
    }
    public addUser(userMail: string) {
        this._changedUsers.push(userMail);
    }
    public hasUser(userMail: string): boolean {
        return this._changedUsers.includes(userMail);
    }
    public getUserState(userMail: string): UserState {
        const before: boolean = this._savedUsers.includes(userMail);
        const after: boolean = this._changedUsers.includes(userMail);
        if (!before && after) {
            return UserState.ADDED;
        } else if (before && !after) {
            return UserState.REMOVED;
        }
        return UserState.NO_CHANGE;
    }

    get removedUsers(): string[] {
        const result = [];
        this._savedUsers.forEach(mail => {
            if (!this._changedUsers.includes(mail)) {
                result.push(mail);
            }
        });
        return result;
    }

    get addedUsers(): string[] {
        const result = [];
        this._changedUsers.forEach(mail => {
            if (!this._savedUsers.includes(mail)) {
                result.push(mail);
            }
        });
        return result;
    }

}
enum UserState { NO_CHANGE, ADDED, REMOVED }
