<script lang="ts">
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { extent } from 'd3-array';
	import { format } from 'date-fns';
	import { mode } from 'mode-watcher';
	import { getSettings } from 'svelte-ux';
	const { currentTheme } = getSettings();

	import { Axis, Bars, Chart, Svg, createStackData, Tooltip, TooltipItem } from 'layerchart';
	import type { Output } from '$lib/db/queries/getLast30Days';

	export let data: Output;

	const stackedData = createStackData(data, { xKey: 'day', stackBy: 'shop' });
	const colorKeys = [...new Set(data.map((x) => x.shop))];
	// const keyColors = ['#ff5861', '#00a96e', '#ffbe00', '#00b5ff'];

	$: keyColors = setKeyColours($currentTheme.theme);

	const setKeyColours = (mode: string | null) => {
		console.log($currentTheme.theme);
		if (mode === 'dark') {
			return ['#fff', '#ddd', '#bbb', '#999'];
		} else {
			return ['#111', '#444', '#777', '#aaa'];
		}
	};
	const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

	const getTooltips = (day: Date) => {
		const filtered = data.filter((dataPoint) => dataPoint.day == day);
		const mapped = filtered.map((dataPoint) => {
			return { name: dataPoint.shop, value: dataPoint.value };
		});
		const total = mapped.reduce((prev, curr) => {
			return prev + curr.value;
		}, 0);
		return [{ name: 'Total', value: total }, ...mapped];
	};
</script>

<div class="h-full w-full p-6">
	<Chart
		data={stackedData}
		x="day"
		xScale={scaleBand().paddingInner(0.1).paddingOuter(0.1)}
		y="values"
		yDomain={extent(stackedData.flatMap((d) => d.values))}
		yNice={1}
		rScale={scaleOrdinal()}
		r={(data) => data.keys[1]}
		rDomain={colorKeys}
		rRange={keyColors}
		padding={{ left: 20, bottom: 20 }}
		tooltip={{ mode: 'band' }}
	>
		<Svg>
			<Axis placement="left" />
			<Axis placement="bottom" format={(d) => days[d.getDay()]} />
			<Bars radius={3} strokeWidth={0} />
		</Svg>
		<Tooltip
			header={(data) => format(data.day, 'eee, MMMM do')}
			class="border bg-background bg-opacity-95 backdrop-blur-sm"
			let:data
		>
			{#each getTooltips(data.day) as tooltip}
				<TooltipItem label={tooltip.name} value={`€${tooltip.value}`} />
			{/each}
		</Tooltip>
	</Chart>
</div>
