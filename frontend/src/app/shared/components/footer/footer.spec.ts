import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el año actual', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('debería renderizar la marca MisEventos', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('MisEventos');
    expect(text).toContain('Conectando personas con experiencias memorables.');
  });

  it('debería renderizar las secciones principales del footer', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Enlaces');
    expect(text).toContain('Ambiente');
    expect(text).toContain('Créditos');
    expect(text).toContain('Desarrollo');
    expect(text).toContain('Diego Castillo');
  });

  it('debería mostrar el año actual en el copyright', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain(`© ${new Date().getFullYear()} MisEventos`);
  });
});