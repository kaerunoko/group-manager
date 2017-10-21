import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { MdInputModule } from "@angular/material";

import { Group } from '../../model/group'

import { GroupService } from '../../service/group.service';
import { UserService } from '../../service/user.service';
import { GroupChangeRequest, GroupUserChangeRequestMode } from "../../model/change-request";

@Component({
    templateUrl: './bulk.component.html',
    selector: 'bulk-editor'
})
export class BulkEditor implements OnInit {
    @Output()
    change: EventEmitter<GroupChangeRequest[]>;

    private message = ""

    private selectPlaceholder = "読み込み中..."

    private mode: string;

    private groups: Group[];

    private mailLines: string;

    private target: string;

    constructor(private groupService: GroupService, private userService: UserService) {
    }

    ngOnInit(): void {
        this.groupService.getGroups().subscribe(groups => {
            this.groups = groups;
            this.selectPlaceholder = "選択してください";
        });
    }

    save(): void {
        this.message = "解析中..."

        this.trySave().then(this.checkUserList.bind(this))//.catch(console.error)
            .then(val => {
                console.log("????")
                console.log(val);
            }).catch(console.error);
    }

    private trySave(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if (!this.mode || !this.mailLines || !this.target) {
                reject("すべての項目を入力してください");
            }
            try {
                const mails = BulkEditor.parse(this.mailLines);
                resolve(mails)
            } catch (msg) {
                reject(msg.message);
            }
        });
    }

    private checkUserList(mails: string[]): Promise<string[]> {
        console.log(mails)
        return new Promise<string[]>((resolve, reject) => {
            this.userService.getUserList()
                .toPromise()
                .then(currentUsers => {
                    const undefinedMails = mails.filter(mail => !currentUsers.find(user => user.mail === mail));
                    if (undefinedMails.length > 0) {
                        resolve(undefinedMails);
                    }
                    resolve(["全部あった"]);
                })
                .catch(() => {
                    reject(["見つからなかった"]);
                })

        })
    }

    /**
     * return email list
     * with simple validate
     * @param src 
     * @throws error
     */
    private static parse(src: string): string[] {
        if (src === null || src === '') {
            return []
        }
        let lines = src.split("\n")
            .map(line => line.trim().toLowerCase())
            .filter(line => line !== "")

        let errors = [];
        const mailReg = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
        lines.forEach(line => {
            if (!line.match(mailReg)) {
                errors.push(line);
            }
        })
        if (errors.length > 0) {
            throw new Error("不正なメールアドレスです: " + errors.join(", "))
        }

        return lines;
    }

}