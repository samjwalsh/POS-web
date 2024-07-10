<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { format } from 'date-fns';
	import type { Output } from '$lib/db/queries/getLast30Days';

	import {
		Axis,
		Bars,
		Chart,
		Highlight,
		Svg,
		Tooltip,
		TooltipItem,
		createStackData,
		stackOffsetSeparated
	} from 'layerchart';

	import { formatDate, PeriodType } from 'svelte-ux';

	export let data: Output;
</script>

<div class="h-[300px] rounded border p-4">
	<Chart
		{data}
		x="date"
		xScale={scaleBand().padding(0.4)}
		y="value"
		yDomain={[0, null]}
		yNice={4}
		padding={{ left: 16, bottom: 24 }}
		tooltip={{ mode: 'band' }}
	>
		<Svg>
			<Axis placement="left" grid rule />
			<Axis
				placement="bottom"
				format={(d) => formatDate(d, PeriodType.Day, { variant: 'short' })}
				rule
			/>
			<Bars radius={4} strokeWidth={1} class="fill-primary" />
			<Highlight area />
		</Svg>
		<Tooltip header={(data) => format(data.date, 'eee, MMMM do')} let:data>
			<TooltipItem label="value" value={data.value} />
		</Tooltip>
	</Chart>
</div>
