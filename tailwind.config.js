/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: [
		'./src/**/*.{html,ts}', // Adjust the paths to match your project structure
	],
	content: [
		"./src/**/*.{html,ts}", // Inclua os arquivos do projeto
		"./node_modules/@angular/material/**/*.js", // Adicione o Angular Material
	],
	theme: {
		extend: {
			spacing: {
				"wrapper": "var(--wrapper)",
			},
			colors: {
				// Usando variáveis CSS para temas dinâmicos
				primary: "var(--mat-sys-primary)",
				"on-primary": "var(--mat-sys-on-primary)",
				"primary-container": "var(--mat-sys-primary-container)",
				"on-primary-container": "var(--mat-sys-on-primary-container)",
				secondary: "var(--mat-sys-secondary)",
				"on-secondary": "var(--mat-sys-on-secondary)",
				"secondary-container": "var(--mat-sys-secondary-container)",
				"on-secondary-container": "var(--mat-sys-on-secondary-container)",
				tertiary: "var(--mat-sys-tertiary)",
				"on-tertiary": "var(--mat-sys-on-tertiary)",
				"tertiary-container": "var(--mat-sys-tertiary-container)",
				"on-tertiary-container": "var(--mat-sys-on-tertiary-container)",
				background: "var(--mat-sys-background)",
				"on-background": "var(--mat-sys-on-background)",
				surface: "var(--mat-sys-surface)",
				"on-surface": "var(--mat-sys-on-surface)",
				"on-surface-variant": "var(--mat-sys-on-surface-variant)",
				"surface-container": "var(--mat-sys-surface-container)",
				"on-surface-container": "var(--mat-sys-on-surface-container)",
				"surface-container-low": "var(--mat-sys-surface-container-low)",
				"on-surface-container-low": "var(--mat-sys-on-surface-container-low)",
				"surface-container-high": "var(--mat-sys-surface-container-high)",
				"inverse-on-surface": "var(--mat-sys-inverse-on-surface)",
				outline: "var(--mat-sys-outline)",
				"outline-variant": "var(--mat-sys-outline-variant)",
				error: "var(--mat-sys-error)",
				"error-container": "var(--mat-sys-error-container)",
				"on-error": "var(--mat-sys-on-error)",
				"on-error-container": "var(--mat-sys-on-error-container)",
				"surface-variant": "var(--mat-sys-surface-variant)",
				"on-surface-variant": "var(--mat-sys-on-surface-variant)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
	darkMode: "class", // Enables dark mode with the class attribute
};
