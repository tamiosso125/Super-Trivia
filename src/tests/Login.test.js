import React from 'react';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import renderWithRouterAndRedux from './helpers/renderWithRouterAndRedux';
import App from '../App'
import userEvent from '@testing-library/user-event';

describe('Verifica o comportamento da aplicação ao realizar o Login', () => {
  it('avalia a renderização do componente Login', () => {
    renderWithRouterAndRedux(<App />, {}, '/');

    const img = screen.getByRole('img', { name: /logo/i });
    expect(img).toBeInTheDocument();

    const nameInput = screen.getByTestId('input-player-name');
    const emailInput = screen.getByTestId('input-gravatar-email');
    const buttonPlay = screen.getByTestId('btn-play');
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(buttonPlay).toBeInTheDocument();
    expect(buttonPlay).toBeDisabled();

    userEvent.type(nameInput, 'Meu Nome');
    expect(buttonPlay).toBeDisabled();

    userEvent.type(nameInput, 'Meu Nome');
    userEvent.type(emailInput, 'meu-email-errado-teste.com');
    expect(buttonPlay).toBeDisabled();

    userEvent.type(nameInput, 'Meu Nome');
    userEvent.type(emailInput, 'meu-email@teste.com');
    expect(buttonPlay).toBeEnabled();
  });

  it('avalia a requisição da api e o armazenamento no localStorage', async () => {
    const { history } = renderWithRouterAndRedux(<App />, {}, '/');

    const token = {
      response_code: 0,
      response_message: "Token Generated Successfully!",
      token: "7dc183f87c5f2704465b0e14e2f1657c2afdb6b4336b760fcd5ba0ba2428223c",
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(token)
    });

    const nameInput = screen.getByTestId('input-player-name');
    const emailInput = screen.getByTestId('input-gravatar-email');
    const buttonPlay = screen.getByTestId('btn-play');
    userEvent.type(nameInput, 'Meu Nome');
    userEvent.type(emailInput, 'meu-email@teste.com');
    userEvent.click(buttonPlay);

    expect(global.fetch).toBeCalledTimes(1);

    await waitForElementToBeRemoved(() => screen.getByRole('img', { name: /logo/i }));

    const { location: { pathname } } = history;
    expect(pathname).toBe('/game');

    const localStorageItem = localStorage.getItem('token');
    expect(localStorageItem).toBe(token.token);
  });

  it('avalia a navegação para a página Setting', () => {
    const { history } = renderWithRouterAndRedux(<App />, {}, '/');

    const buttonSetting = screen.getByTestId('btn-settings');
    userEvent.click(buttonSetting);

    const settingTitle = screen.getByTestId('settings-title');
    expect(settingTitle).toBeInTheDocument();

    const { location: { pathname } } = history;
    expect(pathname).toBe('/settings');
  });
});
