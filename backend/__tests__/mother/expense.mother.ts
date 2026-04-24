export class ExpenseMother {
    /**
     * Builds a standard valid payload matching the POST /expenses body.
     */
    static createValidPayload(overrides: Partial<any> = {}) {
        return {
            amount: (Math.random() * 1000).toFixed(2),
            description: `Expense ${Math.floor(Math.random() * 100)}`,
            date: new Date().toISOString(),
            categoryId: `cat-${Math.floor(Math.random() * 1000)}`,
            ...overrides
        };
    }

    /**
     * Builds a mocked Prisma Expense entity response object.
     */
    static createExpenseModel(overrides: Partial<any> = {}) {
        return {
            id: `exp-${Math.floor(Math.random() * 1000)}`,
            amount: (Math.random() * 1000).toFixed(2),
            description: `Expense ${Math.floor(Math.random() * 100)}`,
            date: new Date(),
            userId: `usr-${Math.floor(Math.random() * 1000)}`,
            categoryId: `cat-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            idempotencyKey: `idem-${Math.floor(Math.random() * 10000)}`,
            ...overrides
        };
    }
}
