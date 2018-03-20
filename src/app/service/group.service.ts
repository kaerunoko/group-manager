import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Group } from './../model/group';
import { GroupMembers, GroupMember } from './../model/groupUsers';
import { GoogleApiService } from './gapi.service';

@Injectable()
export class GroupService {
    constructor(private gapiService: GoogleApiService) {
    }

    public getGroups(): Observable<Group[]> {
        return this.gapiService.callScriptFunction('getGroups', null).map(res => res);
    }

    public getGroupUsers(groupEmail: string): Observable<GroupMembers> {
        return this.gapiService.callScriptFunction('getGroupMembers', groupEmail).map(res => {
            const groupUsers = new GroupMembers(groupEmail);
            groupUsers.members = res ? res.map(user => new GroupMember(user.email)) : [];
            return groupUsers;
        });
    }

    public removeUser(groupEmail: string, userEmail: string): Observable<boolean> {
        return this.gapiService.callScriptFunction('removeMember', [groupEmail, userEmail]);
    }

    public addUser(groupEmail: string, userEmail: string): Observable<boolean> {
        return this.gapiService.callScriptFunction('addMember', [groupEmail, userEmail]);
    }
}
