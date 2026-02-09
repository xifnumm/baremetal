import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

async function getAccounts() {
	return await prisma.account.findMany({
		include: {
			deposits: {
				where: { remainingQuantity: { gt: 0 } },
			},
			_count: {
				select: {
					deposits: true,
					withdrawals: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	});
}

export default async function AccountsPage() {
	const accounts = await getAccounts();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Accounts</h1>
					<p className="text-muted-foreground mt-1">Manage customer accounts</p>
				</div>
			</div>

			{/* Accounts Table */}
			<div className="rounded-lg border">
				<table className="w-full">
					<thead className="border-b bg-muted/50">
						<tr>
							<th className="px-4 py-3 text-left text-sm font-medium">Name</th>
							<th className="px-4 py-3 text-left text-sm font-medium">Email</th>
							<th className="px-4 py-3 text-left text-sm font-medium">Type</th>
							<th className="px-4 py-3 text-left text-sm font-medium">
								Active Deposits
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium">
								Total Withdrawals
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium">
								Created
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						{accounts.length === 0 ? (
							<tr>
								<td
									colSpan={7}
									className="px-4 py-8 text-center text-muted-foreground"
								>
									No accounts found
								</td>
							</tr>
						) : (
							accounts.map((account) => (
								<tr key={account.id} className="hover:bg-muted/50">
									<td className="px-4 py-3 font-medium">{account.name}</td>
									<td className="px-4 py-3 text-sm">{account.email}</td>
									<td className="px-4 py-3">
										<span
											className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
												account.type === 'RETAIL'
													? 'bg-blue-100 text-blue-700'
													: 'bg-purple-100 text-purple-700'
											}`}
										>
											{account.type}
										</span>
									</td>
									<td className="px-4 py-3 text-sm">
										{account.deposits.length}
									</td>
									<td className="px-4 py-3 text-sm">
										{account._count.withdrawals}
									</td>
									<td className="px-4 py-3 text-sm text-muted-foreground">
										{formatDate(account.createdAt)}
									</td>
									<td className="px-4 py-3">
										<Link
											href={`/accounts/${account.id}`}
											className="text-sm text-primary hover:underline"
										>
											View Details
										</Link>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
