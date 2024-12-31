import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedComponent } from './published.component';

describe('PublishedComponent', () => {
  let component: PublishedComponent;
  let fixture: ComponentFixture<PublishedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
