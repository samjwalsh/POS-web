import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { default as ch } from 'chalk';
import { dev } from '$app/environment';

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

export const logger = (shop: string, till: string, action: string, time: number, topRow: string, bottomRow: string) => {
	const shopStr = ch.underline.magenta(shop.concat(' ').concat(till));
	const duration = ch.dim(time.toString().padStart(3, '0') + 'ms');
	console.log(`${shopStr} ${ch.cyan(action)} ${duration} ${topRow}\n`);
	if (bottomRow) console.log(`${bottomRow}\n`);
};

export const Timer = class {
	static quantity = 0;
	#number: number;
	#start: Date;
	constructor() {
		this.#number = Timer.quantity;
		this.#start = new Date();
		if (!dev) return;
		Timer.quantity++;
	}
	time(message: string) {
		if (!dev) return;
		const now = new Date();

		const number = this.#number;
		let numStr = ''
		switch (number % 6) {
			case 0: {
				numStr = ch.red(number);
				break;
			}
			case 1: {
				numStr = ch.green(number);
				break;
			}
			case 2: {
				numStr = ch.yellow(number);
				break;
			}
			case 3: {
				numStr = ch.blue(number);
				break;
			}
			case 4: {
				numStr = ch.magenta(number);
				break;
			}
			case 5: {
				numStr = ch.cyan(number);
			}
		}

		const time = now.getTime() - this.#start.getTime();
		let timeStr = time.toString()
		while (timeStr.length < 5) {
			timeStr = ' ' + timeStr;
		}

		switch (true) {
			case (time < 5): {
				timeStr = ch.cyan(time);
				break;
			}
			case (time < 30): {
				timeStr = ch.green(time);
				break;
			}
			case (time < 100): {
				timeStr = ch.yellow(time);
				break;
			}
			default: {
				timeStr = ch.red(time);
			}
		}

		console.log(`${numStr} ${timeStr}| ${message}`);
		this.#start = now;
	}
}



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