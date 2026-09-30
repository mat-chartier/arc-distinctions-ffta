import { buildContinueUrl, safeContinueUrl } from './continue-url';

describe('continue-url — buildContinueUrl', () => {
  it('pointe vers la page de connexion du site émetteur', () => {
    expect(buildContinueUrl('https://1cie-grenoble.distinctarc.fr')).toBe('https://1cie-grenoble.distinctarc.fr/login');
    expect(buildContinueUrl('http://localhost:4200')).toBe('http://localhost:4200/login');
  });
});

describe('continue-url — safeContinueUrl', () => {
  const origin = 'https://app.distinctarc.fr';

  it('accepte distinctarc.fr et ses sous-domaines en https', () => {
    expect(safeContinueUrl('https://1cie-grenoble.distinctarc.fr/login', origin)).toBe(
      'https://1cie-grenoble.distinctarc.fr/login'
    );
    expect(safeContinueUrl('https://distinctarc.fr/club/login', origin)).toBe('https://distinctarc.fr/club/login');
  });

  it('accepte le même origin que la page, quel que soit le domaine', () => {
    expect(safeContinueUrl('http://localhost:4200/login', 'http://localhost:4200')).toBe('http://localhost:4200/login');
    expect(safeContinueUrl('https://arc-distinctions.web.app/login', 'https://arc-distinctions.web.app')).toBe(
      'https://arc-distinctions.web.app/login'
    );
  });

  it('refuse les domaines étrangers ou imitant distinctarc.fr', () => {
    expect(safeContinueUrl('https://evil.com/login', origin)).toBeNull();
    expect(safeContinueUrl('https://distinctarc.fr.evil.com/login', origin)).toBeNull();
    expect(safeContinueUrl('https://evildistinctarc.fr/login', origin)).toBeNull();
  });

  it('refuse http, les schémas non web et les valeurs invalides', () => {
    expect(safeContinueUrl('http://1cie-grenoble.distinctarc.fr/login', origin)).toBeNull();
    expect(safeContinueUrl('javascript:alert(1)', origin)).toBeNull();
    expect(safeContinueUrl('/login', origin)).toBeNull();
    expect(safeContinueUrl('', origin)).toBeNull();
    expect(safeContinueUrl(null, origin)).toBeNull();
  });
});
