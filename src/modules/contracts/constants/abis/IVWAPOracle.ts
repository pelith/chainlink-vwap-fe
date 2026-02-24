export const IVWAPOracleAbi = [
	{
		type: 'function',
		name: 'getPrice',
		inputs: [
			{
				name: 'startTime',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'endTime',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: 'price',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
] as const;
