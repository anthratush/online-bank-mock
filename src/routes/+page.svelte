<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getUserData, getAuthStatus, type Currency } from '#lib/utils/storage.ts';
	import { resolve } from '$app/paths';
	import CurrencyCard from '#lib/components/CurrencyCard.svelte';
	import TransactionList from '#lib/components/TransactionList.svelte';

	$effect(() => {
		const userData = getUserData();
		const isAuth = getAuthStatus();

		if (!userData?.account?.pinCode) {
			goto(resolve('/admin/create-user'));
		} else if (!isAuth) {
			goto(resolve('/admin/sign-in'));
		}
	});

	// Fetch currencies from localStorage (client-side only)
	let currencies = $state<Currency[]>([]);

	// Swipe carousel state
	let selectedIndex = $state(0);
	let selectedCurrency = $derived(
		currencies[Math.min(selectedIndex, Math.max(currencies.length - 1, 0))]
	);
	let touchStartX = $state<number | null>(null);
	let containerWidth = $state(0);
	let justSwiped = $state(false);
	let carouselEl = $state<HTMLDivElement | null>(null);

	onMount(() => {
		const userData = getUserData();
		if (userData?.currencies) {
			currencies = userData.currencies;
		}

		// Svelte 5 attaches `ontouchmove` attribute handlers passively, so a
		// `preventDefault()` there would be ignored — attach a non-passive
		// listener manually to block browser back-swipe/scroll on horizontal swipes.
		const el = carouselEl;
		if (!el) return;
		const preventTouchMove = (e: TouchEvent) => e.preventDefault();
		el.addEventListener('touchmove', preventTouchMove, { passive: false });
		return () => el.removeEventListener('touchmove', preventTouchMove);
	});

	function handleTouchStart(e: TouchEvent & { currentTarget: HTMLDivElement }): void {
		touchStartX = e.changedTouches[0].clientX;
		containerWidth = e.currentTarget.getBoundingClientRect().width;
	}

	function handleTouchEnd(e: TouchEvent): void {
		if (touchStartX === null) return;
		const dx = e.changedTouches[0].clientX - touchStartX;
		const threshold = containerWidth * 0.2;
		if (Math.abs(dx) > threshold) {
			justSwiped = true;
			// Swipe left (dx < 0) -> next currency, swipe right (dx > 0) -> previous currency
			if (dx < 0 && selectedIndex < currencies.length - 1) {
				selectedIndex += 1;
			} else if (dx > 0 && selectedIndex > 0) {
				selectedIndex -= 1;
			}
		}
		touchStartX = null;
	}

	function handleTouchCancel(): void {
		touchStartX = null;
	}

	// A real swipe is followed by a click — suppress it so the card doesn't flip
	function handleClickCapture(e: MouseEvent): void {
		if (justSwiped) {
			e.preventDefault();
			e.stopPropagation();
			justSwiped = false;
		}
	}
</script>

<div class="flex flex-col gap-4 lg:flex-row">
	<!-- Currencies: ~1/3 width on desktop, full width on mobile -->
	<section class="w-full lg:w-1/3">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={carouselEl}
			class="touch-pan-y overflow-hidden"
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
			ontouchcancel={handleTouchCancel}
			onclickcapture={handleClickCapture}
		>
			<div
				class="flex transition-transform duration-300 ease-out"
				style:transform="translateX({-selectedIndex * 100}%)"
			>
				{#each currencies as currency (currency.id)}
					<div class="w-full shrink-0 px-2">
						<CurrencyCard {currency} />
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Transactions: ~2/3 width on desktop, full width on mobile -->
	<div class="px-2"><TransactionList currencyId={selectedCurrency?.id} /></div>
</div>
