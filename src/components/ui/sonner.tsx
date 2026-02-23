'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '@/contexts/theme-context';

const Toaster = (props: ToasterProps) => {
	const { isDarkMode } = useTheme();
	const theme = isDarkMode ? 'dark' : 'light';

	return (
		<Sonner
			theme={theme}
			className='toaster group'
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
