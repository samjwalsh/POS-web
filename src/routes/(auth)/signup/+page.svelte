<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';

	let password;
	let comfirmPassword;
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="flex h-screen items-center justify-center">
	<Card.Root class="w-96">
		<Card.Header>
			<Card.Title class="text-2xl">Sign Up</Card.Title>
			<Card.Description
				>Enter your information to create an account. You must use the email you were invited with.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form method="post" use:enhance class="flex flex-col gap-4">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<Label for="first-name">First name</Label>
						<Input id="first-name" name="first-name" required />
					</div>
					<div>
						<Label for="last-name">Last name</Label>
						<Input id="last-name" name='last-name' placeholder="" required />
					</div>
				</div>
				<Label for="username">Username</Label>
				<Input name="username" id="username" />
				<Label for="password">Password</Label>
				<Input type="password" name="password" id="password" />
				<Label for="confirm">Confirm Password</Label>
				<Input type="password" name="confirm" id="confirm" />
				<Button type="submit" class="w-full">Create an account</Button>

				{#if form?.message}
					<Alert.Root variant="destructive" class="h-full w-full">
						<CircleAlert class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>{form?.message}</Alert.Description>
					</Alert.Root>
				{/if}
			</form>
			<div class="mt-4 text-center text-sm">
				Already have an account?
				<a href="/login" class="underline"> Sign in </a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
