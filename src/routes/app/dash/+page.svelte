<script lang="ts">
	export let data;

	import * as Card from '$lib/components/ui/card';
	import { cF, fF } from '$lib/utils.js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import DailyRevenue from './DailyRevenue.svelte';
	import ShopsInfo from './ShopsInfo.svelte';

	const calculatePercentStr = (thisWeek: number, lastWeek: number) => {
		const percent = 100 * ((thisWeek - lastWeek) / lastWeek);
		let str = percent.toFixed(1);
		if (percent > 0) str = '+' + str;
		str += '%';
		return str;
	};

	const calcPercent = (thisWeek: number, lastWeek: number) => {
		return 100 * ((thisWeek - lastWeek) / lastWeek);
	};
</script>

<div class="grid gap-4 sm:grid-cols-[1fr_1fr] lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr]">
	<Card.Root class="h-48 w-full min-w-32 p-2">
		{#await data.todaysRev}
			<Skeleton class="h-full w-full" />
		{:then todaysRev}
			<Card.Header>
				<Card.Description>Today</Card.Description>
				<Card.Title class="text-2xl md:text-3xl">
					{cF(todaysRev.total)}</Card.Title
				>
			</Card.Header>
			<Card.Footer>
				<div class="text-xs text-muted-foreground">
					{fF(todaysRev.orders)}
					{todaysRev.orders === 1 ? 'Sale' : 'Sales'}
				</div>
			</Card.Footer>
		{:catch error}
			<Alert.Root variant="destructive" class="h-full w-full">
				<CircleAlert class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description>Failed to load content.</Alert.Description>
			</Alert.Root>
		{/await}
	</Card.Root>
	<Card.Root class="h-48 w-full min-w-32 p-2">
		{#await data.weeklyRev}
			<Skeleton class="h-full w-full" />
		{:then weeklyRev}
			<Card.Header>
				<Card.Description>This week</Card.Description>
				<Card.Title class="text-2xl md:text-3xl">
					{cF(weeklyRev.total)}</Card.Title
				>
			</Card.Header>
			{#await data.lastWeek then lastWeek}
				<Card.Content>
					<div class="text-xs text-muted-foreground">
						{calculatePercentStr(weeklyRev.total, lastWeek.total)} from last week
					</div>
				</Card.Content>
			{/await}
		{:catch error}
			<Alert.Root variant="destructive" class="h-full w-full">
				<CircleAlert class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description>Failed to load content.</Alert.Description>
			</Alert.Root>
		{/await}
	</Card.Root>
	<Card.Root class="col-span-2 row-span-2 h-96 overflow-x-scroll md:overflow-x-hidden">
		{#await data.todaysRev}
			<Skeleton class="h-full w-full" />
		{:then todaysRev}
			{#await data.rollingRevenue}
				<Skeleton class="h-full w-full" />
			{:then rollingRevenue}
				<ShopsInfo {rollingRevenue} {todaysRev}></ShopsInfo>
			{/await}
		{/await}
	</Card.Root>
	<Card.Root class="col-span-2 row-span-2 h-96 ">
		{#await data.last30Days}
			<Skeleton class="h-full w-full" />
		{:then last30Days}
			<DailyRevenue data={last30Days}></DailyRevenue>
		{/await}
	</Card.Root>
</div>
