import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, CircularProgress, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import type { Expense } from '../store/expenseSlice';

interface Props {
  expenses: Expense[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const ExpenseList = ({ expenses, isLoading, hasMore, onLoadMore }: Props) => {
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
    <TableContainer id="scrollableTarget" sx={{ height: 600, overflow: 'auto' }}>
      <InfiniteScroll
        dataLength={expenses.length}
        next={onLoadMore}
        hasMore={hasMore}
        loader={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, overflow: 'hidden' }}>
            <CircularProgress size={24} />
          </Box>
        }
        scrollableTarget="scrollableTarget"
        style={{ overflow: 'hidden' }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>Date</TableCell>
              <TableCell sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>Description</TableCell>
              <TableCell sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>Category</TableCell>
              <TableCell align="right" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>Amount</TableCell>
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
      </InfiniteScroll>
    </TableContainer>
  );
};

export default ExpenseList;
