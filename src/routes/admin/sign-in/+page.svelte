<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { validatePinCode, setAuthStatus } from '#lib/utils/storage.ts';

	let pinCode = $state('');
	let isLoading = $state(false);
	const error = $derived.by(() => {
		if (!pinCode) return '';
		if (pinCode.length !== 4 || !/^\d+$/.test(pinCode)) return 'PIN must be a 4-digit number.';
		return validatePinCode(pinCode) ? '' : 'Invalid PIN code.';
	});

	/**
	 * Handle form submission.
	 */
	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (error) return;

		isLoading = true;
		try {
			setAuthStatus(true);
			await goto(resolve('/'));
		} catch (error) {
			console.error('Navigation failed:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
		<h1 class="mb-6 text-center text-2xl font-bold">Sign In</h1>

		<form onsubmit={handleSubmit}>
			<div class="mb-4">
				<label for="pinCode" class="mb-1 block text-sm font-medium text-gray-700">
					PIN Code (4 digits)
				</label>
				<input
					type="password"
					id="pinCode"
					bind:value={pinCode}
					maxlength="4"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
					aria-invalid={!!error}
					aria-describedby={error ? 'pinError' : undefined}
				/>
			</div>

			{#if error}
				<p id="pinError" class="mb-4 text-sm text-red-500">{error}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
				disabled={isLoading}
			>
				{isLoading ? 'Signing In...' : 'Sign In'}
			</button>
		</form>

		<div class="mt-4 text-center">
			<p class="text-sm text-gray-600">
				New user?
				<a href={resolve('/admin/create-user')} class="text-indigo-600 hover:text-indigo-500">
					Create PIN
				</a>
			</p>
		</div>
	</div>
</div>
