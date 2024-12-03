import { createCache } from 'cache-manager';
import { z } from "zod";
import { Exception } from './Exception.js';

export type RequestDepositQuoteInput = {
	currencyToPay: string;
	currencyToBuy: string;
	amountToPay?: number;
	amountToBuy?: number;
	taxId?: string;
	taxIdCountry?: string;
};

export type CreateSwapOrderInput = {
	quoteId?: string;
	quoteRequest?: {
		side: "Buy" | "Sell";
		quoteAmount: number;
		baseCurrency: number;
		baseAmount: string;
		quoteCurrency: string;
	};
	taxId?: string;
	name?: string;
	email?: string | null;
	taxIdCountry?: string;
	cryptoWithdrawalInformation?: {
		key: string;
		blockchain: string;
	};
	fiatWithdrawalInformation?: {
		key: string;
	};
	externalId?: {
		smartWalletAddress: string;
	};
	depositBlockchain?: string;
};

export type CreateSwapOrderOutput = {
	id: string;
	currency: string;
	depositAmount: number;
	blockchain: string;
	referenceId: string;
	depositAddress: string;
	base64QRCode: string;
	expireAt: string;
};

export type Quote = {
	quoteId: string;
	price: number;
	expireAt: string;
};

export type SwapOrder = {
	id: string;
	referenceId: string;
	externalId: {
		env: string;
		smartWalletAddress: string;
	};
	status: string;
	from: {
		currency: string;
		amount: number;
	};
	to: {
		currency: string;
		amount: number;
	};
};

const cache = createCache()

export class TransferoClient {
	baseURL = "https://openbanking.bit.one";

	async #getAccessToken() {
		const cachedToken = await cache.get<string>(
			"transfero_access_token",
		);

		if (cachedToken) {
			return cachedToken;
		}

		const response = await fetch(`${this.baseURL}/auth/token`, {
			method: "POST",
			body: new URLSearchParams({
				grant_type: "client_credentials",
				scope: process.env.TRANSFERO_SCOPE,
				client_id: process.env.TRANSFERO_CLIENT_ID,
				client_secret: process.env.TRANSFERO_CLIENT_SECRET,
			}),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		if (!response.ok) {
			throw new Exception(
				"Não foi possível obter as credenciais da Transfero.",
				"TRANSFERO_CREDENTIALS_ERROR",
			);
		}

		const { access_token, expires_in } = (await response.json()) as {
			access_token: string;
			expires_in: number;
		};

		await cache.set(
			"transfero_access_token",
			access_token,
			(expires_in - 120) * 1000, // 120 seconds before expiration
		);
		return access_token;
	}

	async getAccountsIds() {
		const response = await fetch(`${this.baseURL}/api/v1/accounts`, {
			headers: {
				Authorization: `Bearer ${await this.#getAccessToken()}`,
			},
		});

		if (!response.ok) {
			throw new Error("Não foi possível obter as contas da Transfero.");
		}

		const { accountIds } = z.object({
			accountIds: z.array(z.string())
		})
			.parse(await response.json());

		return accountIds
	}

	async getAllAccountBalances() {
		const accountsIds = await this.getAccountsIds();

		return await Promise.all(
			accountsIds.map(async (accountId) => {
				const response = await fetch(
					`${this.baseURL}/api/v1/accounts/${accountId}/balance`,
					{
						headers: {
							Authorization: `Bearer ${await this.#getAccessToken()}`,
						}
					}
				);

				if (!response.ok) {
					throw new Error("Não foi possível obter o saldo da conta da Transfero.");
				}

				return z.object({
                    balance: z.object({
                        amount: z.number(),
                        currency: z.string()
                    })
				}).parse(await response.json());
			}),
		);
	}
}