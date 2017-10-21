import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Group } from './../model/group'
import { GroupUsers, GroupUser } from './../model/groupUsers'
import { GoogleApiService } from "./gapi.service";

@Injectable()
export class GroupService {
    constructor(private gapiService: GoogleApiService) {
    }

    public getGroups(): Observable<Group[]> {
        return this.gapiService.callScriptFunction("getGroups", null).map(res => res);
    }

    public getGroupUsers(groupEmail: string): Observable<GroupUsers> {
        return this.gapiService.callScriptFunction("getGroupUsers", groupEmail).map(res => {
            let groupUsers = new GroupUsers(groupEmail);
            groupUsers.users = res ? res.map(user => new GroupUser(user.email)) : [];
            return groupUsers;
        });
    }

    public removeUser(groupEmail: string, userEmail: string): Promise<string> {
        return this.gapiService.callScriptFunction("removeUser", [groupEmail, userEmail])
        .first().toPromise();
    }

    public addUser(groupEmail: string, userEmail: string): Promise<string> {
        return this.gapiService.callScriptFunction("addUser", [groupEmail, userEmail])
        .first().toPromise();
    }
}
