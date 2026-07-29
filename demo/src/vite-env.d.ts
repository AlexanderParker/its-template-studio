/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute URL of the deployed compile service, baked in at build time. */
  readonly VITE_ITS_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
