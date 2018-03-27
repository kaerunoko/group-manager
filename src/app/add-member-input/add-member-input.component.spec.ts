import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberInputComponent } from './add-member-input.component';

describe('AddMemberInputComponent', () => {
  let component: AddMemberInputComponent;
  let fixture: ComponentFixture<AddMemberInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMemberInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMemberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
