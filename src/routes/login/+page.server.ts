import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

        console.log(email);
        console.log(password);

		throw redirect(300,'/app/dash')
		return { success: true };
	},
} satisfies Actions;