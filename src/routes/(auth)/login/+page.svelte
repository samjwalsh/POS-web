<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="flex h-screen items-center justify-center">
	<Card.Root class="w-96">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description
				>Enter your email and password below to login to your account</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form method="post" use:enhance class="flex flex-col gap-4">
				<Label for="username">Username</Label>
				<Input name="username" id="username" />
				<Label for="password">Password</Label>
				<Input type="password" name="password" id="password" />
				<Button type="submit" class="w-full">Continue</Button>
				
				{#if form?.message}
					<Alert.Root variant="destructive" class="h-full w-full">
						<CircleAlert class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>{form?.message}</Alert.Description>
					</Alert.Root>
				{/if}
			</form>
			<div class="mt-4 text-center text-sm">
				Don't have an account?
				<a href="/signup" class="underline">Sign up</a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
