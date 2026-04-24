import { useEffect, useState, useMemo } from 'react';
import { Box, Grid, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchExpenses, fetchCategories } from '../store/expenseSlice';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 600;
    let animationFrameId: number;
    const startValue = displayValue;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(startValue + (value - startValue) * ease);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, displayValue]);

  return <>{displayValue.toFixed(2)}</>;
};

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { expenses, categories, isLoading, hasMore } = useAppSelector((state) => state.expenses);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('date_desc');
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchExpenses({ 
      category: filterCategory || undefined,
      sortOn: 'createdAt',
      sortDir: sortKey === 'date_desc' ? 'desc' : 'asc',
      page,
      limit: 10
    }));
  }, [dispatch, filterCategory, sortKey, page]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) setPage(prev => prev + 1);
  };

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }, [expenses]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
        <Paper sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total Visible:</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>₹<AnimatedCounter value={totalAmount} /></Typography>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ExpenseForm 
            categories={categories} 
            onExpenseAdded={() => {
              setPage(1);
              dispatch(fetchExpenses({ 
                category: filterCategory || undefined,
                sortOn: 'createdAt',
                sortDir: sortKey === 'date_desc' ? 'desc' : 'asc',
                page: 1,
                limit: 10
              }));
            }} 
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Filter by Category"
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setPage(1);
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortKey}
                    label="Sort by"
                    onChange={(e) => {
                      setSortKey(e.target.value);
                      setPage(1);
                    }}
                  >
                    <MenuItem value="date_desc">Newest First</MenuItem>
                    <MenuItem value="date_asc">Oldest First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <ExpenseList expenses={expenses} isLoading={isLoading} hasMore={hasMore} onLoadMore={handleLoadMore} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
