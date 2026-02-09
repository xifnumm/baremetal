import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Bare Metals Custody Platform',
	description: 'Digital Asset Custody Platform for Precious Metals',
};

const navigation = [
	{ name: 'Dashboard', href: '/' },
	{ name: 'Accounts', href: '/accounts' },
	{ name: 'Deposits', href: '/deposits' },
	{ name: 'Withdrawals', href: '/withdrawals/new' },
];

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<div className="flex min-h-screen">
					{/* Sidebar */}
					<aside className="w-64 border-r bg-muted/40">
						<div className="flex h-16 items-center border-b px-6">
							<h1 className="text-lg font-semibold">Bare Metals</h1>
						</div>
						<nav className="space-y-1 p-4">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className={cn(
										'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										'hover:bg-accent hover:text-accent-foreground',
									)}
								>
									{item.name}
								</Link>
							))}
						</nav>
					</aside>

					{/* Main content */}
					<main className="flex-1">
						<div className="border-b">
							<div className="flex h-16 items-center px-8">
								<h2 className="text-xl font-semibold">Custody Platform</h2>
							</div>
						</div>
						<div className="p-8">{children}</div>
					</main>
				</div>
			</body>
		</html>
	);
}
