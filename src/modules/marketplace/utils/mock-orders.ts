import type { Order } from '@/modules/marketplace/types/marketplace.types';

const now = Math.floor(Date.now() / 1000);
const h = (hours: number, minutes: number) => now + hours * 3600 + minutes * 60;

export const mockOrders: Order[] = [
	{
		id: '1234',
		direction: 'SELL_WETH',
		amount: 10.0,
		token: 'WETH',
		delta: 50,
		minAmountOut: 25000,
		deadline: h(5, 20),
	},
	{
		id: '1235',
		direction: 'SELL_USDC',
		amount: 50000,
		token: 'USDC',
		delta: -30,
		minAmountOut: 15.5,
		deadline: h(3, 45),
	},
	{
		id: '1236',
		direction: 'SELL_WETH',
		amount: 25.0,
		token: 'WETH',
		delta: 75,
		minAmountOut: 60000,
		deadline: h(8, 10),
	},
	{
		id: '1237',
		direction: 'SELL_USDC',
		amount: 100000,
		token: 'USDC',
		delta: -50,
		minAmountOut: 32.0,
		deadline: h(2, 30),
	},
	{
		id: '1238',
		direction: 'SELL_WETH',
		amount: 5.5,
		token: 'WETH',
		delta: 25,
		minAmountOut: 15000,
		deadline: h(6, 0),
	},
	{
		id: '1239',
		direction: 'SELL_USDC',
		amount: 75000,
		token: 'USDC',
		delta: -20,
		minAmountOut: 24.5,
		deadline: h(4, 15),
	},
];
