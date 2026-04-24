import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { TextField, Button, Typography, Paper, Alert, MenuItem, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/store';
import type { Category } from '../store/expenseSlice';
import { addExpense, clearAddError } from '../store/expenseSlice';

const schema = z.object({
  amount: z.coerce.number().positive({ message: 'Must be positive' }),
  description: z.string().min(1, { message: 'Description is required' }),
  date: z.string().min(1, { message: 'Date is required' }),
  categoryId: z.string().min(1, { message: 'Category is required' }),
});

type ExpenseSchema = z.infer<typeof schema>;

interface Props {
  categories: Category[];
}

const ExpenseForm = ({ categories }: Props) => {
  const dispatch = useAppDispatch();
  const { isAdding, addError } = useAppSelector(state => state.expenses);
  const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ExpenseSchema>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Default to today YYYY-MM-DD
    }
  });

  // Ensure fresh UUID on mount
  useEffect(() => {
    setIdempotencyKey(uuidv4());
  }, []);

  const onSubmit = async (data: ExpenseSchema) => {
    dispatch(clearAddError());
    
    // Formatting date to ISO-8601 for Prisma
    const formattedData = {
      ...data,
      date: new Date(data.date).toISOString(),
    };

    // We pass the idempotency key ensuring duplicate submits due to network failure are caught
    const actionResult = await dispatch(addExpense({
      expenseData: formattedData,
      idempotencyKey
    }));

    if (addExpense.fulfilled.match(actionResult)) {
      reset(); // Reset form
      setIdempotencyKey(uuidv4()); // Gen a new key for the next expense
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Add New Expense</Typography>
      
      {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Amount"
          type="number"
          fullWidth
          margin="normal"
          size="small"
          slotProps={{ htmlInput: { step: 'any' } }}
          {...register('amount')}
          error={!!errors.amount}
          helperText={errors.amount?.message}
        />

        <TextField
          label="Description"
          fullWidth
          margin="normal"
          size="small"
          {...register('description')}
          error={!!errors.description}
          helperText={errors.description?.message}
        />

        <TextField
          label="Date"
          type="date"
          fullWidth
          margin="normal"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          {...register('date')}
          error={!!errors.date}
          helperText={errors.date?.message}
        />

        <Controller
          name="categoryId"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Category"
              fullWidth
              margin="normal"
              size="small"
              error={!!errors.categoryId}
              helperText={errors.categoryId?.message}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </TextField>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isAdding}
          sx={{ mt: 2 }}
        >
          {isAdding ? <CircularProgress size={24} /> : 'Record Expense'}
        </Button>
      </form>
    </Paper>
  );
};

export default ExpenseForm;
