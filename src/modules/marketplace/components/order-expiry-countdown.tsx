import Countdown from 'react-countdown';
import type { CountdownRenderProps } from 'react-countdown';

interface OrderExpiryCountdownProps {
	deadline: number;
}

function renderer({ hours, minutes, completed }: CountdownRenderProps) {
	if (completed) {
		return <span className='text-sm font-medium'>Expired</span>;
	}
	return (
		<span className='text-sm font-medium'>
			{hours.toString().padStart(2, '0')}h {minutes.toString().padStart(2, '0')}
			m
		</span>
	);
}

export function OrderExpiryCountdown({ deadline }: OrderExpiryCountdownProps) {
	const dateMs = deadline * 1000;
	return (
		<Countdown
			date={dateMs}
			renderer={renderer}
			intervalDelay={1000}
			key={deadline}
		/>
	);
}
