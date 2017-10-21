import { Component, Output, Input, EventEmitter, NgZone } from '@angular/core';
import { Http, Response } from '@angular/http';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { MdSlideToggleModule, MdCheckboxModule } from '@angular/material';

import { User } from '../../model/user';
import { GroupUsers, GroupUser } from '../../model/groupUsers';
import { GroupChangeRequest, GroupUserChangeRequestMode } from "../../model/change-request";

import { GroupService } from '../../service/group.service';
import { UserService } from '../../service/user.service';

@Component({
    selector: "grid-editor",
    templateUrl: "grid.component.html",
    providers: [GroupService],
    styleUrls: []
})
export class GridEditor implements OnInit {
    private users: User[];
    private groupStatus: GridGroupState[];
    constructor(
        private groupService: GroupService,
        private userService: UserService,
        private zone: NgZone
    ) { };

    @Output() change: EventEmitter<GroupChangeRequest[]> = new EventEmitter();

    ngOnInit() {
        this.groupStatus = [];
        this.initGroups();
        this.initUsers();
    }

    reload() {
        // TODO 確認ダイアログ
        this.groupStatus = [];
        this.users = [];
        this.initGroups();
        this.initUsers();
    }

    private flush(): void{
        this.zone.run(() => { });
    }

    public clearGroupUsers(){
        this.groupStatus.forEach(groupState => groupState.init())
    }

    onToggleEnabled(event, groupMail: string) {
        const groupState = this.findGroup(groupMail);
        if (event.checked) {
            this.groupService.getGroupUsers(groupMail)
                .subscribe(groupUsers => {
                    const userMails: string[] = groupUsers.users.map(user => user.mail);
                    groupState.initUsers(userMails);
                    groupState.enabled = true;
                    this.flush();
                }, result => {
                    groupState.enabled = false;
                    console.error(result);
                    this.flush();
                });
        } else {
            // TODO
            // alert
            groupState.init();
        }
    }

    onCheck($event, groupMail: string, userMail: string) {
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

    private initUsers() {
        this.userService.getUserList()
            .subscribe(result => {
                this.users = result;
            })
    }

    public save() {
        let requests: GroupChangeRequest[] = [];

        this.groupStatus.forEach(groupState => {
            if(!groupState.enabled){
                return;
            }
            const removed = groupState.removedUsers.map(user => new GroupUser(user));
            if (removed.length !== 0) {
                requests.push(new GroupChangeRequest(GroupUserChangeRequestMode.REMOVE_USER_GROUP, groupState.mail, removed));
            }

            const added = groupState.addedUsers.map(user => new GroupUser(user));
            if (added.length !== 0) {
                requests.push(new GroupChangeRequest(GroupUserChangeRequestMode.ADD_USER_GROUP, groupState.mail, added));
            }
        })
        this.change.emit(requests);
    }
}

class GridGroupState {
    private _enabled: boolean = false;
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
            return UserState.ADDED
        } else if (before && !after) {
            return UserState.REMOVED
        }
        return UserState.NO_CHANGE;
    }

    get removedUsers(): string[] {
        let result = [];
        this._savedUsers.forEach(mail => {
            if (!this._changedUsers.includes(mail)) {
                result.push(mail);
            }
        })
        return result;
    }

    get addedUsers(): string[] {
        let result = [];
        this._changedUsers.forEach(mail => {
            if (!this._savedUsers.includes(mail)) {
                result.push(mail);
            }
        })
        return result;
    }

}
enum UserState { NO_CHANGE, ADDED, REMOVED };
