<script lang="ts">
	import { onMount } from 'svelte';
	import { getUserData, type Currency, type Transaction } from '#lib/utils/storage.ts';

	let { currencyId }: { currencyId?: string } = $props();

	let transactions = $state<Transaction[]>([]);
	let currencies = $state<Currency[]>([]);
	let showAll = $state(false);

	// Load transactions and currencies from localStorage (client-side only)
	onMount(() => {
		const userData = getUserData();
		if (userData) {
			transactions = userData.transactions ?? [];
			currencies = userData.currencies ?? [];
		}
	});

	// Transactions of the selected currency (all transactions when none is selected)
	let filteredTransactions = $derived(
		currencyId ? transactions.filter((t) => t.currency === currencyId) : transactions
	);

	// Filtered transactions sorted by date, newest first
	let allSortedTransactions = $derived(
		[...filteredTransactions].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		)
	);

	// Preview shows only the 3 most recent transactions
	let sortedTransactions = $derived(allSortedTransactions.slice(0, 3));

	// All transactions grouped by day (date string), newest day first.
	// Transactions within each group keep the sorted order.
	let transactionsByDay = $derived.by(() => {
		const groups: { date: string; transactions: Transaction[] }[] = [];
		for (const transaction of allSortedTransactions) {
			const group = groups.find((g) => g.date === transaction.date);
			if (group) {
				group.transactions.push(transaction);
			} else {
				groups.push({ date: transaction.date, transactions: [transaction] });
			}
		}
		return groups;
	});

	function getCurrencySymbol(currencyId: string): string {
		return currencies.find((currency) => currency.id === currencyId)?.symbol ?? '';
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
	function formatAmount(amount: number, type: 'debit' | 'credit', symbol: string): string {
		const absolute = Math.abs(amount).toFixed(2);
		return type === 'debit' ? `+${symbol}${absolute}` : `-${symbol}${absolute}`;
	}

	// Resolve the transaction type, falling back to the amount sign for legacy entries without `type`
	function getTransactionType(transaction: Transaction): 'debit' | 'credit' {
		return transaction.type ?? (transaction.amount < 0 ? 'credit' : 'debit');
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') showAll = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="w-full rounded-xl bg-white p-6 shadow-md">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-bold text-gray-800">Transactions</h2>
		<button
			type="button"
			class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
			onclick={() => (showAll = true)}
		>
			All
		</button>
	</div>

	{#if sortedTransactions.length === 0}
		<p class="py-8 text-center text-gray-500">No transactions yet.</p>
	{:else}
		<ul class="max-h-72 divide-y divide-gray-200 overflow-y-auto pr-2">
			{#each sortedTransactions as transaction (transaction.uid)}
				{@const txType = getTransactionType(transaction)}
				<li class="flex items-center justify-between gap-4 py-3">
					<div class="min-w-0">
						<p class="truncate font-semibold text-gray-800">{transaction.name}</p>
						<p class="text-sm text-gray-500">{formatDate(transaction.date)}</p>
					</div>
					<p
						class={[
							'shrink-0 font-semibold',
							txType === 'debit' ? 'text-green-600' : 'text-red-600'
						]}
					>
						{formatAmount(transaction.amount, txType, getCurrencySymbol(transaction.currency))}
					</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>

{#if showAll}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-gray-50"
		role="dialog"
		aria-modal="true"
		aria-label="All transactions"
	>
		<div class="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-4">
			<button
				type="button"
				aria-label="Close"
				onclick={() => (showAll = false)}
				class="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</button>
			<h2 class="text-xl font-bold text-gray-800">All Transactions</h2>
		</div>

		<div class="flex-1 overflow-y-auto px-6 py-4">
			{#if transactionsByDay.length === 0}
				<p class="py-8 text-center text-gray-500">No transactions yet.</p>
			{:else}
				{#each transactionsByDay as group (group.date)}
					<section class="mb-6">
						<h3 class="mb-2 text-sm font-semibold text-gray-500">{formatDate(group.date)}</h3>
						<ul class="divide-y divide-gray-200 rounded-xl bg-white shadow-sm">
							{#each group.transactions as transaction (transaction.uid)}
								{@const txType = getTransactionType(transaction)}
								<li class="flex items-center justify-between gap-4 px-4 py-3">
									<p class="truncate font-semibold text-gray-800">{transaction.name}</p>
									<p
										class={[
											'shrink-0 font-semibold',
											txType === 'debit' ? 'text-green-600' : 'text-red-600'
										]}
									>
										{formatAmount(
											transaction.amount,
											txType,
											getCurrencySymbol(transaction.currency)
										)}
									</p>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			{/if}
		</div>
	</div>
{/if}
