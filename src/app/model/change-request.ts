import { GroupUser } from "./groupUsers";

/**
 * 各エディタからの変更リクエスト
 * グループへのユーザー追加・削除
 */
export class GroupChangeRequest{
    constructor(private _mode: GroupUserChangeRequestMode, private _group: string, private _users: GroupUser[]){
    }

    get mode(): GroupUserChangeRequestMode{
        return this._mode;
    }

    get group(): string{
        return this._group;
    }

    get users(): GroupUser[]{
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