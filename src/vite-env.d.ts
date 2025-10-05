/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_WEATHERWISE_DEMO_MODE?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
