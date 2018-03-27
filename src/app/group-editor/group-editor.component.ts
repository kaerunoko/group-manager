import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { MatInputModule, MatDialog } from '@angular/material';
import { MatCard } from '@angular/material';
import { FormControl } from '@angular/forms';

import { Group } from '../model/group';
import { GroupMember } from '../model/groupUsers';
import { User } from '../model/user';

import { ChangeEvent, GroupChangeRequest, GroupUserChangeRequestMode, compareString } from '../model/editor';
import { GroupService } from '../service/group.service';
import { UserService } from '../service/user.service';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';

import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { MailUtil } from '../utils/mailutil';

@Component({
    templateUrl: './group-editor.component.html',
    selector: 'app-group-editor',
    styleUrls: ['../editor.component.css']
})
export class GroupEditorComponent implements OnInit {
    @Output() onSave: EventEmitter<ChangeEvent> = new EventEmitter();

    message = '';

    selectPlaceholder = '読み込み中...';

    groups: Group[];

    target: string;

    targetMembers: GroupMemberForEdit[] = [];

    orderCol: string;

    orderAsc: boolean;

    loaded = false;

    constructor(private groupService: GroupService, private userService: UserService, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.groupService.getGroups().subscribe(groups => {
            this.groups = groups;
            this.selectPlaceholder = '操作するメーリングリストを選択してください';
        });
    }

    isModified(): boolean {
        return this.targetMembers.find(member => member.state !== GroupMemberState.INIT) !== undefined;
    }

    add(user: User): void {
        const existing = this.targetMembers.find(m => m.mail === user.mail);
        if (existing) {
            existing.state = existing.state === GroupMemberState.ADD_AND_REMOVE ? GroupMemberState.ADD : GroupMemberState.INIT;
        } else {
            const newMember = new GroupMemberForEdit(user.id, user.mail, user.name);
            newMember.state = GroupMemberState.ADD;
            this.targetMembers.unshift(newMember);
        }
    }

    getExistingEmails(): string[] {
        return this.targetMembers
        .filter(m => [GroupMemberState.INIT, GroupMemberState.ADD].includes(m.state))
        .map(m => m.mail);
    }

    save(): void {
        const requests: GroupChangeRequest[] = [];
        const removed = this.targetMembers
            .filter(member => member.state === GroupMemberState.REMOVE)
            .map(member => new GroupMember(member.mail));
        if (removed.length !== 0) {
            requests.push(new GroupChangeRequest(GroupUserChangeRequestMode.REMOVE_USER_GROUP, this.target, removed));
        }

        const added = this.targetMembers
            .filter(member => member.state === GroupMemberState.ADD)
            .map(member => new GroupMember(member.mail));
        if (added.length !== 0) {
            requests.push(new GroupChangeRequest(GroupUserChangeRequestMode.ADD_USER_GROUP, this.target, added));
        }
        if (requests.length > 0) {
            this.onSave.emit(
                {
                    data: requests,
                    resolve: (saved: boolean) => {
                        if (saved) {
                            this.groupChange(null);
                        }
                    },
                    reject: (reason) => {
                        console.error(reason);
                        this.groupChange(null);
                    }
                });
        }

    }

    groupChange(event): void {
        this.targetMembers = [];
        this.loaded = false;
        Observable.forkJoin(
            this.groupService.getGroupUsers(this.target),
            this.userService.getUserList(true))
            .subscribe(([groupMembers, users]) => {
                this.targetMembers = groupMembers.members.map(member => {
                    const user = users.find(u => u.mail === member.mail);
                    if (user) {
                        return new GroupMemberForEdit(user.id, member.mail, user.name);
                    } else {
                        return new GroupMemberForEdit(-1, member.mail, '未登録');
                    }
                });
                this.loaded = true;
            });
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
        this.targetMembers.sort((a, b) => {
            let res = 0;
            switch (col) {
                case 'ID': res = a.id - b.id; break;
                case 'NAME': res = compareString(a.name, b.name); break;
                case 'MAIL': res = compareString(a.mail, b.mail); break;
            }
            return res * (this.orderAsc ? 1 : -1);
        });
    }
}

class GroupMemberForEdit {
    private _id: number;
    private _mail: string;
    private _name: string;
    private _state: GroupMemberState;
    constructor(id: number, mail: string, name: string) {
        this._id = id;
        this._mail = mail;
        this._name = name;
        this._state = GroupMemberState.INIT;
    }
    static of(user: User, state: GroupMemberState): GroupMemberForEdit {
        const result = new GroupMemberForEdit(user.id, user.mail, user.name);
        result.state = state;
        return result;
    }

    set state(state: GroupMemberState) {
        this._state = state;
    }
    get state(): GroupMemberState {
        return this._state;
    }
    get id(): number {
        return this._id;
    }
    get mail(): string {
        return this._mail;
    }
    get name(): string {
        return this._name;
    }
    public remove(): void {
        if (this.state === GroupMemberState.INIT) {
            this.state = GroupMemberState.REMOVE;
        } else {
            this.state = GroupMemberState.ADD_AND_REMOVE;
        }
    }
    public undo(): void {
        if (this.state === GroupMemberState.REMOVE) {
            this.state = GroupMemberState.INIT;
        } else {
            this.state = GroupMemberState.ADD;
        }
    }
}

enum GroupMemberState {
    INIT, REMOVE, ADD, ADD_AND_REMOVE
}
