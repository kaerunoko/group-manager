import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatCheckboxChange } from '@angular/material';
import { UserService } from '../service/user.service';
import { GroupService } from '../service/group.service';
import { FormControl } from '@angular/forms';
import { User } from './../model/user';
import { Observable } from 'rxjs/Observable';
import { MailUtil } from '../utils/mailutil';

@Component({
  selector: 'app-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.css']
})
export class AddMemberDialogComponent implements OnInit {
  userControl: FormControl;
  filteredNames: Observable<Name[]>;
  private usersCache: User[];
  private names: Name[];
  selectedName: Name;
  private selectedMails: Set<string> = new Set();
  private addNewMail = false;
  private newMail: string;
  message: string;

  private existingMails: string[];

  constructor(
    public dialogRef: MatDialogRef<AddMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private groupService: GroupService) {
    this.userControl = new FormControl();
    this.initStatus();
    this.existingMails = data.memberMails;
    this.userService.getUserList().toPromise().then(users => {
      this.usersCache = users;
      this.names = users.filter((x, i, self) => self.indexOf(x) === i).map(user => new Name(user));

      this.filteredNames = this.userControl.valueChanges
        .startWith(null)
        .map(inputValue => this.onInputChange(inputValue))
        .map(inputValue => inputValue ? this.filterNames(inputValue) : this.primaryCandidate());
    });
  }

  private initStatus() {
    this.selectedName = null;
    this.selectedMails.clear();
    this.addNewMail = false;
    this.newMail = '';
    this.message = '';
  }

  private filterNames(inputValue: string): Name[] {
    return this.usersCache
      .filter(user => (user.name + user.mail + user.id.toString()).indexOf(inputValue) > -1)
      .filter((x, i, self) => self.findIndex(val => val.id === x.id) === i)
      .map(user => new Name(user));
  }

  private getSelectedUserMails(): string[] {
    if (!this.selectedName) {
      return [];
    }
    return this.usersCache
      .filter(user => user.id === this.selectedName.id)
      .map(user => user.mail)
      .filter(mail => !!mail);
  }

  private primaryCandidate(): Name[] {
    return this.usersCache
    .filter(user => !user.mail)
    .sort((a, b) => b.id - a.id)
    .map(user => new Name(user));
  }

  ngOnInit() {
  }

  private onInputChange(inputValue: string): string {
    if (!inputValue) {
      this.initStatus();
    } else {
      const selectedUser = this.usersCache.find(user => user.id === Number(inputValue));
      if (selectedUser) {
        this.selectedName = new Name(selectedUser);
      }
      this.addNewMail = this.addNewMail || (this.selectedName && this.getSelectedUserMails().length === 0);
    }
    return inputValue;
  }

  private onMailSelect(mail: string, event: MatCheckboxChange) {
    if (event.checked) {
      this.selectedMails.add(mail);
    } else {
      this.selectedMails.delete(mail);
    }
  }

  isValid(): boolean {
    return this.selectedName && (
      (this.selectedMails.size > 0 && !this.addNewMail)
      ||
      (this.addNewMail && MailUtil.isValid(this.newMail))
    );
  }

  save(): void {
    this.addMail()
      .then(() => {
        const mails: string[] = Array.from(this.selectedMails);
        if (this.addNewMail) {
          mails.push(this.newMail);
        }
        this.dialogRef.close({'id': this.selectedName.id, 'mails': mails});
      })
      .catch(msg => {
        this.message = msg;
      });
  }

  private addMail(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.addNewMail) {
        resolve();
        return;
      }
      if (!MailUtil.isValid(this.newMail)) {
        // ここには来ないはず
        reject('メールアドレスが不正です');
        return;
      }
      this.userService
        .addUserMail(this.selectedName.id, this.newMail)
        .toPromise()
        .then(resolve)
        .catch(reject);
    });
  }
}

class Name {
  private _name: string;
  private _id: number;
  constructor(user: User) {
    this._name = user.name;
    this._id = user.id;
  }
  get name(): string {
    return this._name;
  }
  get id(): number {
    return this._id;
  }
}
