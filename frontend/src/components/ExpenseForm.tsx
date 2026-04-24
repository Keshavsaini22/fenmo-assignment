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
  amount: z.coerce.number()
    .positive({ message: 'Must be positive' })
    .max(99999999.99, { message: 'Maximum 8 numeric digits allowed' })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: 'Maximum 2 decimal places allowed'
    }),
  description: z.string().min(1, { message: 'Description is required' }),
  date: z.string().min(1, { message: 'Date is required' }),
  categoryId: z.string().min(1, { message: 'Category is required' }),
});

type ExpenseSchema = z.infer<typeof schema>;

interface Props {
  categories: Category[];
  onExpenseAdded?: () => void;
}

const ExpenseForm = ({ categories, onExpenseAdded }: Props) => {
  const dispatch = useAppDispatch();
  const { isAdding, addError } = useAppSelector(state => state.expenses);
  const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ExpenseSchema>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    setIdempotencyKey(uuidv4());
  }, []);

  const onSubmit = async (data: ExpenseSchema) => {
    dispatch(clearAddError());
    
    const formattedData = {
      ...data,
      date: new Date(data.date).toISOString(),
    };

    const actionResult = await dispatch(addExpense({
      expenseData: formattedData,
      idempotencyKey
    }));

    if (addExpense.fulfilled.match(actionResult)) {
      reset();
      setIdempotencyKey(uuidv4());
      if (onExpenseAdded) onExpenseAdded();
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
          slotProps={{ htmlInput: { step: '0.01', min: '0.01', max: '99999999.99' } }}
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
