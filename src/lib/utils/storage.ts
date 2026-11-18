/*
 * Utility functions for localStorage operations.
 */
import { browser } from '$app/env';

export type UserAccount = {
	firstName: string;
	lastName: string;
	pinCode: string;
	country: Country;
	phone: string;
	email: string;
};

export type Country = {
	id: string;
	name: string;
};

export type Currency = {
	id: string;
	name: string;
	currencyName: string;
	symbol: string;
	cardBalance: number;
	cardNumber: string;
	cardCVV: string;
	cardExpDate: string;
};

/**
 * A single transaction.
 * `type` is 'debit' for income (money in) and 'credit' for expenses (money out).
 */
export type Transaction = {
	uid: string;
	name: string;
	date: string;
	amount: number;
	currency: string;
	type: 'debit' | 'credit';
};

export type UserData = {
	account: UserAccount;
	currencies: Currency[];
	transactions: Transaction[];
	isAuth?: boolean;
};

/**
 * Save user data to localStorage.
 */
export function saveUserData(data: UserData): void {
	if (!browser) return;
	localStorage.setItem('user', JSON.stringify(data));
}

/**
 * Get user data from localStorage.
 */
export function getUserData(): UserData | null {
	if (!browser) return null;
	const data = localStorage.getItem('user');
	return data ? JSON.parse(data) : null;
}

/**
 * Initialize localStorage with mock data for a new user.
 */
export async function initializeNewUser(): Promise<void> {
	if (!browser) return;
	const response = await fetch('/src/lib/mocks/new_user_setup.json');
	const mockData: UserData = await response.json();
	mockData.isAuth = false;
	saveUserData(mockData);
}

/**
 * Save pin code to localStorage.
 */
export function savePinCode(pinCode: string): void {
	if (!browser) return;
	const userData = getUserData() || {
		account: {} as UserAccount,
		currencies: [],
		transactions: []
	};
	userData.account.pinCode = pinCode;
	saveUserData(userData);
}

/**
 * Validate pin code against localStorage.
 */
export function validatePinCode(pinCode: string): boolean {
	if (!browser) return false;
	const userData = getUserData();
	return userData?.account?.pinCode === pinCode;
}

/**
 * Set authentication status in localStorage.
 */
export function setAuthStatus(isAuth: boolean): void {
	if (!browser) return;
	const userData = getUserData() || {
		account: {} as UserAccount,
		currencies: [],
		transactions: []
	};
	userData.isAuth = isAuth;
	saveUserData(userData);
}

/**
 * Get authentication status from localStorage.
 */
export function getAuthStatus(): boolean {
	if (!browser) return false;
	const userData = getUserData();
	return userData?.isAuth || false;
}

/**
 * Clear authentication status (sign out).
 */
export function clearAuthStatus(): void {
	if (!browser) return;
	setAuthStatus(false);
}
