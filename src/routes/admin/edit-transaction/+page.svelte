<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import {
		getUserData,
		saveUserData,
		type Currency,
		type Transaction
	} from '#lib/utils/storage.ts';

	// Data loaded from localStorage
	let transactions = $state<Transaction[]>([]);
	let currencies = $state<Currency[]>([]);
	let loaded = $state(false);

	// uid of the transaction currently being edited (null = list view)
	let editingUid = $state<string | null>(null);

	// Edit form state
	let name = $state('');
	let amount = $state<number | undefined>(undefined);
	let currency = $state('');
	let date = $state('');
	let type = $state<'debit' | 'credit'>('debit');

	// Inline validation errors
	let errors = $state({
		name: '',
		amount: '',
		currency: '',
		date: ''
	});

	// Brief success feedback after saving
	let saved = $state(false);

	// Transactions sorted newest first
	let sortedTransactions = $derived(
		[...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.uid.localeCompare(a.uid))
	);

	// Load transactions and currencies from localStorage (client-side only)
	onMount(() => {
		const userData = getUserData();
		transactions = userData?.transactions ?? [];
		currencies = userData?.currencies ?? [];
		loaded = true;
	});

	function getCurrencySymbol(currencyId: string): string {
		return currencies.find((c) => c.id === currencyId)?.symbol ?? '';
	}

	function formatDate(dateStr: string): string {
		// Parse manually to avoid timezone shifts with ISO date-only strings
		const [year, month, day] = dateStr.split('-').map(Number);
		return new Date(year, month - 1, day).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Sign comes from the transaction type, not the amount's own sign:
	// 'debit' = income (money in) -> '+', 'credit' = expense (money out) -> '-'
	function formatAmount(txAmount: number, txType: 'debit' | 'credit', symbol: string): string {
		const absolute = Math.abs(txAmount).toFixed(2);
		return txType === 'debit' ? `+${symbol}${absolute}` : `-${symbol}${absolute}`;
	}

	// Resolve the transaction type, falling back to the amount sign for legacy entries without `type`
	function getTransactionType(transaction: Transaction): 'debit' | 'credit' {
		return transaction.type ?? (transaction.amount < 0 ? 'credit' : 'debit');
	}

	/**
	 * Switch to the edit form pre-filled with the selected transaction's values.
	 */
	function startEdit(transaction: Transaction): void {
		editingUid = transaction.uid;
		name = transaction.name;
		amount = Math.abs(transaction.amount);
		currency = transaction.currency;
		date = transaction.date;
		type = getTransactionType(transaction);
		errors = { name: '', amount: '', currency: '', date: '' };
	}

	/**
	 * Back to the list view without saving.
	 */
	function cancelEdit(): void {
		editingUid = null;
	}

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
	 * Save the edited transaction to localStorage (matched by uid) and return to the list.
	 */
	function handleSubmit(e: Event): void {
		e.preventDefault();
		if (!validateForm() || !editingUid) return;
		if (amount === undefined || Number.isNaN(amount)) return;

		const userData = getUserData();
		if (!userData) return;

		const index = userData.transactions.findIndex((t) => t.uid === editingUid);
		if (index === -1) return;

		// Store the amount as an absolute value; the sign comes from the type
		userData.transactions[index] = {
			uid: editingUid,
			name: name.trim(),
			date,
			amount: Math.abs(amount),
			currency,
			type
		};
		saveUserData(userData);

		// Keep local state in sync and show brief success feedback on the list
		transactions = userData.transactions;
		editingUid = null;
		saved = true;
		setTimeout(() => {
			saved = false;
		}, 2000);
	}

	/**
	 * Delete the transaction being edited after confirmation.
	 */
	function handleDelete(): void {
		if (!editingUid) return;
		if (!confirm('Delete this transaction? This cannot be undone.')) return;

		const userData = getUserData();
		if (!userData) return;

		userData.transactions = userData.transactions.filter((t) => t.uid !== editingUid);
		saveUserData(userData);

		transactions = userData.transactions;
		editingUid = null;
	}
</script>

<div>
	<div class="mx-auto max-w-md rounded-lg bg-white shadow-md">
		<h1 class="mb-6 text-2xl font-bold">Edit Transaction</h1>

		{#if !loaded}
			<p class="text-gray-500">Loading...</p>
		{:else if editingUid !== null}
			<!-- Edit form for the selected transaction -->
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
				<div class="mt-6 flex items-center justify-between">
					<button
						type="button"
						onclick={handleDelete}
						class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
					>
						Delete
					</button>
					<div class="flex space-x-3">
						<button
							type="button"
							onclick={cancelEdit}
							class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
						>
							Save Changes
						</button>
					</div>
				</div>
			</form>
		{:else if sortedTransactions.length === 0}
			<p class="text-gray-600">
				No transactions to edit.
				<a href={resolve('/admin/add-transaction')} class="text-indigo-600 hover:text-indigo-500">
					Add a transaction first.
				</a>
			</p>
		{:else}
			<!-- Transaction list -->
			{#if saved}
				<p class="mb-4 text-sm font-medium text-green-600">Saved!</p>
			{/if}
			<ul class="max-h-72 space-y-3 overflow-y-auto pr-2">
				{#each sortedTransactions as transaction (transaction.uid)}
					{@const txType = getTransactionType(transaction)}
					{@const symbol = getCurrencySymbol(transaction.currency)}
					<li
						class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
					>
						<div>
							<p class="font-semibold text-gray-800">{transaction.name}</p>
							<p class="text-sm text-gray-500">{formatDate(transaction.date)}</p>
							<p
								class="text-sm font-medium {txType === 'debit' ? 'text-green-600' : 'text-red-600'}"
							>
								{formatAmount(transaction.amount, txType, symbol)}
							</p>
						</div>
						<button
							type="button"
							onclick={() => startEdit(transaction)}
							class="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
						>
							Edit
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="mt-6">
			<a href={resolve('/')} class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
				&larr; Back to home
			</a>
		</div>
	</div>
</div>
