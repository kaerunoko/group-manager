import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AdminService } from '../service/admin.service';
import { GroupService } from '../service/group.service';
import { UserService } from '../service/user.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css', '../editor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit {
  accounts: Account[] = [];

  constructor(private adminService: AdminService,
    private groupService: GroupService, private userService: UserService) { }

  ngOnInit() {
    Observable.forkJoin(
      this.adminService.getAccounts(),
      this.groupService.getGroupUsers(environment.adminGroup),
      this.userService.getUserList()
    ).subscribe(results => {
      const accounts = results[0];
      const adminGroupMembers = results[1];
      const users = results[2];
      this.accounts = accounts.map(account => {
        const user = users.find(u => u.mail === account.mail);
        return {
          name: `${account.lastName} ${account.firstName}`,
          accountId: account.id,
          id: user ? user.id : -1,
          mail: account.mail,
          isAccountAdmin: account.isAdmin,
          isGroupAdmin: account.org === '/名簿管理チーム',
          isAdminGroupMember: adminGroupMembers.members.findIndex(mem => mem.mail === account.mail) >= 0,
          isSuspended: false
        };
      });
    });
  }

  createAccount(primaryEmail: string, mail: string, firstName: string, lastName: string): Observable<boolean> {
    const password = 'password';
    return this.adminService.createAccount(primaryEmail, password, mail, firstName, lastName);
  }

  expireAccount(mail: string): Observable<boolean> {
    return this.adminService.suspendAccount(mail);
  }

  addAdminGroupMember(mail: string): Observable<boolean> {
    return this.groupService.addUser(environment.adminGroup, mail);
  }

  removeAdminGroupMember(mail: string): Observable<boolean> {
    return this.groupService.removeUser(environment.adminGroup, mail)
      .map(result => {
        if (result) {
          this.accounts.find(account => account.mail === mail).isAdminGroupMember = false;
        }
        return result;
      });
  }

  addGroupAdmin(mail: string): Observable<boolean> {
    return this.adminService.addGroupAdmin(mail);
  }

  removeGroupAdmin(mail: string): Observable<boolean> {
    return this.adminService.removeGroupAdmin(mail);
  }

  addAccountAdmin(mail: string): Observable<boolean> {
    return this.adminService.addAccountAdmin(mail)
      .map(result => {
        if (result) {
          this.accounts.find(account => account.mail === mail).isAccountAdmin = true;
        }
        return result;
      });
  }

  removeAccountAdmin(mail: string): Observable<boolean> {
    return this.adminService.removeAccountAdmin(mail)
      .map(result => {
        if (result) {
          this.accounts.find(account => account.mail === mail).isAccountAdmin = false;
        }
        return result;
      });
  }

}

interface Account {
  name: string;
  accountId: string;
  id: number;
  mail: string;
  isAccountAdmin: boolean;
  isGroupAdmin: boolean;
  isAdminGroupMember: boolean;
  isSuspended: boolean;
}
