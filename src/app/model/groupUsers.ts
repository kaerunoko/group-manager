export class GroupMembers {
    private _groupMail: string;
    private _users: GroupMember[];
    constructor(groupMail: string) {
        this._groupMail = groupMail;
        this._users = [];
    }
    get mail(): string {
        return this._groupMail;
    }
    get members(): GroupMember[] {
        return this._users;
    }
    set members(users: GroupMember[]) {
        this._users = users;
    }
}

/**
 * 将来的にはステータスとか役割とかも…
 */
export class GroupMember {
    private _mail: string;
    constructor(mail: string) {
        this._mail = mail;
    }
    get mail(): string {
        return this._mail;
    }
}
