<script lang="ts">
	import { onMount } from 'svelte';
	import { getUserData, type Currency, type UserAccount } from '#lib/utils/storage.ts';

	interface Props {
		currency: Currency;
	}

	let { currency }: Props = $props();
	let isFlipped = $state(false);

	// Cardholder account from localStorage (read in onMount to avoid SSR hydration mismatch)
	let account = $state<UserAccount | null>(null);

	onMount(() => {
		account = getUserData()?.account ?? null;
	});

	// Cardholder full name from localStorage (e.g. "First Name Last Name")
	let cardholderName = $derived(account ? `${account.firstName} ${account.lastName}`.trim() : '');

	// Default cardBalance to 0 if missing
	$effect(() => {
		if (currency.cardBalance === undefined) {
			currency.cardBalance = 0;
		}
	});

	// Mask the card number for security
	let maskedCardNumber = $derived(currency.cardNumber.replace(/\d{4}(?=\d)/g, '**** '));

	// Format the balance with thousands separators and 2 decimal places
	let formattedBalance = $derived(
		currency.cardBalance.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})
	);
</script>

<div>
	<div class="my-2 text-center text-4xl font-bold text-gray-100">
		{currency.symbol}{formattedBalance}
	</div>

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={[
			'card-container relative h-[180px] w-full max-w-md [perspective:1000px]',
			{ flipped: isFlipped }
		]}
		onclick={() => (isFlipped = !isFlipped)}
	>
		<div
			class={[
				'currency-card relative h-full w-full rounded-lg shadow-md transition-transform duration-600 [transform-style:preserve-3d]',
				{ 'rotate-y-180': isFlipped }
			]}
			style="aspect-ratio: 1.5 / 1;"
		>
			<div
				class="card-front absolute flex h-full w-full flex-col justify-between rounded-lg bg-linear-to-br from-gray-400 to-gray-600 p-4 text-gray-800 backface-hidden"
			>
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold">{currency.name} - {currency.currencyName}</h3>
				</div>

				<div class="card-number mt-auto mb-auto self-center text-3xl tracking-wider">
					{maskedCardNumber}
				</div>

				<div class="flex items-center justify-between gap-4 uppercase">
					<span class="truncate text-sm font-semibold tracking-wider">{cardholderName}</span>

					<div class="w-14 shrink-0">
						<svg
							role="img"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							class="h-auto w-full"
						>
							<title>Visa</title>
							<path
								fill="#FFF"
								d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
							/>
						</svg>
					</div>
				</div>
			</div>
			<div
				class="card-back absolute flex h-full w-full rotate-y-180 flex-col justify-between rounded-lg bg-gradient-to-br from-gray-800 to-black p-4 text-white [backface-visibility:hidden]"
			>
				<div class="magnetic-stripe my-4 h-5 rounded bg-black"></div>
				<div class="card-details mt-4">
					<div class="cvv mb-2 text-xs">
						<span>CVV: {currency.cardCVV}</span>
					</div>
					<div class="expiry mb-2 text-xs">
						Expires: {currency.cardExpDate}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
