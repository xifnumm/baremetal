// Account types
export type {
	AccountType,
	AccountWithRelations,
	AccountWithActiveDeposits,
	CreateAccountInput,
	UpdateAccountInput,
	AccountSummary,
	AccountPortfolio,
} from './account';
export { ClientType } from './account';

// Deposit types
export type {
	DepositType,
	DepositWithAccount,
	DepositWithRelations,
	CreateDepositInput,
	DepositWithStatus,
	DepositSummary,
	DepositsByMetal,
	DepositFormData,
} from './deposit';
export { StorageType } from './deposit';

// Metal types
export type {
	MetalType,
	MetalPrice,
	MetalPrices,
	HoldingValuation,
	AccountValuation,
	MetalSummary,
	PlatformValuation,
	MetalTypeValuation,
	PortfolioComparison,
	MetalDistribution,
} from './metal';

// Storage types (withdrawals, inventory)
export type {
	WithdrawalType,
	WithdrawalWithRelations,
	CreateWithdrawalInput,
	WithdrawalSummary,
	InventorySummary,
	AccountInventory,
	InventoryByMetal,
	AllocatedBar,
	UnallocatedPoolSummary,
	AuditTrailEntry,
	AuditTrail,
	StorageStatistics,
	WithdrawalFormData,
} from './storage';

// Common types
export type {
	ApiResponse,
	PaginatedResponse,
	ApiError,
	FilterOptions,
	SortOptions,
	QueryParams,
	TableColumn,
	DashboardStats,
	FormState,
	ToastType,
	Toast,
} from './common';
