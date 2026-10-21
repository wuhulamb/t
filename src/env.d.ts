/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_TITLE?: string;
  readonly PUBLIC_SITE_TAGLINE?: string;
  readonly PUBLIC_SITE_DESCRIPTION?: string;
  readonly PUBLIC_SITE_AUTHOR?: string;
  readonly PUBLIC_REPO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
