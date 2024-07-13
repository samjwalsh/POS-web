<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import type { getRevOutput } from '$lib/db/queries/getRev';
	import type { RollingRevenue } from '$lib/db/queries/getRollingRevenue';
	export let rollingRevenue: Array<RollingRevenue>;
	export let todaysRev: getRevOutput;
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	import { cF, nF } from '$lib/utils';

	const shops = ['Main', 'Bray', 'Lighthouse', 'West Pier'];

	const data: Array<shopData> = [];

	for (const shop of shops) {
		const rr = rollingRevenue.find((shopRR) => shopRR.shop === shop)?.rollingRevenue ?? 0;
		const shopRev = todaysRev.shops.find((shopRev) => shopRev.name === shop);
		const orders = shopRev?.orders ?? 0;
		const cardTotal = shopRev?.cardTotal ?? 0;
		const cashTotal = shopRev?.cashTotal ?? 0;
		data.push({
			unit: shop,
			orders,
			cashTotal,
			cardTotal,
			rr
		});
	}

	type shopData = {
		unit: string;
		orders: number;
		cashTotal: number;
		cardTotal: number;
		rr: number;
	};
</script>

<ScrollArea class="w-full" orientation="horizontal">
	<Table.Root class="w-full">
		<Table.Caption></Table.Caption>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-[100px]">Unit</Table.Head>
				<Table.Head class="text-right">Total</Table.Head>
				<Table.Head class="text-right">Hourly</Table.Head>
				<Table.Head class="text-right">Card</Table.Head>
				<Table.Head class="text-right">Cash</Table.Head>
				<Table.Head class="text-right">Orders</Table.Head>
				<Table.Head class="text-right">Average</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each data as shop, i (i)}
				<Table.Row>
					<Table.Cell class="font-medium">{shop.unit}</Table.Cell>
					<Table.Cell class="text-right">
						{cF(shop.cashTotal + shop.cardTotal)}
					</Table.Cell>
					<Table.Cell class="text-right">{cF(shop.rr)}</Table.Cell>

					<Table.Cell class="text-right">
						{cF(shop.cardTotal)}
					</Table.Cell>
					<Table.Cell class="text-right">
						<div class="">{cF(shop.cashTotal)}</div></Table.Cell
					>
					<Table.Cell class="text-right">{shop.orders}</Table.Cell>
					<Table.Cell class="text-right">
						{cF((shop.cashTotal + shop.cardTotal) / shop.orders)}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</ScrollArea>
