/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute URL of the deployed Python compile service, baked in at build time. */
  readonly VITE_ITS_API_URL?: string;
  /** Absolute URL of the deployed .NET compile service, baked in at build time. */
  readonly VITE_ITS_DOTNET_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
