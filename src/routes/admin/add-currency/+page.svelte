<script lang="ts">
	import type { Currency, Transaction } from '#lib/utils/storage.ts';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	// State for available and existing currencies
	let availableCurrencies: Currency[] = $state([]);
	let existingCurrencies = $state([]);

	// Mock transactions used to seed a newly added currency
	let mockTransactions: Transaction[] = $state([]);

	// Fetch available currencies and mock transactions from mock data
	onMount(async () => {
		const response = await fetch('/src/lib/mocks/currencies.json');
		const currencies = await response.json<Currency[]>();
		availableCurrencies = currencies;

		const mockResponse = await fetch('/src/lib/mocks/new_user_setup.json');
		const mockData = await mockResponse.json<{ transactions: Transaction[] }>();
		mockTransactions = mockData.transactions;
	});

	// Fetch existing currencies from localStorage
	onMount(() => {
		const userData = localStorage.getItem('user');
		if (userData) {
			const parsedData = JSON.parse(userData);
			existingCurrencies = parsedData.currencies || [];
		}
	});

	// Filter available currencies to exclude existing ones
	let filteredCurrencies = $derived(
		availableCurrencies.filter(
			(currency) => !existingCurrencies.some((existing: Currency) => existing.id === currency.id)
		)
	);

	// Add a new currency to localStorage
	const addCurrency = (currency: Currency) => {
		const userData = localStorage.getItem('user');
		if (userData) {
			const parsedData = JSON.parse(userData);
			parsedData.currencies = parsedData.currencies || [];
			parsedData.transactions = parsedData.transactions || [];

			parsedData.currencies.push({
				...currency
			});

			// Populate mock transactions for the new currency
			const clonedTransactions: Transaction[] = mockTransactions.map((transaction, index) => ({
				...transaction,
				uid: `txn_${Date.now()}_${index}`,
				currency: currency.id
			}));
			parsedData.transactions.push(...clonedTransactions);

			localStorage.setItem('user', JSON.stringify(parsedData));
			goto(resolve('/'));
		}
	};
</script>

<div class="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md">
	<h1 class="text-2xl font-bold text-gray-800">Add Currency</h1>

	<div class="space-y-4">
		{#if availableCurrencies.length === 0}
			<p class="text-gray-500">Loading currencies...</p>
		{:else if filteredCurrencies.length === 0}
			<p class="text-gray-500">No currencies available to add.</p>
		{:else}
			<div class="max-h-96 space-y-3 overflow-y-auto">
				{#each filteredCurrencies as currency (currency.id)}
					<div
						class="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
					>
						<div>
							<p class="font-semibold text-gray-800">{currency.name} -- {currency.currencyName}</p>
							<p class="text-gray-500">{currency.symbol}</p>
						</div>
						<button
							onclick={() => addCurrency(currency)}
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
						>
							Add
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Custom scrollbar for the currencies list */
	::-webkit-scrollbar {
		width: 8px;
	}

	::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 4px;
	}

	::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 4px;
	}

	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
