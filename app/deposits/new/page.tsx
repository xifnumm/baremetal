'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDepositPage() {
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
			depositNumber: formData.get('depositNumber'),
			metalType: formData.get('metalType'),
			storageType: formData.get('storageType'),
			quantity: parseFloat(formData.get('quantity') as string),
			barSerial: formData.get('barSerial') || undefined,
		};

		try {
			const response = await fetch('/api/deposits', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create deposit');
			}

			router.push('/deposits');
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
				<h1 className="text-3xl font-bold">New Deposit</h1>
				<p className="text-muted-foreground mt-1">
					Record a new precious metal deposit
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
					<label htmlFor="depositNumber" className="text-sm font-medium">
						Deposit Number
					</label>
					<input
						type="text"
						id="depositNumber"
						name="depositNumber"
						required
						className="w-full rounded-md border px-3 py-2 text-sm"
						placeholder="DEP-001"
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
						placeholder="10.5"
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="barSerial" className="text-sm font-medium">
						Bar Serial Number{' '}
						<span className="text-muted-foreground">
							(Required for Allocated)
						</span>
					</label>
					<input
						type="text"
						id="barSerial"
						name="barSerial"
						className="w-full rounded-md border px-3 py-2 text-sm"
						placeholder="GOLD-BAR-001"
					/>
				</div>

				<div className="flex gap-3">
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					>
						{isSubmitting ? 'Creating...' : 'Create Deposit'}
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
