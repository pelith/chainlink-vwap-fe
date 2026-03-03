export type Theme = 'bamboo' | 'aurora' | 'gold';

export interface ThemeMetadata {
	id: Theme;
	name: string;
	description: string;
	icon: string;
}

export const THEMES: Record<Theme, ThemeMetadata> = {
	bamboo: {
		id: 'bamboo',
		name: 'Bamboo & Flow',
		description: '綠竹流水 - 翠綠與流水藍的東方質感',
		icon: '🎋',
	},
	aurora: {
		id: 'aurora',
		name: 'Northern Future',
		description: '未來極光 - 紫紅與青綠的科技未來感',
		icon: '🌌',
	},
	gold: {
		id: 'gold',
		name: 'Digital Gold',
		description: '數位黃金 - 金色與深灰的價值信任',
		icon: '💰',
	},
};

export interface ThemeVariables {
	'--background': string;
	'--foreground': string;
	'--card': string;
	'--card-foreground': string;
	'--popover': string;
	'--popover-foreground': string;
	'--primary': string;
	'--primary-foreground': string;
	'--secondary': string;
	'--secondary-foreground': string;
	'--muted': string;
	'--muted-foreground': string;
	'--accent': string;
	'--accent-foreground': string;
	'--destructive': string;
	'--destructive-foreground': string;
	'--border': string;
	'--input': string;
	'--ring': string;
	'--chart-1': string;
	'--chart-2': string;
	'--chart-3': string;
	'--chart-4': string;
	'--chart-5': string;
	'--radius': string;
	'--sidebar': string;
	'--sidebar-foreground': string;
	'--sidebar-primary': string;
	'--sidebar-primary-foreground': string;
	'--sidebar-accent': string;
	'--sidebar-accent-foreground': string;
	'--sidebar-border': string;
	'--sidebar-ring': string;
}

// Bamboo Theme - Light Mode
const bambooLight: ThemeVariables = {
	'--background': 'transparent',
	'--foreground': 'oklch(0.15 0.05 210)',
	'--card': 'oklch(0.99 0.01 150 / 0.85)',
	'--card-foreground': 'oklch(0.15 0.05 210)',
	'--popover': 'oklch(0.99 0.01 150 / 0.95)',
	'--popover-foreground': 'oklch(0.15 0.05 210)',
	'--primary': 'oklch(0.7 0.25 160)',
	'--primary-foreground': 'oklch(0.98 0.01 160)',
	'--secondary': 'oklch(0.6 0.18 230)',
	'--secondary-foreground': 'oklch(1 0 0)',
	'--muted': 'oklch(0.95 0.015 150 / 0.7)',
	'--muted-foreground': 'oklch(0.4 0.05 210)',
	'--accent': 'oklch(0.93 0.03 210)',
	'--accent-foreground': 'oklch(0.15 0.05 210)',
	'--destructive': 'oklch(0.577 0.245 27.325)',
	'--destructive-foreground': 'oklch(1 0 0)',
	'--border': 'oklch(0.9 0.025 150)',
	'--input': 'oklch(0.9 0.025 150)',
	'--ring': 'oklch(0.7 0.25 160)',
	'--chart-1': 'oklch(0.7 0.25 160)',
	'--chart-2': 'oklch(0.6 0.18 230)',
	'--chart-3': 'oklch(0.6 0.2 190)',
	'--chart-4': 'oklch(0.75 0.2 140)',
	'--chart-5': 'oklch(0.55 0.18 200)',
	'--radius': '0.625rem',
	'--sidebar': 'oklch(0.975 0.012 150)',
	'--sidebar-foreground': 'oklch(0.15 0.05 210)',
	'--sidebar-primary': 'oklch(0.7 0.25 160)',
	'--sidebar-primary-foreground': 'oklch(0.98 0.01 160)',
	'--sidebar-accent': 'oklch(0.95 0.015 150)',
	'--sidebar-accent-foreground': 'oklch(0.15 0.05 210)',
	'--sidebar-border': 'oklch(0.9 0.025 150)',
	'--sidebar-ring': 'oklch(0.7 0.25 160)',
};

// Bamboo Theme - Dark Mode
const bambooDark: ThemeVariables = {
	'--background': 'transparent',
	'--foreground': 'oklch(0.95 0.02 160)',
	'--card': 'oklch(0.15 0.025 230 / 0.9)',
	'--card-foreground': 'oklch(0.95 0.02 160)',
	'--popover': 'oklch(0.15 0.025 230 / 0.95)',
	'--popover-foreground': 'oklch(0.95 0.02 160)',
	'--primary': 'oklch(0.75 0.2 160)',
	'--primary-foreground': 'oklch(0.1 0.05 160)',
	'--secondary': 'oklch(0.65 0.15 230)',
	'--secondary-foreground': 'oklch(0.1 0.05 230)',
	'--muted': 'oklch(0.18 0.03 230 / 0.8)',
	'--muted-foreground': 'oklch(0.7 0.03 210)',
	'--accent': 'oklch(0.25 0.08 230)',
	'--accent-foreground': 'oklch(0.95 0.02 160)',
	'--destructive': 'oklch(0.5 0.2 25)',
	'--destructive-foreground': 'oklch(0.95 0.01 25)',
	'--border': 'oklch(0.2 0.04 230)',
	'--input': 'oklch(0.2 0.04 230)',
	'--ring': 'oklch(0.75 0.2 160)',
	'--chart-1': 'oklch(0.75 0.2 160)',
	'--chart-2': 'oklch(0.65 0.15 230)',
	'--chart-3': 'oklch(0.7 0.18 190)',
	'--chart-4': 'oklch(0.8 0.18 140)',
	'--chart-5': 'oklch(0.6 0.16 200)',
	'--radius': '0.625rem',
	'--sidebar': 'oklch(0.12 0.02 230)',
	'--sidebar-foreground': 'oklch(0.95 0.02 160)',
	'--sidebar-primary': 'oklch(0.75 0.2 160)',
	'--sidebar-primary-foreground': 'oklch(0.1 0.05 160)',
	'--sidebar-accent': 'oklch(0.18 0.03 230)',
	'--sidebar-accent-foreground': 'oklch(0.95 0.02 160)',
	'--sidebar-border': 'oklch(0.2 0.04 230)',
	'--sidebar-ring': 'oklch(0.75 0.2 160)',
};

// Aurora Theme - Light Mode
const auroraLight: ThemeVariables = {
	'--background': 'oklch(0.99 0.005 280)',
	'--foreground': 'oklch(0.1 0.05 280)',
	'--card': 'oklch(0.985 0.008 280)',
	'--card-foreground': 'oklch(0.1 0.05 280)',
	'--popover': 'oklch(0.99 0.005 280)',
	'--popover-foreground': 'oklch(0.1 0.05 280)',
	'--primary': 'oklch(0.6 0.2 330)',
	'--primary-foreground': 'oklch(1 0 0)',
	'--secondary': 'oklch(0.7 0.15 190)',
	'--secondary-foreground': 'oklch(0.1 0.05 190)',
	'--muted': 'oklch(0.96 0.01 280)',
	'--muted-foreground': 'oklch(0.5 0.05 280)',
	'--accent': 'oklch(0.94 0.03 330)',
	'--accent-foreground': 'oklch(0.4 0.15 330)',
	'--destructive': 'oklch(0.577 0.245 27.325)',
	'--destructive-foreground': 'oklch(1 0 0)',
	'--border': 'oklch(0.92 0.01 280)',
	'--input': 'oklch(0.92 0.01 280)',
	'--ring': 'oklch(0.6 0.2 330)',
	'--chart-1': 'oklch(0.6 0.2 330)',
	'--chart-2': 'oklch(0.7 0.15 190)',
	'--chart-3': 'oklch(0.65 0.18 280)',
	'--chart-4': 'oklch(0.7 0.18 310)',
	'--chart-5': 'oklch(0.65 0.16 210)',
	'--radius': '0.625rem',
	'--sidebar': 'oklch(0.985 0.008 280)',
	'--sidebar-foreground': 'oklch(0.1 0.05 280)',
	'--sidebar-primary': 'oklch(0.6 0.2 330)',
	'--sidebar-primary-foreground': 'oklch(1 0 0)',
	'--sidebar-accent': 'oklch(0.96 0.01 280)',
	'--sidebar-accent-foreground': 'oklch(0.4 0.15 330)',
	'--sidebar-border': 'oklch(0.92 0.01 280)',
	'--sidebar-ring': 'oklch(0.6 0.2 330)',
};

// Aurora Theme - Dark Mode
const auroraDark: ThemeVariables = {
	'--background': 'oklch(0.12 0.03 280)',
	'--foreground': 'oklch(0.95 0.02 280)',
	'--card': 'oklch(0.15 0.04 280)',
	'--card-foreground': 'oklch(0.95 0.02 280)',
	'--popover': 'oklch(0.15 0.04 280)',
	'--popover-foreground': 'oklch(0.95 0.02 280)',
	'--primary': 'oklch(0.7 0.25 330)',
	'--primary-foreground': 'oklch(0.98 0.01 330)',
	'--secondary': 'oklch(0.75 0.18 190)',
	'--secondary-foreground': 'oklch(0.1 0.05 190)',
	'--muted': 'oklch(0.2 0.02 280)',
	'--muted-foreground': 'oklch(0.65 0.04 280)',
	'--accent': 'oklch(0.3 0.12 330)',
	'--accent-foreground': 'oklch(0.95 0.02 330)',
	'--destructive': 'oklch(0.5 0.2 25)',
	'--destructive-foreground': 'oklch(0.95 0.01 25)',
	'--border': 'oklch(0.25 0.04 280)',
	'--input': 'oklch(0.25 0.04 280)',
	'--ring': 'oklch(0.7 0.25 330)',
	'--chart-1': 'oklch(0.7 0.25 330)',
	'--chart-2': 'oklch(0.75 0.18 190)',
	'--chart-3': 'oklch(0.68 0.2 280)',
	'--chart-4': 'oklch(0.72 0.22 310)',
	'--chart-5': 'oklch(0.7 0.18 210)',
	'--radius': '0.625rem',
	'--sidebar': 'oklch(0.12 0.03 280)',
	'--sidebar-foreground': 'oklch(0.95 0.02 280)',
	'--sidebar-primary': 'oklch(0.7 0.25 330)',
	'--sidebar-primary-foreground': 'oklch(0.98 0.01 330)',
	'--sidebar-accent': 'oklch(0.2 0.02 280)',
	'--sidebar-accent-foreground': 'oklch(0.95 0.02 330)',
	'--sidebar-border': 'oklch(0.25 0.04 280)',
	'--sidebar-ring': 'oklch(0.7 0.25 330)',
};

// Gold Theme - Light Mode
const goldLight: ThemeVariables = {
	'--background': 'oklch(0.98 0.005 60)',
	'--foreground': 'oklch(0.15 0.01 60)',
	'--card': 'oklch(0.985 0.008 60)',
	'--card-foreground': 'oklch(0.15 0.01 60)',
	'--popover': 'oklch(0.98 0.005 60)',
	'--popover-foreground': 'oklch(0.15 0.01 60)',
	'--primary': 'oklch(0.75 0.12 70)',
	'--primary-foreground': 'oklch(1 0 0)',
	'--secondary': 'oklch(0.3 0.02 60)',
	'--secondary-foreground': 'oklch(1 0 0)',
	'--muted': 'oklch(0.92 0.01 60)',
	'--muted-foreground': 'oklch(0.5 0.02 60)',
	'--accent': 'oklch(0.95 0.03 70)',
	'--accent-foreground': 'oklch(0.5 0.1 70)',
	'--destructive': 'oklch(0.577 0.245 27.325)',
	'--destructive-foreground': 'oklch(1 0 0)',
	'--border': 'oklch(0.88 0.01 60)',
	'--input': 'oklch(0.88 0.01 60)',
	'--ring': 'oklch(0.75 0.12 70)',
	'--chart-1': 'oklch(0.75 0.12 70)',
	'--chart-2': 'oklch(0.3 0.02 60)',
	'--chart-3': 'oklch(0.65 0.1 65)',
	'--chart-4': 'oklch(0.8 0.1 75)',
	'--chart-5': 'oklch(0.55 0.08 55)',
	'--radius': '0.625rem',
	'--sidebar': 'oklch(0.975 0.008 60)',
	'--sidebar-foreground': 'oklch(0.15 0.01 60)',
	'--sidebar-primary': 'oklch(0.75 0.12 70)',
	'--sidebar-primary-foreground': 'oklch(1 0 0)',
	'--sidebar-accent': 'oklch(0.92 0.01 60)',
	'--sidebar-accent-foreground': 'oklch(0.5 0.1 70)',
	'--sidebar-border': 'oklch(0.88 0.01 60)',
	'--sidebar-ring': 'oklch(0.75 0.12 70)',
};

// Gold Theme - Dark Mode
const goldDark: ThemeVariables = {
	'--background': 'oklch(0.12 0.015 60)',
	'--foreground': 'oklch(0.95 0.01 60)',
	'--card': 'oklch(0.15 0.02 60)',
	'--card-foreground': 'oklch(0.95 0.01 60)',
	'--popover': 'oklch(0.15 0.02 60)',
	'--popover-foreground': 'oklch(0.95 0.01 60)',
	'--primary': 'oklch(0.8 0.14 70)',
	'--primary-foreground': 'oklch(0.1 0.02 70)',
	'--secondary': 'oklch(0.7 0.02 60)',
	'--secondary-foreground': 'oklch(0.1 0.01 60)',
	'--muted': 'oklch(0.2 0.015 60)',
	'--muted-foreground': 'oklch(0.65 0.02 60)',
	'--accent': 'oklch(0.25 0.05 70)',
	'--accent-foreground': 'oklch(0.95 0.01 70)',
	'--destructive': 'oklch(0.5 0.2 25)',
	'--destructive-foreground': 'oklch(0.95 0.01 25)',
	'--border': 'oklch(0.25 0.02 60)',
	'--input': 'oklch(0.25 0.02 60)',
	'--ring': 'oklch(0.8 0.14 70)',
	'--chart-1': 'oklch(0.8 0.14 70)',
	'--chart-2': 'oklch(0.7 0.02 60)',
	'--chart-3': 'oklch(0.72 0.12 65)',
	'--chart-4': 'oklch(0.85 0.12 75)',
	'--chart-5': 'oklch(0.6 0.1 55)',
	'--radius': '0.625rem',
	'--sidebar': 'oklch(0.12 0.015 60)',
	'--sidebar-foreground': 'oklch(0.95 0.01 60)',
	'--sidebar-primary': 'oklch(0.8 0.14 70)',
	'--sidebar-primary-foreground': 'oklch(0.1 0.02 70)',
	'--sidebar-accent': 'oklch(0.2 0.015 60)',
	'--sidebar-accent-foreground': 'oklch(0.95 0.01 70)',
	'--sidebar-border': 'oklch(0.25 0.02 60)',
	'--sidebar-ring': 'oklch(0.8 0.14 70)',
};

export function getThemeVariables(
	theme: Theme,
	isDarkMode: boolean,
): ThemeVariables {
	if (theme === 'bamboo') {
		return isDarkMode ? bambooDark : bambooLight;
	}
	if (theme === 'aurora') {
		return isDarkMode ? auroraDark : auroraLight;
	}
	if (theme === 'gold') {
		return isDarkMode ? goldDark : goldLight;
	}
	return bambooLight; // fallback
}

