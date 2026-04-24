import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export interface Category {
    id: string;
    name: string;
}

export interface Expense {
    id: string;
    amount: string;
    description: string;
    date: string;
    categoryId: string;
    category: Category;
    createdAt: string;
}

interface ExpenseState {
    expenses: Expense[];
    categories: Category[];
    isLoading: boolean;
    isAdding: boolean;
    error: string | null;
    addError: string | null;
    hasMore: boolean;
}

const initialState: ExpenseState = {
    expenses: [],
    categories: [],
    isLoading: false,
    isAdding: false,
    error: null,
    addError: null,
    hasMore: false,
};

export const fetchExpenses = createAsyncThunk(
    'expenses/fetchAll',
    async ({ category, sortOn, sortDir, page = 1, limit = 10 }: { category?: string; sortOn?: string; sortDir?: string; page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await api.get('/expenses', { params: { category, sortOn, sortDir, page, limit } });
            return { data: response.data, page };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch expenses');
        }
    }
);

export const fetchCategories = createAsyncThunk('expenses/fetchCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } } };
        return rejectWithValue(err.response?.data?.error || 'Failed to fetch categories');
    }
});

export const addExpense = createAsyncThunk(
    'expenses/addExpense',
    async (
        { expenseData, idempotencyKey }: { expenseData: Record<string, unknown>; idempotencyKey: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/expenses', expenseData, {
                headers: { 'Idempotency-Key': idempotencyKey },
            });
            return response.data.expense;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            return rejectWithValue(err.response?.data?.error || 'Failed to add expense');
        }
    }
);

const expenseSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        clearAddError: (state) => {
            state.addError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data, page } = action.payload;

                const fetchedExpenses = Array.isArray(data) ? data : (data?.expenses || []);
                const hasMoreData = Array.isArray(data) ? false : (data?.hasMore || false);

                if (page === 1) {
                    state.expenses = fetchedExpenses;
                } else {
                    state.expenses = [...state.expenses, ...fetchedExpenses];
                }
                state.hasMore = hasMoreData;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            .addCase(addExpense.pending, (state) => {
                state.isAdding = true;
                state.addError = null;
            })
            .addCase(addExpense.fulfilled, (state) => {
                state.isAdding = false;
            })
            .addCase(addExpense.rejected, (state, action) => {
                state.isAdding = false;
                state.addError = action.payload as string;
            });
    },
});

export const { clearAddError } = expenseSlice.actions;
export default expenseSlice.reducer;
