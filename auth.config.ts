import { defineConfig } from 'auth-astro'
import GitHub from '@auth/core/providers/github'

export default defineConfig({
	providers: [
		GitHub({
			clientId: import.meta.env.GITHUB_CLIENT_ID,
			clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
		}),
	],
	callbacks: {
		async signIn({ user, /*account, profile, email, credentials*/ }) {
			if (user.id == import.meta.env.GITHUB_ADMIN_USER_ID) {
				return true;
			}
			return false;
		}
	}
});
