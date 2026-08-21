import { expect, it } from 'vitest';
import {
  expertisesEn,
  expertisesFr,
  getAproposContent,
  principlesEn,
  principlesFr,
  rechercheEn,
  rechercheFr,
} from './APropos.content';

it('parité FR/EN : 5 expertises, 4 principes, 3 recherche', () => {
  expect(expertisesFr).toHaveLength(5);
  expect(expertisesEn).toHaveLength(5);
  expect(principlesFr).toHaveLength(4);
  expect(principlesEn).toHaveLength(4);
  expect(rechercheFr).toHaveLength(3);
  expect(rechercheEn).toHaveLength(3);
});

it('recherche condensé = Impact / Collaboration / Maturité', () => {
  expect(rechercheFr.map((r) => r.title)).toEqual([
    'Impact plutôt que production',
    'Collaboration réelle',
    'Maturité design',
  ]);
});

it('getAproposContent renvoie la langue demandée', () => {
  expect(getAproposContent('fr').strings.accroche).toMatch(/sans moi/);
  expect(getAproposContent('en').strings.accroche).toMatch(/without me/);
  expect(getAproposContent('en').recherche.map((r) => r.title)).toEqual([
    'Impact over output',
    'Real collaboration',
    'Design maturity',
  ]);
});
