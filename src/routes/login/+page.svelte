<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex h-screen items-center justify-center">
	<form method="POST" action="?/login">
		<Card.Root class="w-96">
			<Card.Header>
				<Card.Title>Login</Card.Title>
				<Card.Description>Enter your email and password.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="grid w-full items-center gap-4">
					<label>
						<Label for="email">Email</Label>
						<Input name="email" type="email" required />
					</label>
					<label>
						<Label for="password">Password</Label>
						<Input name="password" type="password" required />
					</label>
				</div>
			</Card.Content>
			<Card.Footer class="flex flex-row-reverse justify-between">
				<Button type="submit">Login</Button>
				<Button variant="outline">Reset</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
