import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendMock = vi.hoisted(() => vi.fn());
vi.mock('@emailjs/browser', () => ({
  default: { send: sendMock },
}));

const toastErrorMock = vi.hoisted(() => vi.fn());
vi.mock('sonner', () => ({
  toast: { error: toastErrorMock },
}));

import { useEmailForm, type FormData } from './useEmailForm';

const validData: FormData = {
  nom: 'Kabiche',
  prenom: 'Alexis',
  email: 'test@example.com',
  objet: 'Sujet',
  message: 'Bonjour !',
};

describe('useEmailForm', () => {
  beforeEach(() => {
    sendMock.mockReset();
    toastErrorMock.mockReset();
  });

  it('signale les champs manquants sans rien envoyer', async () => {
    const { result } = renderHook(() => useEmailForm());

    let ok = true;
    await act(async () => {
      ok = await result.current.submitForm({ ...validData, email: '' });
    });

    expect(ok).toBe(false);
    expect(result.current.errors.email).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('ignore silencieusement les soumissions de bots (honeypot rempli)', async () => {
    const { result } = renderHook(() => useEmailForm());

    let ok = false;
    await act(async () => {
      ok = await result.current.submitForm(validData, 'https://spam.example');
    });

    expect(ok).toBe(true);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("affiche une erreur visible et retourne false quand l'envoi échoue", async () => {
    sendMock.mockRejectedValueOnce(new Error('network down'));
    const { result } = renderHook(() => useEmailForm());

    let ok = true;
    await act(async () => {
      ok = await result.current.submitForm(validData);
    });

    expect(ok).toBe(false);
    expect(toastErrorMock).toHaveBeenCalledTimes(1);
  });

  it('ouvre la popup de succès après un envoi réussi', async () => {
    sendMock.mockResolvedValueOnce({ status: 200, text: 'OK' });
    const { result } = renderHook(() => useEmailForm());

    await act(async () => {
      await result.current.submitForm(validData);
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(result.current.showSuccessPopup).toBe(true);
    expect(toastErrorMock).not.toHaveBeenCalled();
  });
});
