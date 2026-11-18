<script lang="ts">
	import { getUserData, type UserData } from '#lib/utils/storage.ts';

	// Initialize userData with a fallback to avoid runtime errors
	let userData = $state<UserData>(getUserData()!);

	// Derive account safely from userData
	const account = $derived.by(() => userData?.account);
</script>

<div class="min-h-screen p-4">
	<div class="mx-auto max-w-md rounded-lg p-6">
		<h1 class="mb-6 text-center text-2xl font-bold text-white">Account Information</h1>

		{#if account}
			<div class="space-y-4">
				<div>
					<p class="text-sm font-medium text-gray-200">First Name</p>
					<p class="text-lg text-white">{account.firstName}</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-200">Last Name</p>
					<p class="text-lg text-white">{account.lastName}</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-200">Country</p>
					<p class="text-lg text-white">{account.country?.name || 'N/A'}</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-200">Phone</p>
					<p class="text-lg text-white">{account.phone || 'N/A'}</p>
				</div>

				<div>
					<p class="text-sm font-medium text-gray-200">Email</p>
					<p class="text-lg text-white">{account.email || 'N/A'}</p>
				</div>
			</div>
		{:else}
			<p class="text-center text-gray-600">No account information found.</p>
		{/if}
	</div>
</div>
