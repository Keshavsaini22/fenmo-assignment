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
}

const initialState: ExpenseState = {
    expenses: [],
    categories: [],
    isLoading: false,
    isAdding: false,
    error: null,
    addError: null,
};

export const fetchExpenses = createAsyncThunk(
    'expenses/fetchAll',
    async ({ category, sortOn, sortDir }: { category?: string; sortOn?: string; sortDir?: string }, { rejectWithValue }) => {
        try {
            const response = await api.get('/expenses', { params: { category, sortOn, sortDir } });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch expenses');
        }
    }
);

export const fetchCategories = createAsyncThunk('expenses/fetchCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories');
    }
});

export const addExpense = createAsyncThunk(
    'expenses/addExpense',
    async (
        { expenseData, idempotencyKey }: { expenseData: any; idempotencyKey: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/expenses', expenseData, {
                headers: { 'Idempotency-Key': idempotencyKey },
            });
            return response.data.expense;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to add expense');
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
            // Fetch Expenses
            .addCase(fetchExpenses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.expenses = action.payload;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            // Add Expense
            .addCase(addExpense.pending, (state) => {
                state.isAdding = true;
                state.addError = null;
            })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.isAdding = false;
                // Check if idempotency key prevents duplicate appends (server returns same expense). 
                // We only push if it's not already in the list.
                const exists = state.expenses.find(e => e.id === action.payload.id);
                if (!exists) {
                    state.expenses.unshift(action.payload); // Add to top usually assuming sort newest
                }
            })
            .addCase(addExpense.rejected, (state, action) => {
                state.isAdding = false;
                state.addError = action.payload as string;
            });
    },
});

export const { clearAddError } = expenseSlice.actions;
export default expenseSlice.reducer;
