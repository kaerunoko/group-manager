import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import { MatSnackBar } from '@angular/material';

import { User } from './../model/user';
import { UserService } from '../service/user.service';
import { MailUtil } from '../utils/mailutil';

@Component({
  selector: 'app-add-member-input',
  templateUrl: './add-member-input.component.html',
  styleUrls: ['./add-member-input.component.scss']
})
export class AddMemberInputComponent implements OnInit {
  filteredMails: Observable<User[]>;
  filteredUsers: Observable<User[]>;
  mailControl: FormControl;
  userControl: FormControl;
  selectedUser: User;
  private mailsCache: User[];
  private usersCache: User[];

  @Output()
  public onSubmit: EventEmitter<User> = new EventEmitter<User>();

  @Input()
  public existingMails: string[];

  isAddMode(): boolean {
    return typeof this.mailControl.value === 'string' && this.mailControl.value.length > 0;
  }

  private onInputChange(inputValue: string | User): string {
    this.userControl.disable();

    // when select options
    if (typeof inputValue === 'object') {
      this.selectedUser = inputValue;
      return inputValue ? inputValue.mail : '';
    }

    // when typing
    if (inputValue.length === 0) {
      return inputValue;
    }

    const user = this.mailsCache.find(m => m.mail === inputValue);
    if (user) {
      this.selectedUser = user;
      this.mailControl.setValue(user);
    } else {
      this.selectedUser = null;
      this.userControl.enable();
    }
    return inputValue;
  }

  private onUserChange(inputValue: string | User): string {
    this.selectedUser = null;
    if (typeof inputValue === 'string') {
      return inputValue;
    } else {
      this.selectedUser = inputValue;
      return this.displayIdAndName();
    }
  }

  private filterMails(inputValue: string): User[] {
    return this.mailsCache
      .filter(mail => (mail.mail || '').indexOf(inputValue) > -1)
      .slice(0, 5);
  }

  private filterUsers(inputValue: string): User[] {
    return this.usersCache
      .filter(user => user !== null)
      .filter(user => user.id.toString().startsWith(inputValue) || user.name.includes(inputValue));
  }

  private primaryCandidateMails(): User[] {
    return this.mailsCache
      .filter(user => !this.isMember(user))
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }

  private primaryCandidateUsers(): User[] {
    return this.usersCache
      .filter(user => !user.mail)
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }

  constructor(private userService: UserService, public snackBar: MatSnackBar) {
    this.mailControl = new FormControl('', [Validators.required, (c) => {
      if (c.value && (typeof c.value === 'string') && !MailUtil.isValid(c.value)) {
        return { 'email': true };
      }
    }]);
    this.userControl = new FormControl();
  }

  getEmailErrorMessage(): string {
    return this.mailControl.hasError('required') ? 'MLに追加するメールアドレスを入力してください' :
      this.mailControl.hasError('email') ? 'メールアドレスの形式が正しくありません' :
        '';
  }

  ngOnInit() {
    if (this.existingMails === undefined || this.existingMails === null) {
      this.existingMails = [];
    }

    this.userService.getUserList().toPromise().then(users => {
      this.initCache(users);
      this.filteredMails = this.mailControl.valueChanges
        .startWith('')
        .map(inputValue => this.onInputChange(inputValue))
        .map(inputValue => inputValue ? this.filterMails(inputValue) : this.primaryCandidateMails());

      this.filteredUsers = this.userControl.valueChanges
        .startWith('')
        .map(inputValue => this.onUserChange(inputValue))
        .map(inputValue => inputValue ? this.filterUsers(inputValue) : this.primaryCandidateUsers());
    });
  }

  private initCache(users: User[]): void {
    this.mailsCache = users
      .filter(user => !!user.mail);
    this.usersCache = users.filter((x, i, self) => self.map(u => u.id).indexOf(x.id) === i);
  }

  displayMail(user?: User): string {
    return user ? user.mail : '';
  }

  displayIdAndName(): string {
    const value: (User | null) = this.selectedUser;
    return value ? `${value.id} ${value.name}` : '';
  }

  canSubmit(): boolean {
    if (!this.mailControl.value) {
      return false;
    }
    if (!this.mailControl.valid) {
      return false;
    }
    if (!this.selectedUser) {
      return false;
    }
    return true;
  }

  private clear(): void {
    this.mailControl.setValue(null);
    this.selectedUser = null;
  }

  submit(): void {
    this.addMail()
      .then((user) => {
        this.onSubmit.emit(user);
        this.clear();
      })
      .catch((reason) => this.openSnackBar(reason));
  }

  private addMail(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      console.log(this.selectedUser);
      if (!this.isAddMode()) {
        resolve(this.selectedUser);
        return;
      }
      // register new mail
      if (!MailUtil.isValid(this.mailControl.value)) {
        // ここには来ないはず
        reject('メールアドレスが不正です');
        return;
      }
      this.openSnackBar('処理中...');
      this.userService
        .addUserMail(this.selectedUser.id, this.mailControl.value)
        .toPromise()
        .then(() => {
          this.snackBar.dismiss();
          this.userService.getUserList(true).subscribe(users => this.initCache(users), reject);
          resolve(new User(this.selectedUser.id, this.mailControl.value, this.selectedUser.name));
        })
        .catch(reject);
    });
  }

  isMember(user: User): boolean {
    return this.existingMails.includes(user.mail);
  }

  private openSnackBar(message: string, action?: string) {
    this.snackBar.open(message, action ? action : 'OK', {
      duration: 8000,
    });
  }
}
