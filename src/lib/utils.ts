import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import {default as ch} from 'chalk';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const nF = (n: number | string) => {
	return typeof n === 'number' ? n : parseFloat(n);
};

const Euro = Intl.NumberFormat('en-IE', {
	style: 'currency',
	currency: 'EUR',
});

export const cF = (n: number | string) => {
	if (typeof n !== 'number') n = parseFloat(n);
	return Euro.format(n);
};

export const fF = (n: number | string) => {
	if (typeof n !== 'number') n = parseFloat(n);
	return n.toLocaleString('en-IE', { maximumFractionDigits: 2 });
};

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const logger = (shop:string, till:string, action:string, time:number, topRow:string, bottomRow:string) => {
	const shopStr = ch.underline.magenta(shop.concat(' ').concat(till));
	const duration = ch.dim(time.toString().padStart(3, '0') + 'ms');
	console.log(`${shopStr} ${ch.cyan(action)} ${duration} ${topRow}\n`);
	if (bottomRow) console.log(`${bottomRow}\n`);
};



export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	const scaleConversion = (
		valueA: number,
		scaleA: [number, number],
		scaleB: [number, number]
	) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (
		style: Record<string, number | string | undefined>
	): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, "");
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};