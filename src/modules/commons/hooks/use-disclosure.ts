import { useMemo, useRef, useState } from 'react';
export interface UseDisclosureProps {
	defaultOpen?: boolean;
	onOpen?: () => void;
	onClose?: () => void;
	onToggle?: (value: boolean) => void;
}
export function useDisclosure(props?: UseDisclosureProps) {
	const [isOpen, setIsOpen] = useState(props?.defaultOpen ?? false);
	const propsRef = useRef({
		props,
	});
	propsRef.current.props = props;
	// biome-ignore lint/correctness/useExhaustiveDependencies: we need to memoize the actions to avoid re-rendering the component when the props change
	const actions = useMemo(() => {
		return {
			onOpen: () => {
				setIsOpen(true);
				propsRef.current.props?.onOpen?.();
			},
			onClose: () => {
				setIsOpen(false);
				propsRef.current.props?.onClose?.();
			},
			onToggle: () => {
				setIsOpen((open) => !open);
				propsRef.current.props?.onToggle?.(isOpen);
			},
			setOpen: (open: boolean) => {
				setIsOpen(open);
			},
		};
	}, [setIsOpen]);

	return {
		isOpen,
		...actions,
	};
}
