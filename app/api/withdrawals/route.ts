import { NextResponse } from 'next/server';
import { WithdrawalService } from '@/services/withdraw-services';
import { createWithdrawalSchema } from '@/lib/validations';

const withdrawalService = new WithdrawalService();

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate input
		const validation = createWithdrawalSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: validation.error.errors },
				{ status: 400 },
			);
		}

		// Create withdrawal
		const withdrawal = await withdrawalService.createWithdrawal(
			validation.data,
		);

		return NextResponse.json({ success: true, data: withdrawal });
	} catch (error) {
		console.error('Withdrawal creation error:', error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to create withdrawal',
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const withdrawals = await withdrawalService.getAllWithdrawals();
		return NextResponse.json({ success: true, data: withdrawals });
	} catch (error) {
		console.error('Get withdrawals error:', error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : 'Failed to get withdrawals',
			},
			{ status: 500 },
		);
	}
}
