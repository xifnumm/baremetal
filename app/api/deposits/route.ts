// File: src/app/api/deposits/route.ts
import { NextResponse } from 'next/server';
import { DepositService } from '@/services/deposit-services';
import { createDepositSchema } from '@/lib/validations/deposit';

const depositService = new DepositService();

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate input
		const validation = createDepositSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: validation.error.errors },
				{ status: 400 },
			);
		}

		// Create deposit
		const deposit = await depositService.createDeposit(validation.data);

		return NextResponse.json({ success: true, data: deposit });
	} catch (error) {
		console.error('Deposit creation error:', error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : 'Failed to create deposit',
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const deposits = await depositService.getActiveDeposits();
		return NextResponse.json({ success: true, data: deposits });
	} catch (error) {
		console.error('Get deposits error:', error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : 'Failed to get deposits',
			},
			{ status: 500 },
		);
	}
}
