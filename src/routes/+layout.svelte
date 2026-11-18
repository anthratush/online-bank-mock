<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import { goto } from '$app/navigation';
	import { getUserData } from '#lib/utils/storage.ts';
	import { asset, resolve } from '$app/paths';

	const { children }: LayoutProps = $props();
	let isAdminPanelOpen = $state(false);
	let tapCount = $state(0);
	let tapDebounceTimer: NodeJS.Timeout | null = null;

	// Clean up the debounce timer when the component is destroyed
	$effect.pre(() => {
		return () => {
			if (tapDebounceTimer) {
				clearTimeout(tapDebounceTimer);
			}
		};
	});

	/**
	 * Navigate to the account page.
	 */
	async function navigateToAccount() {
		const userData = getUserData();
		if (userData?.account?.pinCode) {
			await goto(resolve('/account'));
		} else {
			try {
				await goto(resolve('/admin/sign-in'));
			} catch (error) {
				console.error('Navigation failed:', error);
			}
		}
	}

	/**
	 * Handle tap for admin panel access.
	 */
	function handleTap() {
		tapCount += 1;

		if (tapDebounceTimer) {
			clearTimeout(tapDebounceTimer);
		}

		if (tapCount >= 5) {
			isAdminPanelOpen = true;
			tapCount = 0;
		} else {
			tapDebounceTimer = setTimeout(() => {
				tapCount = 0;
			}, 1000);
		}
	}

	/**
	 * Close admin panel.
	 */
	function closeAdminPanel() {
		isAdminPanelOpen = false;
	}

	function clearUserInfo() {
		localStorage.removeItem('user');
		navigation.reload();
	}
</script>

<svelte:head>
	<link rel="icon" href={asset('icons/icon-192.png')} />
</svelte:head>

<div class="flex min-h-screen flex-col bg-linear-to-t from-gray-950 from-30% to-indigo-500">
	<header class="p-4 text-white">
		<div class="container mx-auto flex items-center justify-between">
			<a href={resolve('/')}><h1 class="text-xl font-bold">UkrBank 🇺🇦</h1></a>
			<div class="relative">
				<button
					onclick={() => {
						handleTap();
						navigateToAccount();
					}}
					class="flex items-center space-x-2"
					aria-label="Account"
					aria-expanded={isAdminPanelOpen}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					<span>Account</span>
				</button>
			</div>
		</div>
	</header>

	<main class="container mx-auto flex-1 p-4">
		{@render children()}
	</main>
</div>

{#if isAdminPanelOpen}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
		aria-hidden={!isAdminPanelOpen}
	>
		<div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-md" role="dialog">
			<h2 class="mb-4 text-xl font-bold">Admin Panel</h2>
			<ul class="space-y-2">
				<li>
					<a
						onclick={closeAdminPanel}
						href={resolve('/admin/edit-account')}
						class="block rounded-md px-4 py-2 text-indigo-600 hover:bg-indigo-50"
					>
						Edit Account
					</a>
				</li>
				<li>
					<a
						onclick={closeAdminPanel}
						href={resolve('/admin/add-transaction')}
						class="block rounded-md px-4 py-2 text-indigo-600 hover:bg-indigo-50"
					>
						Add Transaction
					</a>
				</li>
				<li>
					<a
						onclick={closeAdminPanel}
						href={resolve('/admin/add-currency')}
						class="block rounded-md px-4 py-2 text-indigo-600 hover:bg-indigo-50"
					>
						Add Currency
					</a>
				</li>
				<li>
					<a
						onclick={closeAdminPanel}
						href={resolve('/admin/edit-currency')}
						class="block rounded-md px-4 py-2 text-indigo-600 hover:bg-indigo-50"
					>
						Edit Currency
					</a>
				</li>
				<li>
					<a
						onclick={closeAdminPanel}
						href={resolve('/admin/edit-transaction')}
						class="block rounded-md px-4 py-2 text-indigo-600 hover:bg-indigo-50"
					>
						Edit Transaction
					</a>
				</li>
				<li>
					<button
						onclick={clearUserInfo}
						class="block rounded-md px-4 py-2 text-red-600 hover:bg-indigo-50"
					>
						Clear user info
					</button>
				</li>
			</ul>
			<button
				onclick={closeAdminPanel}
				class="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
			>
				Close
			</button>
		</div>
	</div>
{/if}
