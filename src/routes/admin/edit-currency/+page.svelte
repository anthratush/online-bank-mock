<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { getUserData, saveUserData, type Currency } from '#lib/utils/storage.ts';

	// User currencies loaded from localStorage
	let currencies = $state<Currency[]>([]);
	let loaded = $state(false);

	// Editable balance per currency id (input value)
	let balanceInputs = $state<Record<string, number | undefined>>({});

	// Inline validation errors per currency id
	let errors = $state<Record<string, string>>({});

	// Currency ids that were just saved (shows "Saved!" feedback briefly)
	let savedIds = $state<Record<string, boolean>>({});

	// Load currencies from localStorage (client-side only)
	onMount(() => {
		const userData = getUserData();
		currencies = userData?.currencies ?? [];
		for (const currency of currencies) {
			balanceInputs[currency.id] = currency.cardBalance;
		}
		loaded = true;
	});

	/**
	 * Save the edited balance for a single currency to localStorage.
	 * `cardBalance` is the only editable field.
	 */
	function saveBalance(currency: Currency): void {
		const value = balanceInputs[currency.id];

		if (value === undefined || Number.isNaN(value)) {
			errors[currency.id] = 'Enter a valid balance';
			return;
		}

		const userData = getUserData();
		if (!userData) return;

		const target = userData.currencies.find((c) => c.id === currency.id);
		if (!target) return;

		target.cardBalance = value;
		saveUserData(userData);

		// Keep local state in sync and show brief success feedback
		currency.cardBalance = value;
		errors[currency.id] = '';
		savedIds[currency.id] = true;

		setTimeout(() => {
			savedIds[currency.id] = false;
		}, 2000);
	}
</script>

<div class="min-h-screen bg-gray-50 p-6">
	<div class="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
		<h1 class="mb-6 text-2xl font-bold text-gray-800">Edit Currencies</h1>

		{#if !loaded}
			<p class="text-gray-500">Loading...</p>
		{:else if currencies.length === 0}
			<p class="text-gray-600">
				No currencies to edit.
				<a href={resolve('/admin/add-currency')} class="text-indigo-600 hover:text-indigo-500">
					Add a currency first.
				</a>
			</p>
		{:else}
			<ul class="space-y-4">
				{#each currencies as currency (currency.id)}
					<li class="rounded-lg border border-gray-200 p-4">
						<div class="mb-2 flex items-center justify-between">
							<div>
								<p class="font-semibold text-gray-800">{currency.name}</p>
								<p class="text-sm text-gray-500">{currency.symbol}</p>
							</div>
							{#if savedIds[currency.id]}
								<span class="text-sm font-medium text-green-600">Saved!</span>
							{/if}
						</div>

						<div class="flex items-center space-x-2">
							<label for="balance-{currency.id}" class="sr-only">
								Balance for {currency.name}
							</label>
							<input
								id="balance-{currency.id}"
								type="number"
								step="0.01"
								placeholder="0.00"
								bind:value={balanceInputs[currency.id]}
								class="w-full border px-3 py-2 {errors[currency.id]
									? 'border-red-500'
									: 'border-gray-300'} rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
								aria-invalid={!!errors[currency.id]}
								aria-describedby={errors[currency.id] ? `balance-error-${currency.id}` : undefined}
							/>
							<button
								type="button"
								onclick={() => saveBalance(currency)}
								class="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
							>
								Save
							</button>
						</div>
						{#if errors[currency.id]}
							<p id="balance-error-{currency.id}" class="mt-1 text-sm text-red-600">
								{errors[currency.id]}
							</p>
						{/if}
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
