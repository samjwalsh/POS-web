<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Button } from "$lib/components/ui/button"
	import { Badge } from "$lib/components/ui/badge"
</script>

<div class="flex h-screen items-center justify-center bg-gradient-to-b from-emerald-500 to-indigo-500">
	<Card.Root class="w-96">
		<Card.Header>
			<Card.Title>Login</Card.Title>
			<Card.Description>Enter your username and password.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label for="username">Username</Label>
					<Input id="username" />
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label for="password">Password</Label>
					<Input id="password" />
				</div>
			</div>
		</Card.Content>
		<Card.Footer class="flex justify-between">
			<Button variant="outline">Reset</Button>
			<Button>Login</Button>
		  </Card.Footer>
	</Card.Root>
</div>
<Badge class='absolute right-0 bottom-0 m-1'>v{__APP_VERSION__}</Badge>
