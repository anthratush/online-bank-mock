<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		getUserData,
		saveUserData,
		type Currency,
		type Transaction
	} from '#lib/utils/storage.ts';

	// Form state
	let name = $state('');
	let amount = $state<number | undefined>(undefined);
	let currency = $state('');
	let date = $state('');
	let type = $state<'debit' | 'credit'>('debit');

	// User currencies loaded from localStorage
	let currencies = $state<Currency[]>([]);
	let loaded = $state(false);

	// Inline validation errors
	let errors = $state({
		name: '',
		amount: '',
		currency: '',
		date: ''
	});

	/**
	 * Get today's date as an ISO date string (YYYY-MM-DD) in local time.
	 */
	function getToday(): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	// Load currencies from localStorage and default the date to today (client-side only)
	onMount(() => {
		const userData = getUserData();
		currencies = userData?.currencies ?? [];
		date = getToday();
		loaded = true;
	});

	/**
	 * Validate the form fields and update inline errors.
	 * Returns true when every field is valid.
	 */
	function validateForm(): boolean {
		errors = { name: '', amount: '', currency: '', date: '' };

		if (!name.trim()) {
			errors.name = 'Name is required';
		}

		if (amount === undefined || Number.isNaN(amount)) {
			errors.amount = 'Enter a valid amount';
		}

		if (!currency) {
			errors.currency = 'Currency is required';
		}

		if (!date || Number.isNaN(new Date(date).getTime())) {
			errors.date = 'Date is required';
		}

		return !errors.name && !errors.amount && !errors.currency && !errors.date;
	}

	/**
	 * Handle form submission: save the new transaction and navigate home.
	 */
	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!validateForm()) return;

		const userData = getUserData();
		if (!userData || typeof amount !== 'number' || Number.isNaN(amount)) return;

		const transaction: Transaction = {
			uid: `txn_${Date.now()}`,
			name: name.trim(),
			date,
			amount,
			currency,
			type
		};

		userData.transactions = [...(userData.transactions ?? []), transaction];
		saveUserData(userData);

		await goto(resolve('/'));
	}
</script>

<div class="min-h-screen bg-gray-50 p-6">
	<div class="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
		<h1 class="mb-6 text-2xl font-bold text-gray-800">Add Transaction</h1>

		{#if !loaded}
			<p class="text-gray-500">Loading...</p>
		{:else if currencies.length === 0}
			<p class="text-gray-600">
				No currencies available.
				<a href={resolve('/admin/add-currency')} class="text-indigo-600 hover:text-indigo-500">
					Add a currency first.
				</a>
			</p>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4">
				<!-- Name -->
				<div>
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">Name</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						class="w-full border px-3 py-2 {errors.name
							? 'border-red-500'
							: 'border-gray-300'} rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
						aria-invalid={!!errors.name}
						aria-describedby={errors.name ? 'name-error' : undefined}
					/>
					{#if errors.name}
						<p id="name-error" class="mt-1 text-sm text-red-600">{errors.name}</p>
					{/if}
				</div>

				<!-- Type -->
				<div>
					<label for="type" class="mb-1 block text-sm font-medium text-gray-700">Type</label>
					<select
						id="type"
						bind:value={type}
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
					>
						<option value="debit">Debit (income)</option>
						<option value="credit">Credit (expense)</option>
					</select>
				</div>

				<!-- Amount -->
				<div>
					<label for="amount" class="mb-1 block text-sm font-medium text-gray-700">Amount</label>
					<input
						id="amount"
						type="number"
						step="0.01"
						placeholder="0.00"
						bind:value={amount}
						class="w-full border px-3 py-2 {errors.amount
							? 'border-red-500'
							: 'border-gray-300'} rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
						aria-invalid={!!errors.amount}
						aria-describedby={errors.amount ? 'amount-error' : undefined}
					/>
					{#if errors.amount}
						<p id="amount-error" class="mt-1 text-sm text-red-600">{errors.amount}</p>
					{/if}
				</div>

				<!-- Currency -->
				<div>
					<label for="currency" class="mb-1 block text-sm font-medium text-gray-700">Currency</label
					>
					<select
						id="currency"
						bind:value={currency}
						class="w-full border px-3 py-2 {errors.currency
							? 'border-red-500'
							: 'border-gray-300'} rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
						aria-invalid={!!errors.currency}
						aria-describedby={errors.currency ? 'currency-error' : undefined}
					>
						<option value="" disabled>Select a currency</option>
						{#each currencies as userCurrency (userCurrency.id)}
							<option value={userCurrency.id}>
								{userCurrency.name} ({userCurrency.symbol})
							</option>
						{/each}
					</select>
					{#if errors.currency}
						<p id="currency-error" class="mt-1 text-sm text-red-600">{errors.currency}</p>
					{/if}
				</div>

				<!-- Date -->
				<div>
					<label for="date" class="mb-1 block text-sm font-medium text-gray-700">Date</label>
					<input
						id="date"
						type="date"
						bind:value={date}
						class="w-full border px-3 py-2 {errors.date
							? 'border-red-500'
							: 'border-gray-300'} rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
						aria-invalid={!!errors.date}
						aria-describedby={errors.date ? 'date-error' : undefined}
					/>
					{#if errors.date}
						<p id="date-error" class="mt-1 text-sm text-red-600">{errors.date}</p>
					{/if}
				</div>

				<!-- Actions -->
				<div class="mt-6 flex justify-end space-x-3">
					<a
						href={resolve('/')}
						class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					>
						Cancel
					</a>
					<button
						type="submit"
						class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					>
						Add Transaction
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
