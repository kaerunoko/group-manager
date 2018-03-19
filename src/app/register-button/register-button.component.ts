import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-register-button',
  templateUrl: './register-button.component.html',
  styleUrls: ['./register-button.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterButtonComponent implements OnInit {
  @Input()
  isRegistered: boolean;

  @Output()
  isRegisteredChange = new EventEmitter<boolean>();

  @Input()
  mail: string;

  @Input()
  addFunction: (mail: string) => Observable<boolean>;

  @Input()
  removeFunction: (mail: string) => Observable<boolean>;

  isRegistering: boolean;

  message: string;

  errorMessage: string;

  constructor() { }

  ngOnInit() {
  }

  register(func: (string) => Observable<boolean>) {
    this.isRegistering = true;
    this.errorMessage = '';
    this.message = '';
    func(this.mail)
    .subscribe(res => {
        this.isRegistering = false;
      }, reason => {
        this.errorMessage = reason;
        this.isRegistering = false;
      });
  }

  add(): void {
    this.register(this.addFunction);
  }

  remove(): void {
    this.register(this.removeFunction);
  }
}

