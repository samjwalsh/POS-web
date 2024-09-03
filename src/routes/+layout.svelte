<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { settings, ThemeInit } from 'svelte-ux';

	settings();
</script>

<slot class="overflow-hidden"></slot>
<ModeWatcher />
<ThemeInit />

<style></style>
