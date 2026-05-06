// Minimal ABIs for frontend wagmi hooks

export const PROPERTY_NFT_ABI = [
  { name: "getPropertyData", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "willowPropertyId", type: "string" },
      { name: "metadataURI",      type: "string" },
      { name: "location",         type: "string" },
      { name: "valuationNaira",   type: "uint256" },
      { name: "uosScore",         type: "uint256" },
      { name: "isVerified",       type: "bool" },
      { name: "registeredAt",     type: "uint256" },
    ]}]
  },
  { name: "ownerOf",     type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "address" }] },
  { name: "tokenCounter", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "propertyOwner", type: "function", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "address" }] },
] as const;

export const LEASE_ABI = [
  { name: "status",             type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
  { name: "nextPaymentDue",     type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "isRentOverdue",      type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "bool" }] },
  { name: "paymentsCompleted",  type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "totalExpected",      type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "monthlyRentUSDC",    type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "depositAmount",      type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "landlord",           type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "address" }] },
  { name: "tenant",             type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "address" }] },
  { name: "leaseStart",         type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "getRemainingTenure", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "activateLease",      type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "payRent",            type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "terminateLease",     type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "reason", type: "string" }], outputs: [] },
  { name: "releaseDeposit",     type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "fullReturn", type: "bool" }], outputs: [] },
] as const;

export const FRACTIONAL_ABI = [
  { name: "getShareHolder", type: "function", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "shares",     type: "uint256" },
      { name: "percentage", type: "uint256" },
      { name: "yieldOwed",  type: "uint256" },
    ]
  },
  { name: "totalShares",          type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "totalYieldDistributed", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "isLiquidated",         type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "bool" }] },
  { name: "claimYield",           type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

export const ESCROW_ABI = [
  { name: "bookings", type: "function", stateMutability: "view",
    inputs: [{ name: "bookingId", type: "bytes32" }],
    outputs: [{ name: "", type: "tuple", components: [
      { name: "guest",            type: "address" },
      { name: "host",             type: "address" },
      { name: "propertyNFTId",    type: "uint256" },
      { name: "totalUSDC",        type: "uint256" },
      { name: "serviceFeeUSDC",   type: "uint256" },
      { name: "checkinTime",      type: "uint256" },
      { name: "checkoutTime",     type: "uint256" },
      { name: "bookingReference", type: "string" },
      { name: "status",           type: "uint8" },
    ]}]
  },
  { name: "createBooking",   type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "host",       type: "address" },
      { name: "nftTokenId", type: "uint256" },
      { name: "totalUSDC",  type: "uint256" },
      { name: "checkinTime",  type: "uint256" },
      { name: "checkoutTime", type: "uint256" },
      { name: "reference",    type: "string" },
    ],
    outputs: [{ name: "bookingId", type: "bytes32" }]
  },
  { name: "confirmCheckin", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "bookingId", type: "bytes32" }], outputs: [] },
  { name: "requestRefund",  type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "bookingId", type: "bytes32" }], outputs: [] },
  { name: "completeStay",   type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "bookingId", type: "bytes32" }], outputs: [] },
] as const;

export const POOL_ABI = [
  { name: "balanceOf",      type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "totalRaisedUSDC",  type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "targetRaiseUSDC",  type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "investorCount",    type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "minInvestmentUSDC", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "status",           type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
  { name: "invest",           type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "usdcAmount", type: "uint256" }], outputs: [] },
  { name: "redeem",           type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "poolTokens", type: "uint256" }], outputs: [] },
] as const;
