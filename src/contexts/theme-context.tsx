import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { type Theme, getThemeVariables } from '@/config/themes';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	isDarkMode: boolean;
	toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window === 'undefined') return 'bamboo';
		const saved = localStorage.getItem('theme');
		return (saved as Theme) || 'bamboo';
	});

	const [isDarkMode, setIsDarkMode] = useState(() => {
		if (typeof window === 'undefined') return false;
		const saved = localStorage.getItem('darkMode');
		return saved ? (JSON.parse(saved) as boolean) : false;
	});

	useEffect(() => {
		// 1. Set data-theme attribute
		document.documentElement.setAttribute('data-theme', theme);

		// 2. Set dark class
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}

		// 3. Runtime CSS variables injection (backup strategy)
		const themeVars = getThemeVariables(theme, isDarkMode);
		for (const [key, value] of Object.entries(themeVars)) {
			document.documentElement.style.setProperty(key, value);
		}

		// 4. Handle Bamboo background image
		if (theme === 'bamboo') {
			document.body.classList.add('theme-bamboo');
		} else {
			document.body.classList.remove('theme-bamboo');
		}

		// 5. LocalStorage persistence
		localStorage.setItem('theme', theme);
		localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
	}, [theme, isDarkMode]);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	const toggleDarkMode = () => {
		setIsDarkMode((prev) => !prev);
	};

	return (
		<ThemeContext.Provider
			value={{ theme, setTheme, isDarkMode, toggleDarkMode }}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
