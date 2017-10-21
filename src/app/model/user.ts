export class User{
    private _mail: string;
    private _name: string;
    constructor(mail: string, name: string){
        this._mail = mail;
        this._name = name;
    }
    get mail(): string{
        return this._mail;
    }
    get name(): string{
        return this._name;
    }
}