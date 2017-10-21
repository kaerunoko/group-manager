export class User {
    private _id: number;
    private _mail: string;
    private _name: string;
    constructor(id: number, mail: string, name: string) {
        this._id = id;
        this._mail = mail;
        this._name = name;
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
}
