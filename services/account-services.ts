import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export class AccountService {
	async createAccount(data: {
		email: string;
		name: string;
		type: ClientTypes;
	}) {
		const account = await prisma.account.create({
			data: {
				email: data.email,
				name: data.name,
				type: data.type,
			},
		});

		return account;
	}

	async getAccountById(accountId: string) {
		const account = await prisma.account.findUnique({
			where: { id: accountId },
			include: {
				deposits: {
					where: {
						remainingQuantity: {
							gt: 0,
						},
					},
					orderBy: { depositedAt: 'desc' },
				},
				withdrawals: {
					orderBy: { withdrawnAt: 'desc' },
				},
			},
		});

		if (!account) {
			throw new Error('Account not found');
		}

		return account;
	}

	async getAllAccounts() {
		const accounts = await prisma.account.findMany({
			include: {
				deposits: true,
				withdrawals: true,
			},
			orderBy: { createdAt: 'desc' },
		});

		return accounts;
	}

	async updateAccount(
		accountId: string,
		data: {
			email?: string;
			name?: string;
		},
	) {
		const account = await prisma.account.update({
			where: { id: accountId },
			data,
		});

		return account;
	}

	async deleteAccount(accountId: string) {
		const account = await prisma.account.findUnique({
			where: { id: accountId },
			include: {
				deposits: true,
				withdrawals: true,
			},
		});

		if (!account) {
			throw new Error('Account not found');
		}

		if (account.deposits.length > 0 || account.withdrawals.length > 0) {
			throw new Error(
				'Cannot delete account with existing deposits or withdrawals',
			);
		}

		await prisma.account.delete({
			where: { id: accountId },
		});

		return { message: 'Account deleted successfully' };
	}
}
