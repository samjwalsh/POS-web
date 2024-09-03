<script lang="ts">
	import { Home, Clock, LineChart, Package2, Archive, Sun, Moon } from 'lucide-svelte/icons';
	import Menu from 'lucide-svelte/icons/menu';

	import { getSettings } from 'svelte-ux';
	import { mode } from 'mode-watcher';
	import { setMode } from 'mode-watcher';

	const { currentTheme, themes } = getSettings();

	const toggleTheme = () => {
		if ($mode === 'dark') {
			setMode('light');
			currentTheme.setTheme('light');
		} else {
			setMode('dark');
			currentTheme.setTheme('dark');
		}
	};

	import { page } from '$app/stores';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let menuItems = [
		{ name: 'Dashboard', link: 'dash', icon: Home },
		{ name: 'Stock', link: 'stock', icon: Archive },
		{ name: 'Time Keeping', link: 'time', icon: Clock },
		{ name: 'Analytics', link: 'analytics', icon: LineChart }
	];

	$: selected = $page.url.pathname.substring($page.url.pathname.lastIndexOf('/') + 1);
</script>

<div class="grid min-h-screen w-full md:grid-cols-[16rem_1fr]">
	<div class="hidden border-r bg-muted/40 md:block">
		<div class="flex h-full max-h-screen flex-col gap-2">
			<div class="flex h-14 items-center border-b px-4">
				<a href="/" class="flex items-center gap-2 font-semibold">
					<Package2 class="h-6 w-6" />
					<span class="">Queues</span>
				</a>
			</div>
			<div class="flex-1">
				<nav class="flex flex-col items-start px-2">
					{#each menuItems as section}
						<Button
							href={section.link}
							variant="ghost"
							class="w-full justify-start gap-2 hover:text-primary {selected === section.link
								? 'bg-muted'
								: 'text-muted-foreground'} "
						>
							<svelte:component this={section.icon} class="h-4 w-4" />
							{section.name}
						</Button>
					{/each}
				</nav>
			</div>
		</div>
	</div>
	<div class="flex flex-col">
		<header class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4">
			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button variant="outline" size="icon" class="shrink-0 md:hidden" builders={[builder]}>
						<Menu class="h-5 w-5" />
						<span class="sr-only">Toggle navigation menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="flex flex-col">
					<nav class="grid gap-2 text-lg font-medium">
						<Sheet.Close>
							<a href="/" class="flex items-center gap-2 text-lg font-semibold">
								<Package2 class="h-6 w-6" />
								<span class="sr-only">Acme Inc</span>
							</a>
						</Sheet.Close>
						{#each menuItems as section}
							<Sheet.Close>
								<a
									href={section.link}
									class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground {selected ===
									section.link
										? 'bg-muted'
										: 'text-muted-foreground'} "
								>
									<svelte:component this={section.icon} class="h-5 w-5" />
									{section.name}
								</a>
							</Sheet.Close>
						{/each}
					</nav>
				</Sheet.Content>
			</Sheet.Root>
			<div class="w-full flex-1">
				<h1>{menuItems.find((section) => section.link === selected).name}</h1>
			</div>
			<Button on:click={toggleTheme} variant="outline" size="icon">
				<Sun
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</header>
		<main class="no-scrollbar flex flex-1 flex-col gap-4 p-4">
			<ScrollArea orientation="vertical">
				<slot />
			</ScrollArea>
		</main>
	</div>
</div>
