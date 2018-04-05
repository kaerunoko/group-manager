import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { GroupService } from '../service/group.service';

import { GroupChangeRequest, GroupUserChangeRequestMode } from '../model/editor';
import { GroupMember } from '../model/groupUsers';

@Component({
    templateUrl: 'confirm-dialog.component.html',
    styleUrls: ['confirm-dialog.component.scss']
})
export class UpdateConfirmDialogComponent implements OnInit {
    groupChangeRequests: GroupChangeRequest[];
    private requestStatus: { [key: string]: RequestState; };

    message: string;
    errorMessage: string;
    isRequested: boolean;

    // Map で実装するとキーがオブジェクトになってしまってデータバインドで使いづらかったため、自作のキーで連想配列として管理
    private static generateKey(gc: GroupChangeRequest, user: GroupMember): string {
        return `group: ${gc.group}, mode: ${gc.mode}, user: ${user.mail}`;
    }

    private static stateString(state: RequestState): string {
        switch (state) {
            case RequestState.REQUESTING:
                return 'requesting';
            case RequestState.SUBMITTED:
                return 'submitted';
            case RequestState.REJECTED:
            case RequestState.ERROR:
                return 'error';
            case RequestState.NONE:
            default:
                return '';
        }
    }

    constructor(
        public dialogRef: MatDialogRef<UpdateConfirmDialogComponent>,
        private groupService: GroupService,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.groupChangeRequests = this.data.groupChangeRequests;
        this.requestStatus = {};
        this.groupChangeRequests.forEach(gcr => {
            gcr.users.forEach(user => {
                this.setRequestState(gcr, user, RequestState.NONE);
            });
        });
    }

    private generateGroupMessage(groupChangeRequest: GroupChangeRequest): string {
        switch (groupChangeRequest.mode) {
            case GroupUserChangeRequestMode.ADD_USER_GROUP:
                return `${groupChangeRequest.group} に以下のユーザーを追加`;
            case GroupUserChangeRequestMode.REMOVE_USER_GROUP:
                return `${groupChangeRequest.group} から以下のユーザーを削除`;
            default: return '';
        }
    }

    private applyRequestResult(src: Promise<any>, gcr: GroupChangeRequest, user: GroupMember): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            src.then(res => {
                this.setRequestState(gcr, user, RequestState.SUBMITTED);
                resolve(res);
            }).catch(res => {
                this.setRequestState(gcr, user, RequestState.ERROR);
                resolve(res);
            });
        });
    }

    close(): void {
        this.dialogRef.close(this.isRequested);
    }

    public save(): void {
        const promises: Promise<string>[] = [];
        this.groupChangeRequests.forEach(gcr => {
            gcr.users.forEach(user => {
                this.setRequestState(gcr, user, RequestState.REQUESTING);
                let promise: Promise<string>;
                switch (gcr.mode) {
                    case GroupUserChangeRequestMode.ADD_USER_GROUP:
                        promise = this.applyRequestResult(this.groupService.addUser(gcr.group, user.mail).toPromise(), gcr, user);
                        break;
                    case GroupUserChangeRequestMode.REMOVE_USER_GROUP:
                        promise = this.applyRequestResult(this.groupService.removeUser(gcr.group, user.mail).toPromise(), gcr, user);
                        break;
                }
                promises.push(promise);
            });
        });
        this.isRequested = true;
        Observable.forkJoin(promises).subscribe(result => {
            this.errorMessage = result.filter(msg => msg && msg.length > 0).join(', ');
            if (this.errorMessage.length > 0) {
                this.message = 'エラーが発生しました。お手数ですが時間をおいて再度実行してください';
            } else {
                this.message = '保存しました';
            }
        });
    }

    private getRequestStateString(gc: GroupChangeRequest, user: GroupMember): string {
        const state: RequestState = this.requestStatus[UpdateConfirmDialogComponent.generateKey(gc, user)];
        return UpdateConfirmDialogComponent.stateString(state);
    }

    private setRequestState(gc: GroupChangeRequest, user: GroupMember, state: RequestState): void {
        this.requestStatus[UpdateConfirmDialogComponent.generateKey(gc, user)] = state;
    }
}

enum RequestState {
    NONE, REQUESTING, SUBMITTED, REJECTED, ERROR
}
