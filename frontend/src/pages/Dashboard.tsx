import { useEffect, useState, useMemo } from 'react';
import { Box, Grid, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchExpenses, fetchCategories } from '../store/expenseSlice';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { expenses, categories, isLoading } = useAppSelector((state) => state.expenses);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortOn, setSortOn] = useState<string>('updatedAt');
  const [sortDir, setSortDir] = useState<string>('desc');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchExpenses({ 
      category: filterCategory || undefined,
      sortOn,
      sortDir
    }));
  }, [dispatch, filterCategory, sortOn, sortDir]);

  // Calculate total currently visible
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }, [expenses]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
        <Paper sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total Visible:</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>₹{totalAmount.toFixed(2)}</Typography>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* Left Col: Form */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ExpenseForm categories={categories} />
        </Grid>

        {/* Right Col: Filters and List */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Filter by Category"
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort On</InputLabel>
                  <Select
                    value={sortOn}
                    label="Sort On"
                    onChange={(e) => setSortOn(e.target.value)}
                  >
                    <MenuItem value="updatedAt">Updated At</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="amount">Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={sortDir}
                    label="Direction"
                    onChange={(e) => setSortDir(e.target.value)}
                  >
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <ExpenseList expenses={expenses} isLoading={isLoading} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
