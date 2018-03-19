import { Injectable } from '@angular/core';
import { GoogleApiService } from './gapi.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AdminService {

  private cache: GoogleAccount[] = null;

  constructor(private gapiService: GoogleApiService) {
  }

  /**
   * Get the all account in the domain
   */
  getAccounts(reload?: boolean): Observable<GoogleAccount[]> {
    if (reload || this.cache === null) {
      return this.gapiService.callScriptFunction('getAccounts', {x: 'X', y: 'Y'}).map(result => {
        this.cache = result.map(record => {
          const ga: GoogleAccount = {
            id: record.id,
            mail: record.mail,
            firstName: record.firstName,
            lastName: record.lastName,
            isSuspended: record.isSuspended,
            isAdmin: record.isAdmin,
            org: record.org
          };
          return ga;
        });
        return this.cache;
      });
    }
    return Observable.of(this.cache);
  }

  /**
   * Create a new account
   * @param primaryEmail account_name@your_domain
   * @param password
   * @param mail existing email for contact (this will be used for resetting password)
   * @param firstName
   * @param lastName
   */
  createAccount(primaryEmail: string, password: string, mail: string, firstName: string, lastName: string): Observable<boolean> {
    return this.gapiService.callScriptFunction('createAccount', [primaryEmail, password, mail, firstName, lastName]);
  }

  /**
   * Suspend the account (soft delete). If you want to delete it completely, please use Google admin console.
   * @param mail account_name@your_domain
   */
  suspendAccount(mail: string): Observable<boolean> {
    return this.gapiService.callScriptFunction('suspendAccount', mail);
  }

  addGroupAdmin(mail: string): Observable<boolean> {
    return this.gapiService.callScriptFunction('addGroupAdmin', mail);
  }

  removeGroupAdmin(mail: string): Observable<boolean> {
    return this.gapiService.callScriptFunction('removeGroupAdmin', mail);
  }

  addAccountAdmin(mail: string): Observable<boolean> {
    return this.gapiService.callScriptFunction('addAccountAdmin', mail);
  }

  removeAccountAdmin(mail: string): Observable<boolean> {
    return this.gapiService.callScriptFunction('removeAccountAdmin', mail);
  }
}

export interface GoogleAccount {
  id: string;
  mail: string;
  firstName: string;
  lastName: string;
  isSuspended: boolean;
  isAdmin: boolean;
  org: string;
}
