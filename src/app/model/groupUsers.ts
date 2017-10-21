export class GroupUsers{
    private _groupMail: string;
    private _users: GroupUser[];
    constructor(groupMail: string){
        this._groupMail = groupMail;
        this._users = [];
    }
    get mail(): string{
        return this._groupMail;
    }
    get users(): GroupUser[]{
        return this._users;
    }
    set users(users: GroupUser[]){
        this._users = users;
    }
}

/**
 * 将来的にはステータスとか役割とかも…
 */
export class GroupUser{
    private _mail: string;
    constructor(mail: string){
        this._mail = mail;
    }
    get mail(): string{
        return this._mail;
    }
}