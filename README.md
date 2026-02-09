# Bare Metals Custody Platform

A digital asset custody platform for managing precious metals storage with support for both retail (pooled) and institutional (bar-level) storage models.

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd bare-metals-custody
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/bare_metals"
```

4. **Run database migrations**

```bash
npx prisma migrate dev
npx prisma generate
```

5. **Create initial accounts (via Prisma Studio)**

```bash
npx prisma studio
```

- Leave the `id` field empty (auto-generates CUID)
- Set `type` to either `RETAIL` or `INSTITUTIONAL`
- Add email and name

6. **Start development server**

```bash
pnpm dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
bare-metals-custody/
├── prisma/
│   └── schema.prisma              # Database schema
├── services/                      # Standalone business logic
│   ├── account.service.ts
│   ├── deposit.service.ts
│   ├── withdrawal.service.ts
│   ├── valuation.service.ts
│   └── inventory.service.ts
├── src/
│   ├── app/                       # Next.js pages & API routes
│   ├── lib/                       # Utilities & validations
│   ├── services/                  # Dashboard-specific services
│   └── types/                     # TypeScript type definitions
└── README.md
```

## 💡 Core Features

- **Account Management**: RETAIL (pooled storage) and INSTITUTIONAL (bar-level tracking)
- **Deposits**: Record metal deposits with storage type validation
- **Withdrawals**: FIFO for unallocated, specific bar selection for allocated
- **Portfolio Valuation**: Real-time portfolio calculations with metal prices
- **Inventory Tracking**: View holdings by account, metal type, and storage type

## 🏗️ Architecture Decisions

### 1. Storage Model Design

**Decision**: Two distinct storage types with enforced client-type matching

- **RETAIL → UNALLOCATED**: Pooled storage, no bar-level tracking
- **INSTITUTIONAL → ALLOCATED**: Individual bar tracking with serial numbers

**Rationale**: Mirrors real-world precious metals custody practices where retail clients hold percentage ownership of a pool, while institutional clients own specific bars.

### 2. FIFO Withdrawal Logic for Unallocated

**Decision**: First-In-First-Out deduction from oldest deposits

**Rationale**:

- Simplest fair distribution model
- Prevents cherry-picking of deposits
- Standard practice in commodity storage
- Easy to audit and verify

### 3. Partial Withdrawals Support

**Decision**: Allow withdrawing less than full deposit amount via `remainingQuantity` tracking

**Rationale**:

- Flexibility for clients
- Realistic business requirement
- Soft deletion (deposits never deleted, just depleted)
- Maintains complete audit trail

### 4. Atomic Transactions for Withdrawals

**Decision**: Use Prisma transactions to ensure all-or-nothing updates

**Rationale**:

- Prevents overselling of metals
- Ensures data consistency
- Handles concurrent withdrawal requests
- Database-level guarantees

### 5. Hardcoded Metal Prices

**Decision**: Static prices in code (Gold: $60k/kg, Silver: $800/kg, Platinum: $35k/kg)

**Rationale**:

- Showcase simplicity
- Easy to extend to API/database storage later
- Sufficient for prototype demonstration
- No external dependencies

### 6. Validation at Multiple Layers

**Decision**: Zod schemas (API) + Service validation (business rules) + Database constraints

**Rationale**:

- Defense in depth
- Clear error messages at each layer
- Type safety with TypeScript
- Runtime validation for external input

### 7. Server Components for Data Fetching

**Decision**: Use Next.js 14 Server Components for pages with data

**Rationale**:

- Faster initial page loads
- Reduced client-side JavaScript
- Direct database access (no API overhead)
- Better SEO if needed

## 🔒 Edge Cases Handled

### 1. Storage Type Mismatch

**Scenario**: RETAIL client attempts to use ALLOCATED storage (or vice versa)

**Handling**:

- Service layer validates account type matches storage type
- Returns error: "RETAIL clients can only use UNALLOCATED storage"
- Prevents deposit creation before database interaction

**Code**: `src/services/deposit.service.ts:25-33`

---

### 2. Duplicate Bar Serial Numbers

**Scenario**: Attempting to deposit two bars with the same serial number

**Handling**:

- Query checks if bar serial exists with `remainingQuantity > 0`
- Returns error: "Bar serial number already exists in custody"
- Allows serial reuse only after bar is fully withdrawn

**Code**: `src/services/deposit.service.ts:35-49`

---

### 3. Insufficient Balance for Withdrawal

**Scenario**: Withdrawing more metal than account holds

**Handling**:

- Calculate total available quantity across all deposits
- Compare against requested withdrawal amount
- Returns error: "Insufficient quantity. Available: Xkg, Requested: Ykg"
- Transaction never starts if insufficient

**Code**: `src/services/withdrawal.service.ts:143-147`

---

### 4. Partial Withdrawals with FIFO

**Scenario**: RETAIL client withdraws amount spanning multiple deposits

**Example**: Account has 3kg + 7kg deposits, withdraws 5kg

**Handling**:

- Loop through deposits in chronological order (FIFO)
- Deduct 3kg from first deposit (depletes to 0kg)
- Deduct 2kg from second deposit (leaves 5kg remaining)
- Creates multiple withdrawal records linked to each deposit
- All updates in single atomic transaction

**Code**: `src/services/withdrawal.service.ts:152-185`

---

### 5. Wrong Metal Type Withdrawal

**Scenario**: Account has only Gold deposits, tries to withdraw Silver

**Handling**:

- Filter deposits by exact metal type match
- If no matching deposits found, return error immediately
- Returns error: "No Silver deposits found for this account"
- Prevents any database updates

**Code**: `src/services/withdrawal.service.ts:125-127`

---

### 6. Account Deletion with Active Holdings

**Scenario**: Attempting to delete account that has deposits or withdrawals

**Handling**:

- Pre-deletion check queries related deposits/withdrawals
- If any exist, prevent deletion
- Returns error: "Cannot delete account with existing deposits or withdrawals"
- Prevents orphaned records

**Code**: `services/account.service.ts:70-76`

---

### 7. Missing Bar Serial for Allocated Storage

**Scenario**: INSTITUTIONAL deposit without bar serial number

**Handling**:

- Zod schema validates required field
- Service layer double-checks for allocated storage
- Returns error: "Bar serial number is required for ALLOCATED storage"
- Rejected before reaching database

**Code**: `src/lib/validations/deposit.ts:30-32`

---

### 8. Duplicate Transaction Numbers

**Scenario**: Using same deposit/withdrawal number twice

**Handling**:

- Database unique constraint on `depositNumber` / `withdrawalNumber`
- Query checks existence before insert
- Returns error: "Deposit number already exists"
- Database-level enforcement prevents race conditions

**Code**: `src/services/deposit.service.ts:51-57`

---

### 9. Zero or Negative Quantities

**Scenario**: Invalid quantity values in deposit/withdrawal

**Handling**:

- Zod schema enforces positive numbers
- `.positive()` validator rejects zero and negatives
- Additional runtime check in withdrawal service
- Returns clear validation error message

**Code**: `src/lib/validations/deposit.ts:27-30`

---

### 10. Concurrent Withdrawal Requests

**Scenario**: Two users withdraw from same account simultaneously

**Handling**:

- Prisma transactions ensure atomicity
- Database-level locking during withdrawal
- First request succeeds, locks deposits
- Second request fails with "Insufficient quantity"
- No overselling possible

**Code**: `src/services/withdrawal.service.ts:98-123`

## 🔌 API Examples

### Create a Deposit

```bash
POST /api/deposits
Content-Type: application/json

{
  "accountId": "clxxx123abc...",
  "depositNumber": "DEP-001",
  "metalType": "Gold",
  "storageType": "UNALLOCATED",
  "quantity": 10.5
}
```

**Response (Success)**:

```json
{
	"success": true,
	"data": {
		"id": "clyyy456def...",
		"accountId": "clxxx123abc...",
		"depositNumber": "DEP-001",
		"metalType": "Gold",
		"storageType": "UNALLOCATED",
		"quantity": 10.5,
		"remainingQuantity": 10.5,
		"barSerial": null,
		"depositedAt": "2025-02-09T12:00:00Z"
	}
}
```

**Response (Error)**:

```json
{
	"error": "RETAIL clients can only use UNALLOCATED storage",
	"details": []
}
```

---

### Create a Withdrawal

```bash
POST /api/withdrawals
Content-Type: application/json

{
  "accountId": "clxxx123abc...",
  "withdrawalNumber": "WTH-001",
  "metalType": "Gold",
  "storageType": "UNALLOCATED",
  "quantity": 3.0
}
```

**Response (Success)**:

```json
{
	"success": true,
	"data": {
		"id": "clzzz789ghi...",
		"accountId": "clxxx123abc...",
		"withdrawalNumber": "WTH-001-1",
		"metalType": "Gold",
		"storageType": "UNALLOCATED",
		"quantity": 3.0,
		"barSerial": null,
		"withdrawnAt": "2025-02-09T12:30:00Z"
	}
}
```

**Response (Error)**:

```json
{
	"error": "Insufficient quantity. Available: 2.5kg, Requested: 3.0kg"
}
```

---

### Get All Deposits

```bash
GET /api/deposits
```

**Response**:

```json
{
	"success": true,
	"data": [
		{
			"id": "clyyy456def...",
			"depositNumber": "DEP-001",
			"metalType": "Gold",
			"storageType": "UNALLOCATED",
			"quantity": 10.5,
			"remainingQuantity": 7.5,
			"account": {
				"name": "John Doe",
				"email": "john@example.com"
			}
		}
	]
}
```

## 🧪 Testing the Platform

1. **Create an account** via Prisma Studio (leave ID empty)
2. **Copy the generated account ID** (e.g., `clxxx123abc...`)
3. **Navigate to `/deposits/new`** and create a deposit
4. **View the dashboard** (`/`) to see updated stats
5. **View account details** (`/accounts/[id]`) to see portfolio
6. **Create a withdrawal** (`/withdrawals/new`)
7. **Verify remaining quantity** updates correctly

## 📊 Database Schema

### Account

- `id` (CUID, PK)
- `email` (String, Unique)
- `name` (String)
- `type` (Enum: RETAIL, INSTITUTIONAL)
- `createdAt` (DateTime)

### Deposits

- `id` (CUID, PK)
- `accountId` (FK → Account)
- `depositNumber` (String, Unique)
- `metalType` (String)
- `storageType` (Enum: ALLOCATED, UNALLOCATED)
- `quantity` (Float)
- `remainingQuantity` (Float)
- `barSerial` (String?, Unique when not null)
- `depositedAt` (DateTime)

### Withdrawals

- `id` (CUID, PK)
- `accountId` (FK → Account)
- `depositId` (FK → Deposits, Optional)
- `withdrawalNumber` (String, Unique)
- `metalType` (String)
- `storageType` (Enum)
- `quantity` (Float)
- `barSerial` (String?, Optional)
- `withdrawnAt` (DateTime)

## 🎯 Key Design Principles

1. **Simplicity**: No over-engineering, straightforward implementations
2. **Type Safety**: TypeScript + Zod + Prisma for end-to-end types
3. **Data Integrity**: Atomic transactions, constraints, validations
4. **Auditability**: Never delete records, track all changes
5. **Extensibility**: Easy to add new metal types, storage options

## 🔮 Future Enhancements

- Historical price tracking and portfolio performance
- Multi-currency support
- Automated valuation reports (PDF generation)
- Batch operations (bulk deposits/withdrawals)
- Admin dashboard with analytics
- Email notifications for transactions
- CSV import/export functionality
- Role-based access control

## 🤝 Contributing

This is a technical assessment project for Maldives Stock Exchange.

## 📝 License

Proprietary - Maldives Stock Exchange Technical Assessment

---

**Built with**: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS, Zod
