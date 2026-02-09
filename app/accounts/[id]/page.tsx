import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';

const METAL_PRICES = {
	Gold: 60000,
	Silver: 800,
	Platinum: 35000,
};

async function getAccountWithPortfolio(id: string) {
	const account = await prisma.account.findUnique({
		where: { id },
		include: {
			deposits: {
				where: { remainingQuantity: { gt: 0 } },
				orderBy: { depositedAt: 'desc' },
			},
			withdrawals: {
				orderBy: { withdrawnAt: 'desc' },
				take: 10,
			},
		},
	});

	if (!account) return null;

	// Calculate portfolio
	let totalValue = 0;
	const metalHoldings: Record<
		string,
		{ quantity: number; value: number; deposits: number }
	> = {};

	account.deposits.forEach((deposit) => {
		const pricePerKg =
			METAL_PRICES[deposit.metalType as keyof typeof METAL_PRICES] || 0;
		const value = deposit.remainingQuantity * pricePerKg;
		totalValue += value;

		if (!metalHoldings[deposit.metalType]) {
			metalHoldings[deposit.metalType] = { quantity: 0, value: 0, deposits: 0 };
		}
		metalHoldings[deposit.metalType].quantity += deposit.remainingQuantity;
		metalHoldings[deposit.metalType].value += value;
		metalHoldings[deposit.metalType].deposits += 1;
	});

	return { account, totalValue, metalHoldings };
}

export default async function AccountDetailPage(props: {
	params: Promise<{ id: string }>;
}) {
	const params = await props.params;
	const id = params.id;

	const data = await getAccountWithPortfolio(id);

	if (!data) {
		notFound();
	}

	const { account, totalValue, metalHoldings } = data;

	return (
		<div className="space-y-6">
			{/* Account Info */}
			<div className="rounded-lg border bg-card p-6">
				<h1 className="text-2xl font-bold">{account.name}</h1>
				<p className="text-muted-foreground">{account.email}</p>
				<div className="mt-4 flex gap-4">
					<div>
						<span className="text-sm text-muted-foreground">Account Type</span>
						<p className="font-medium">{account.type}</p>
					</div>
					<div>
						<span className="text-sm text-muted-foreground">Created</span>
						<p className="font-medium">{formatDate(account.createdAt)}</p>
					</div>
				</div>
			</div>

			{/* Portfolio Overview */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Portfolio Overview</h2>
				<div className="rounded-lg border bg-card p-6">
					<div className="mb-6">
						<p className="text-sm text-muted-foreground">
							Total Portfolio Value
						</p>
						<p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						{Object.entries(metalHoldings).map(([metal, data]) => (
							<div key={metal} className="rounded-lg border p-4">
								<h3 className="font-semibold">{metal}</h3>
								<div className="mt-3 space-y-2">
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
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Deposits</span>
										<span className="font-medium">{data.deposits}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Active Deposits */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Active Deposits</h2>
				<div className="rounded-lg border">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Deposit #
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Metal
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Storage
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Quantity
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Remaining
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Bar Serial
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Date
								</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{account.deposits.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="px-4 py-8 text-center text-muted-foreground"
									>
										No active deposits
									</td>
								</tr>
							) : (
								account.deposits.map((deposit) => (
									<tr key={deposit.id} className="hover:bg-muted/50">
										<td className="px-4 py-3 font-medium">
											{deposit.depositNumber}
										</td>
										<td className="px-4 py-3 text-sm">{deposit.metalType}</td>
										<td className="px-4 py-3 text-sm">{deposit.storageType}</td>
										<td className="px-4 py-3 text-sm">
											{formatNumber(deposit.quantity)} kg
										</td>
										<td className="px-4 py-3 text-sm">
											{formatNumber(deposit.remainingQuantity)} kg
										</td>
										<td className="px-4 py-3 text-sm">
											{deposit.barSerial || '-'}
										</td>
										<td className="px-4 py-3 text-sm text-muted-foreground">
											{formatDate(deposit.depositedAt)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Recent Withdrawals */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Recent Withdrawals</h2>
				<div className="rounded-lg border">
					<table className="w-full">
						<thead className="border-b bg-muted/50">
							<tr>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Withdrawal #
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Metal
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Storage
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Quantity
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Bar Serial
								</th>
								<th className="px-4 py-3 text-left text-sm font-medium">
									Date
								</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{account.withdrawals.length === 0 ? (
								<tr>
									<td
										colSpan={6}
										className="px-4 py-8 text-center text-muted-foreground"
									>
										No withdrawals yet
									</td>
								</tr>
							) : (
								account.withdrawals.map((withdrawal) => (
									<tr key={withdrawal.id} className="hover:bg-muted/50">
										<td className="px-4 py-3 font-medium">
											{withdrawal.withdrawalNumber}
										</td>
										<td className="px-4 py-3 text-sm">
											{withdrawal.metalType}
										</td>
										<td className="px-4 py-3 text-sm">
											{withdrawal.storageType}
										</td>
										<td className="px-4 py-3 text-sm">
											{formatNumber(withdrawal.quantity)} kg
										</td>
										<td className="px-4 py-3 text-sm">
											{withdrawal.barSerial || '-'}
										</td>
										<td className="px-4 py-3 text-sm text-muted-foreground">
											{formatDate(withdrawal.withdrawnAt)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
