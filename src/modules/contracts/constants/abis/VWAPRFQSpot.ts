export const VWAPRFQSpotAbi = [
	{
		type: 'constructor',
		inputs: [
			{
				name: '_usdc',
				type: 'address',
				internalType: 'address',
			},
			{
				name: '_weth',
				type: 'address',
				internalType: 'address',
			},
			{
				name: '_oracle',
				type: 'address',
				internalType: 'address',
			},
			{
				name: '_refundGrace',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'DOMAIN_SEPARATOR',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'ORDER_TYPEHASH',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'REFUND_GRACE',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'USDC',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'contract IERC20',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'VWAP_WINDOW',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'WETH',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'contract IERC20',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'cancelOrderHash',
		inputs: [
			{
				name: 'orderHash',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		outputs: [],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'fill',
		inputs: [
			{
				name: 'order',
				type: 'tuple',
				internalType: 'struct VWAPRFQSpot.Order',
				components: [
					{
						name: 'maker',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'makerIsSellETH',
						type: 'bool',
						internalType: 'bool',
					},
					{
						name: 'amountIn',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'minAmountOut',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'deltaBps',
						type: 'int32',
						internalType: 'int32',
					},
					{
						name: 'salt',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'deadline',
						type: 'uint256',
						internalType: 'uint256',
					},
				],
			},
			{
				name: 'signature',
				type: 'bytes',
				internalType: 'bytes',
			},
			{
				name: 'takerAmountIn',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
		outputs: [
			{
				name: 'tradeId',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'getTrade',
		inputs: [
			{
				name: 'tradeId',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		outputs: [
			{
				name: '',
				type: 'tuple',
				internalType: 'struct VWAPRFQSpot.Trade',
				components: [
					{
						name: 'maker',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'taker',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'makerIsSellETH',
						type: 'bool',
						internalType: 'bool',
					},
					{
						name: 'makerAmountIn',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'takerDeposit',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'deltaBps',
						type: 'int32',
						internalType: 'int32',
					},
					{
						name: 'startTime',
						type: 'uint64',
						internalType: 'uint64',
					},
					{
						name: 'endTime',
						type: 'uint64',
						internalType: 'uint64',
					},
					{
						name: 'status',
						type: 'uint8',
						internalType: 'enum VWAPRFQSpot.Status',
					},
				],
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'hashOrder',
		inputs: [
			{
				name: 'order',
				type: 'tuple',
				internalType: 'struct VWAPRFQSpot.Order',
				components: [
					{
						name: 'maker',
						type: 'address',
						internalType: 'address',
					},
					{
						name: 'makerIsSellETH',
						type: 'bool',
						internalType: 'bool',
					},
					{
						name: 'amountIn',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'minAmountOut',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'deltaBps',
						type: 'int32',
						internalType: 'int32',
					},
					{
						name: 'salt',
						type: 'uint256',
						internalType: 'uint256',
					},
					{
						name: 'deadline',
						type: 'uint256',
						internalType: 'uint256',
					},
				],
			},
		],
		outputs: [
			{
				name: '',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'oracle',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'contract IVWAPOracle',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'refund',
		inputs: [
			{
				name: 'tradeId',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		outputs: [],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'settle',
		inputs: [
			{
				name: 'tradeId',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		outputs: [],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'trades',
		inputs: [
			{
				name: '',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		outputs: [
			{
				name: 'maker',
				type: 'address',
				internalType: 'address',
			},
			{
				name: 'taker',
				type: 'address',
				internalType: 'address',
			},
			{
				name: 'makerIsSellETH',
				type: 'bool',
				internalType: 'bool',
			},
			{
				name: 'makerAmountIn',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'takerDeposit',
				type: 'uint256',
				internalType: 'uint256',
			},
			{
				name: 'deltaBps',
				type: 'int32',
				internalType: 'int32',
			},
			{
				name: 'startTime',
				type: 'uint64',
				internalType: 'uint64',
			},
			{
				name: 'endTime',
				type: 'uint64',
				internalType: 'uint64',
			},
			{
				name: 'status',
				type: 'uint8',
				internalType: 'enum VWAPRFQSpot.Status',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'used',
		inputs: [
			{
				name: '',
				type: 'address',
				internalType: 'address',
			},
			{
				name: '',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
		outputs: [
			{
				name: '',
				type: 'bool',
				internalType: 'bool',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'event',
		name: 'Cancelled',
		inputs: [
			{
				name: 'maker',
				type: 'address',
				indexed: true,
				internalType: 'address',
			},
			{
				name: 'orderHash',
				type: 'bytes32',
				indexed: true,
				internalType: 'bytes32',
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'Filled',
		inputs: [
			{
				name: 'maker',
				type: 'address',
				indexed: true,
				internalType: 'address',
			},
			{
				name: 'taker',
				type: 'address',
				indexed: true,
				internalType: 'address',
			},
			{
				name: 'orderHash',
				type: 'bytes32',
				indexed: true,
				internalType: 'bytes32',
			},
			{
				name: 'startTime',
				type: 'uint64',
				indexed: false,
				internalType: 'uint64',
			},
			{
				name: 'endTime',
				type: 'uint64',
				indexed: false,
				internalType: 'uint64',
			},
			{
				name: 'makerAmountIn',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
			{
				name: 'takerDeposit',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
			{
				name: 'makerIsSellETH',
				type: 'bool',
				indexed: false,
				internalType: 'bool',
			},
			{
				name: 'deltaBps',
				type: 'int32',
				indexed: false,
				internalType: 'int32',
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'Refunded',
		inputs: [
			{
				name: 'tradeId',
				type: 'bytes32',
				indexed: true,
				internalType: 'bytes32',
			},
			{
				name: 'makerRefund',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
			{
				name: 'takerRefund',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'Settled',
		inputs: [
			{
				name: 'tradeId',
				type: 'bytes32',
				indexed: true,
				internalType: 'bytes32',
			},
			{
				name: 'usdcPerEth',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
			{
				name: 'adjustedPrice',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
			{
				name: 'makerPayout',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
			{
				name: 'takerPayout',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
			{
				name: 'makerRefund',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
			{
				name: 'takerRefund',
				type: 'uint256',
				indexed: false,
				internalType: 'uint256',
			},
		],
		anonymous: false,
	},
	{
		type: 'error',
		name: 'BadSignature',
		inputs: [],
	},
	{
		type: 'error',
		name: 'DeltaInvalid',
		inputs: [],
	},
	{
		type: 'error',
		name: 'ECDSAInvalidSignature',
		inputs: [],
	},
	{
		type: 'error',
		name: 'ECDSAInvalidSignatureLength',
		inputs: [
			{
				name: 'length',
				type: 'uint256',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'error',
		name: 'ECDSAInvalidSignatureS',
		inputs: [
			{
				name: 's',
				type: 'bytes32',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'error',
		name: 'ExpiredOrder',
		inputs: [],
	},
	{
		type: 'error',
		name: 'NotMatured',
		inputs: [],
	},
	{
		type: 'error',
		name: 'OrderUsed',
		inputs: [],
	},
	{
		type: 'error',
		name: 'ReentrancyGuardReentrantCall',
		inputs: [],
	},
	{
		type: 'error',
		name: 'RefundNotAvailable',
		inputs: [],
	},
	{
		type: 'error',
		name: 'SafeERC20FailedOperation',
		inputs: [
			{
				name: 'token',
				type: 'address',
				internalType: 'address',
			},
		],
	},
	{
		type: 'error',
		name: 'TakerTooSmall',
		inputs: [],
	},
	{
		type: 'error',
		name: 'TooLateToSettle',
		inputs: [],
	},
	{
		type: 'error',
		name: 'TradeNotOpen',
		inputs: [],
	},
] as const;
