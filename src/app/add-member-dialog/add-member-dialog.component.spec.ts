import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberDialogComponent } from './add-member-dialog.component';

describe('AddMemberDialogComponent', () => {
  let component: AddMemberDialogComponent;
  let fixture: ComponentFixture<AddMemberDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMemberDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
