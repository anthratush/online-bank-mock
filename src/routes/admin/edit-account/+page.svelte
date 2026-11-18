<script lang="ts">
	import { goto } from '$app/navigation';
	import countries from '../../../../static/mocks/countries.json';
	import { resolve } from '$app/paths';

	// Define types for account data
	interface Account {
		firstName: string;
		lastName: string;
		country: string;
		phone?: string;
		email?: string;
	}

	// Initialize state
	let account = $state<Account>({
		firstName: '',
		lastName: '',
		country: 'US',
		phone: '',
		email: ''
	});

	let errors = $state({
		firstName: '',
		lastName: '',
		email: ''
	});

	// Fetch account data from localStorage
	const fetchAccountData = () => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			const userData = JSON.parse(storedUser);
			if (userData.account) {
				account.firstName = userData.account.firstName || '';
				account.lastName = userData.account.lastName || '';
				account.country = userData.account.country?.id || 'US';
				account.phone = userData.account.phone || '';
				account.email = userData.account.email || '';
			}
		}
	};

	// Fetch data on component mount
	fetchAccountData();

	// Validate email format
	const validateEmail = (email: string) => {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	};

	// Validate form
	const validateForm = () => {
		let isValid = true;
		errors = { firstName: '', lastName: '', email: '' };

		if (!account.firstName.trim()) {
			errors.firstName = 'First name is required';
			isValid = false;
		}

		if (!account.lastName.trim()) {
			errors.lastName = 'Last name is required';
			isValid = false;
		}

		if (account.email && !validateEmail(account.email)) {
			errors.email = 'Please enter a valid email address';
			isValid = false;
		}

		return isValid;
	};

	// Save account data to localStorage
	const saveAccount = () => {
		if (!validateForm()) return;

		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			const userData = JSON.parse(storedUser);
			userData.account = {
				...userData.account,
				firstName: account.firstName,
				lastName: account.lastName,
				country: countries.find((c) => c.id === account.country),
				phone: account.phone,
				email: account.email
			};
			localStorage.setItem('user', JSON.stringify(userData));
		}

		goto(resolve('/account'));
	};
</script>

<div class="min-h-screen bg-gray-50 p-6">
	<div class="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
		<h1 class="mb-6 text-2xl font-bold text-gray-800">Edit Account</h1>

		<form onsubmit={saveAccount} class="space-y-4">
			<!-- First Name -->
			<div>
				<label for="firstName" class="mb-1 block text-sm font-medium text-gray-700"
					>First Name</label
				>
				<input
					id="firstName"
					type="text"
					bind:value={account.firstName}
					class="w-full border px-3 py-2 {errors.firstName
						? 'border-red-500'
						: 'border-gray-300'} rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
				/>
				{#if errors.firstName}
					<p class="mt-1 text-sm text-red-600">{errors.firstName}</p>
				{/if}
			</div>

			<!-- Last Name -->
			<div>
				<label for="lastName" class="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
				<input
					id="lastName"
					type="text"
					bind:value={account.lastName}
					class="w-full border px-3 py-2 {errors.lastName
						? 'border-red-500'
						: 'border-gray-300'} rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
				/>
				{#if errors.lastName}
					<p class="mt-1 text-sm text-red-600">{errors.lastName}</p>
				{/if}
			</div>

			<!-- Country -->
			<div>
				<label for="country" class="mb-1 block text-sm font-medium text-gray-700">Country</label>
				<select
					id="country"
					bind:value={account.country}
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
				>
					{#each countries as country (country.id)}
						<option value={country.id}>{country.name}</option>
					{/each}
				</select>
			</div>

			<!-- Phone -->
			<div>
				<label for="phone" class="mb-1 block text-sm font-medium text-gray-700">Phone</label>
				<input
					id="phone"
					type="tel"
					bind:value={account.phone}
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
				/>
			</div>

			<!-- Email -->
			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
				<input
					id="email"
					type="email"
					bind:value={account.email}
					class="w-full border px-3 py-2 {errors.email
						? 'border-red-500'
						: 'border-gray-300'} rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
				/>
				{#if errors.email}
					<p class="mt-1 text-sm text-red-600">{errors.email}</p>
				{/if}
			</div>

			<!-- Actions -->
			<div class="mt-6 flex justify-end space-x-3">
				<a
					href={resolve('/account')}
					class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
				>
					Cancel
				</a>
				<button
					type="submit"
					class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
				>
					Save
				</button>
			</div>
		</form>
	</div>
</div>
