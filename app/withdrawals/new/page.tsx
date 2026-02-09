'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewWithdrawalPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError('');

		const formData = new FormData(e.currentTarget);
		const data = {
			accountId: formData.get('accountId'),
			withdrawalNumber: formData.get('withdrawalNumber'),
			metalType: formData.get('metalType'),
			storageType: formData.get('storageType'),
			quantity: parseFloat(formData.get('quantity') as string),
			barSerial: formData.get('barSerial') || undefined,
		};

		try {
			const response = await fetch('/api/withdrawals', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create withdrawal');
			}

			router.push('/accounts/' + data.accountId);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-2xl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">New Withdrawal</h1>
				<p className="text-muted-foreground mt-1">
					Process a precious metal withdrawal
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-6 rounded-lg border bg-card p-6"
			>
				{error && (
					<div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
						{error}
					</div>
				)}

				<div className="space-y-2">
					<label htmlFor="accountId" className="text-sm font-medium">
						Account ID
					</label>
					<input
						type="text"
						id="accountId"
						name="accountId"
						required
						className="w-full rounded-md border px-3 py-2 text-sm"
						placeholder="clxxx..."
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="withdrawalNumber" className="text-sm font-medium">
						Withdrawal Number
					</label>
					<input
						type="text"
						id="withdrawalNumber"
						name="withdrawalNumber"
						required
						className="w-full rounded-md border px-3 py-2 text-sm"
						placeholder="WTH-001"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label htmlFor="metalType" className="text-sm font-medium">
							Metal Type
						</label>
						<select
							id="metalType"
							name="metalType"
							required
							className="w-full rounded-md border px-3 py-2 text-sm"
						>
							<option value="Gold">Gold</option>
							<option value="Silver">Silver</option>
							<option value="Platinum">Platinum</option>
						</select>
					</div>

					<div className="space-y-2">
						<label htmlFor="storageType" className="text-sm font-medium">
							Storage Type
						</label>
						<select
							id="storageType"
							name="storageType"
							required
							className="w-full rounded-md border px-3 py-2 text-sm"
						>
							<option value="UNALLOCATED">Unallocated (Pooled)</option>
							<option value="ALLOCATED">Allocated (Bar-level)</option>
						</select>
					</div>
				</div>

				<div className="space-y-2">
					<label htmlFor="quantity" className="text-sm font-medium">
						Quantity (kg)
					</label>
					<input
						type="number"
						id="quantity"
						name="quantity"
						required
						step="0.01"
						min="0.01"
						className="w-full rounded-md border px-3 py-2 text-sm"
						placeholder="5.0"
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="barSerial" className="text-sm font-medium">
						Bar Serial Number{' '}
						<span className="text-muted-foreground">
							(Optional for Allocated)
						</span>
					</label>
					<input
						type="text"
						id="barSerial"
						name="barSerial"
						className="w-full rounded-md border px-3 py-2 text-sm"
						placeholder="GOLD-BAR-001"
					/>
					<p className="text-xs text-muted-foreground">
						Leave empty to withdraw from oldest deposit (FIFO)
					</p>
				</div>

				<div className="rounded-lg bg-muted p-4">
					<p className="text-sm font-medium mb-2">Note:</p>
					<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
						<li>Unallocated withdrawals use FIFO (oldest deposits first)</li>
						<li>
							Allocated withdrawals can specify a bar serial or let system pick
						</li>
						<li>Partial withdrawals are supported</li>
					</ul>
				</div>

				<div className="flex gap-3">
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					>
						{isSubmitting ? 'Processing...' : 'Create Withdrawal'}
					</button>
					<button
						type="button"
						onClick={() => router.back()}
						className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
