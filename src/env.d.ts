/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly GITHUB_CLIENT_ID: string;
    readonly GITHUB_CLIENT_SECRET: string;
    readonly AUTH_SECRET: string;

    readonly GITHUB_ADMIN_USER_ID: string;

    readonly DB_NAME: string;
    readonly DB_LOCATION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}