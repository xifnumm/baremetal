import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatNumber } from '@/lib/utils';

async function getDeposits() {
	return await prisma.deposits.findMany({
		include: {
			account: true,
		},
		orderBy: { depositedAt: 'desc' },
	});
}

export default async function DepositsPage() {
	const deposits = await getDeposits();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Deposits</h1>
					<p className="text-muted-foreground mt-1">
						View all deposits and create new ones
					</p>
				</div>
				<Link
					href="/deposits/new"
					className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					New Deposit
				</Link>
			</div>

			{/* Deposits Table */}
			<div className="rounded-lg border">
				<table className="w-full">
					<thead className="border-b bg-muted/50">
						<tr>
							<th className="px-4 py-3 text-left text-sm font-medium">
								Deposit #
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium">
								Account
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium">Metal</th>
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
								Status
							</th>
							<th className="px-4 py-3 text-left text-sm font-medium">Date</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						{deposits.length === 0 ? (
							<tr>
								<td
									colSpan={9}
									className="px-4 py-8 text-center text-muted-foreground"
								>
									No deposits found
								</td>
							</tr>
						) : (
							deposits.map((deposit) => {
								const status =
									deposit.remainingQuantity === 0
										? 'withdrawn'
										: deposit.remainingQuantity < deposit.quantity
											? 'partial'
											: 'active';

								return (
									<tr key={deposit.id} className="hover:bg-muted/50">
										<td className="px-4 py-3 font-medium">
											{deposit.depositNumber}
										</td>
										<td className="px-4 py-3 text-sm">
											<Link
												href={`/accounts/${deposit.accountId}`}
												className="text-primary hover:underline"
											>
												{deposit.account.name}
											</Link>
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
										<td className="px-4 py-3">
											<span
												className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
													status === 'active'
														? 'bg-green-100 text-green-700'
														: status === 'partial'
															? 'bg-yellow-100 text-yellow-700'
															: 'bg-gray-100 text-gray-700'
												}`}
											>
												{status}
											</span>
										</td>
										<td className="px-4 py-3 text-sm text-muted-foreground">
											{formatDate(deposit.depositedAt)}
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
