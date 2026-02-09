// API Response types
export type ApiResponse<T> = {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
};

// Paginated response
export type PaginatedResponse<T> = {
	data: T[];
	pagination: {
		page: number;
		pageSize: number;
		totalItems: number;
		totalPages: number;
	};
};

// Error types
export type ApiError = {
	message: string;
	code?: string;
	statusCode?: number;
	details?: Record<string, any>;
};

// Filter options
export type FilterOptions = {
	metalType?: string;
	storageType?: 'ALLOCATED' | 'UNALLOCATED';
	accountId?: string;
	startDate?: Date;
	endDate?: Date;
};

// Sort options
export type SortOptions = {
	field: string;
	direction: 'asc' | 'desc';
};

// Query parameters
export type QueryParams = {
	page?: number;
	pageSize?: number;
	sort?: SortOptions;
	filters?: FilterOptions;
};

// Table column definition (for UI)
export type TableColumn<T> = {
	key: keyof T;
	label: string;
	sortable?: boolean;
	render?: (value: any, row: T) => React.ReactNode;
};

// Dashboard statistics
export type DashboardStats = {
	totalAccounts: number;
	totalDeposits: number;
	totalWithdrawals: number;
	totalValue: number;
	activeDepositsCount: number;
	metalDistribution: Array<{
		metalType: string;
		quantity: number;
		value: number;
		percentage: number;
	}>;
	recentActivity: Array<{
		type: 'deposit' | 'withdrawal' | 'account';
		title: string;
		description: string;
		timestamp: Date;
	}>;
};

// Form state
export type FormState<T> = {
	data: T;
	errors: Partial<Record<keyof T, string>>;
	isSubmitting: boolean;
	isValid: boolean;
};

// Toast notification
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
};
