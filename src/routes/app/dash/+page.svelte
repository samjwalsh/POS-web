<script lang="ts">
	export let data;

	import * as Card from '$lib/components/ui/card';
	import { cF, fF } from '$lib/utils.js';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import * as Alert from '$lib/components/ui/alert/index.js';
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
	<Card.Root class="h-48 w-full min-w-32 p-2">
		{#await data.rev}
			<Skeleton class="h-full w-full" />
		{:then rev}
			<Card.Header>
				<Card.Description>Today</Card.Description>
				<Card.Title class="text-4xl">
					{cF(rev.total)}</Card.Title
				>
			</Card.Header>
			<Card.Footer>
				<div class="text-xs text-muted-foreground">{fF(rev.orders)} {rev.orders === 1 ? 'Sale' : 'Sales'}</div>
			</Card.Footer>
		{:catch error}
			<Alert.Root variant="destructive" class="h-full w-full">
				<CircleAlert class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description>Failed to load content.</Alert.Description>
			</Alert.Root>
		{/await}
	</Card.Root>
</div>
