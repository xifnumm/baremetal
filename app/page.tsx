import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatNumber } from '@/lib/utils';

// Hardcoded metal prices
const METAL_PRICES = {
	Gold: 60000,
	Silver: 800,
	Platinum: 35000,
};

async function getDashboardStats() {
	const [accounts, deposits, withdrawals] = await Promise.all([
		prisma.account.count(),
		prisma.deposits.findMany({
			where: { remainingQuantity: { gt: 0 } },
		}),
		prisma.withdrawals.count(),
	]);

	// Calculate total value
	let totalValue = 0;
	const metalSummary: Record<string, { quantity: number; value: number }> = {};

	deposits.forEach((deposit) => {
		const pricePerKg =
			METAL_PRICES[deposit.metalType as keyof typeof METAL_PRICES] || 0;
		const value = deposit.remainingQuantity * pricePerKg;
		totalValue += value;

		if (!metalSummary[deposit.metalType]) {
			metalSummary[deposit.metalType] = { quantity: 0, value: 0 };
		}
		metalSummary[deposit.metalType].quantity += deposit.remainingQuantity;
		metalSummary[deposit.metalType].value += value;
	});

	return {
		totalAccounts: accounts,
		totalDeposits: deposits.length,
		totalWithdrawals: withdrawals,
		totalValue,
		metalSummary,
	};
}

export default async function DashboardPage() {
	const stats = await getDashboardStats();

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-muted-foreground mt-1">
					Overview of your precious metals custody platform
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatsCard
					title="Total Accounts"
					value={formatNumber(stats.totalAccounts)}
					href="/accounts"
				/>
				<StatsCard
					title="Active Deposits"
					value={formatNumber(stats.totalDeposits)}
					href="/deposits"
				/>
				<StatsCard
					title="Total Withdrawals"
					value={formatNumber(stats.totalWithdrawals)}
					href="/withdrawals/new"
				/>
				<StatsCard
					title="Total Value"
					value={formatCurrency(stats.totalValue)}
				/>
			</div>

			{/* Metal Summary */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Inventory by Metal</h2>
				<div className="grid gap-4 md:grid-cols-3">
					{Object.entries(stats.metalSummary).map(([metal, data]) => (
						<div key={metal} className="rounded-lg border bg-card p-6">
							<h3 className="font-semibold text-lg">{metal}</h3>
							<div className="mt-4 space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Quantity</span>
									<span className="font-medium">
										{formatNumber(data.quantity)} kg
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Value</span>
									<span className="font-medium">
										{formatCurrency(data.value)}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Quick Actions */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<Link
						href="/deposits/new"
						className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
					>
						<h3 className="font-semibold">New Deposit</h3>
						<p className="text-sm text-muted-foreground mt-1">
							Record a new metal deposit
						</p>
					</Link>
					<Link
						href="/withdrawals/new"
						className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
					>
						<h3 className="font-semibold">New Withdrawal</h3>
						<p className="text-sm text-muted-foreground mt-1">
							Process a withdrawal request
						</p>
					</Link>
					<Link
						href="/accounts"
						className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
					>
						<h3 className="font-semibold">View Accounts</h3>
						<p className="text-sm text-muted-foreground mt-1">
							Manage customer accounts
						</p>
					</Link>
				</div>
			</div>
		</div>
	);
}

function StatsCard({
	title,
	value,
	href,
}: {
	title: string;
	value: string;
	href?: string;
}) {
	const content = (
		<div className="rounded-lg border bg-card p-6">
			<p className="text-sm text-muted-foreground">{title}</p>
			<p className="text-3xl font-bold mt-2">{value}</p>
		</div>
	);

	if (href) {
		return (
			<Link href={href} className="hover:opacity-80 transition-opacity">
				{content}
			</Link>
		);
	}

	return content;
}
