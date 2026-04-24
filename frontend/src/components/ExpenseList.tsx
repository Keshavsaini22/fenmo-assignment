import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, CircularProgress, Typography } from '@mui/material';
import type { Expense } from '../store/expenseSlice';

interface Props {
  expenses: Expense[];
  isLoading: boolean;
}

const ExpenseList = ({ expenses, isLoading }: Props) => {
  if (isLoading && expenses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoading && expenses.length === 0) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary' }}>No expenses found.</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} hover>
              <TableCell>
                {new Date(expense.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{expense.category?.name}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                ₹{parseFloat(expense.amount).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExpenseList;
