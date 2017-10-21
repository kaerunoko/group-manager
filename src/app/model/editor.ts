import { GroupMember } from './groupUsers';

export interface ChangeEvent {
    data: GroupChangeRequest[];
    resolve?: (any) => void;
    reject?: (reason: string) => void;
}

/**
 * 各エディタからの変更リクエスト
 * グループへのユーザー追加・削除
 */
export class GroupChangeRequest {
    constructor(private _mode: GroupUserChangeRequestMode, private _group: string, private _users: GroupMember[]) {
    }

    get mode(): GroupUserChangeRequestMode {
        return this._mode;
    }

    get group(): string {
        return this._group;
    }

    get users(): GroupMember[] {
        return this._users;
    }
}

export enum GroupUserChangeRequestMode {
    // CHANGE_USER_STATE, // オーナーとか無効とか
    ADD_USER_GROUP,
    REMOVE_USER_GROUP
}

/**
 * グループ追加とか
 */

/**
 * ユーザー登録（氏名＋メアド）とか
 */

/**
 * comparator
 */
export function compareString(a: string, b: string): number {
    if (a === null || a === undefined) {
        return (b === null || b === undefined) ? 0 : -1;
    }
    if (b == null || b === undefined) {
        return 1;
    }
    const a_ = a.toUpperCase();
    const b_ = b.toUpperCase();
    if (a_ < b_) {
        return -1;
    }
    if (b_ < a_) {
        return 1;
    }
    return 0;
}
