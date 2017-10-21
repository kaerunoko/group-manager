import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { MatInputModule, MatDialog } from '@angular/material';
import { MatCard } from '@angular/material';

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

    showCsvMenu = false;

    mode = 'add';

    groups: Group[];

    mailLines: string;

    target: string;

    targetMembers: GroupMemberForEdit[] = [];

    orderCol: string;

    orderAsc: boolean;

    loaded = false;

    /**
     * return email list
     * with simple validate
     * @param src
     * @throws error
     */
    private static parse(src: string): string[] {
        if (src === null || src === '') {
            return [];
        }
        const lines = src.split('\n')
            .map(line => line.trim().toLowerCase())
            .filter(line => line !== '');

        const errors = [];
        lines.forEach(line => {
            if (!MailUtil.isValid(line)) {
                errors.push(line);
            }
        });
        if (errors.length > 0) {
            throw new Error('不正なメールアドレスです: ' + errors.join(', '));
        }

        return lines;
    }

    constructor(private groupService: GroupService, private userService: UserService, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.groupService.getGroups().subscribe(groups => {
            this.groups = groups;
            this.selectPlaceholder = '操作するメーリングリストを選択してください';
        });
    }

    hideCsvMenu(): void {
        this.mode = 'add';
        this.mailLines = '';
        this.showCsvMenu = false;
    }

    isModified(): boolean {
        return this.targetMembers.find(member => member.state !== GroupMemberState.INIT) !== undefined;
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

    applyToList(): void {
        this.message = '解析中...';

        this.validate()
            .then(mails => this.compareUserList(mails))
            .then(compareResult => {
                if (compareResult.undefined.length > 0) {
                    // TODO 該当しなかったものの処理
                    console.error(compareResult.undefined);
                    // ダイアログとかで名簿から選択させる？
                    // 一旦「戻す」ことにする
                    this.mailLines = compareResult.undefined.join('\n');
                    this.message = '未登録のメールアドレスがあります';
                } else {
                    this.mailLines = '';
                    this.message = '';
                }
                return this.compareAndApply(compareResult.exist, this.mode);
            }).catch(val => {
                console.error(val);
                this.message = val;
            });
    }

    private validate(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if (!this.mode || !this.mailLines || !this.target) {
                reject('すべての項目を入力してください');
            }
            try {
                const mails = GroupEditorComponent.parse(this.mailLines);
                resolve(mails);
            } catch (msg) {
                reject(msg.message);
            }
        });
    }

    private compareUserList(mails: string[]): Promise<{ 'exist': string[], 'undefined': string[] }> {
        return new Promise<{ 'exist': string[], 'undefined': string[] }>((resolve, reject) => {
            this.userService.getUserList().toPromise()
                .then(currentUsers => {
                    const existMails = mails.filter(mail => currentUsers.find(user => user.mail === mail));
                    const undefinedMails = mails.filter(mail => !currentUsers.find(user => user.mail === mail));
                    resolve({
                        'exist': existMails,
                        'undefined': undefinedMails
                    });
                }, () => {
                    reject('通信エラー');
                });
        });
    }

    private addMemberMail(mails: string[]) {
        mails.forEach(mail => {
            const member = this.targetMembers.find(groupUser => groupUser.mail === mail);
            if (!member) {
                this.userService.getUserList().toPromise().then(users => {
                    let user = users.find(u => u.mail === mail);
                    if (!user) {
                        user = new User(-1, mail, '未登録');
                    }
                    this.targetMembers.unshift(GroupMemberForEdit.of(user, GroupMemberState.ADD));
                });
            } else if (member.state === GroupMemberState.REMOVE) {
                member.state = GroupMemberState.INIT;
            } else if (member.state === GroupMemberState.ADD_AND_REMOVE) {
                member.state = GroupMemberState.ADD;
            }
        });
    }

    private compareAndApply(mails: string[], mode: string): void {
        this.addMemberMail(mails);
        if (mode === 'add') {
            return;
        }
        this.targetMembers.forEach(member => {
            const mail = mails.find(m => m === member.mail);
            if (mail) {

            } else {
                member.state = GroupMemberState.REMOVE;
            }
        });
    }

    addNewMember(): void {
        const addMemberDialog = this.dialog.open(AddMemberDialogComponent, {
            width: '450px',
            data: {
                'memberMails': this.targetMembers
                    .filter(mem => mem.state === GroupMemberState.INIT || mem.state === GroupMemberState.ADD)
                    .map(mem => mem.mail)
            }
        });
        addMemberDialog.afterClosed()
            .subscribe((result) => {
                if (result && result.mails) {
                    this.userService.getUserList(true).toPromise().then(() => {
                        this.addMemberMail(result.mails);
                    });
                }
            }, console.error);
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
