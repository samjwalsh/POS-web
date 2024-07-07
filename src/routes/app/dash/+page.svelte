<script lang="ts">
	export let data;

	import * as Card from '$lib/components/ui/card';
	import { cF, fF } from '$lib/utils.js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Progress } from '$lib/components/ui/progress';

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

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
	<Card.Root class="h-48 w-full min-w-32 p-2">
		{#await data.todaysRev}
			<Skeleton class="h-full w-full" />
		{:then todaysRev}
			<Card.Header>
				<Card.Description>Today</Card.Description>
				<Card.Title class="text-4xl">
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
				<Card.Title class="text-4xl">
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
</div>
