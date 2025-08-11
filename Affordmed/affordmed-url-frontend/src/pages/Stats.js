import * as React from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { api } from '../api';

export default function Stats() {
  const [code, setCode] = React.useState('');
  const [data, setData] = React.useState(null);
  const [all, setAll] = React.useState([]);

  const fetchStats = async () => { if (!code) return; const { data } = await api.get(`/shorturls/${code}/stats`); setData(data); };
  const fetchAll = async () => { const { data } = await api.get('/shorturls'); setAll(data); };
  React.useEffect(()=>{ fetchAll(); }, []);

  return (
    <>
      <Typography variant="h5" gutterBottom>Short URL Statistics</Typography>
      <Box sx={{ display:'flex', gap:2, mb:2 }}>
        <TextField label="Enter shortcode" value={code} onChange={e=>setCode(e.target.value)} />
        <Button variant="contained" onClick={fetchStats}>Get Stats</Button>
      </Box>

      {data && (
        <Paper sx={{ p:2, mb:3 }}>
          <Typography variant="subtitle1">Shortcode: {data.shortcode}</Typography>
          <Typography>Original: {data.originalUrl}</Typography>
          <Typography>Created: {new Date(data.createdAt).toLocaleString()}</Typography>
          <Typography>Expiry: {new Date(data.expiry).toLocaleString()} {data.expired ? '(expired)' : ''}</Typography>
          <Typography>Total Clicks: {data.totalClicks}</Typography>
          <Box sx={{ mt:1 }}>
            {data.clicks.map((c,i)=> (
              <Paper key={i} sx={{ p:1, my:1 }}>
                <Typography>When: {new Date(c.ts).toLocaleString()}</Typography>
                <Typography>Referrer: {c.referrer || '—'}</Typography>
                <Typography>IP: {c.ip || '—'}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      )}

      <Typography variant="h6" sx={{ mt:4 }}>All Created (this DB)</Typography>
      {all.map((l)=> (
        <Paper key={l._id} sx={{ p:2, my:1 }}>
          <Typography>/{l.shortcode} → {l.originalUrl}</Typography>
          <Typography>Created: {new Date(l.createdAt).toLocaleString()}</Typography>
          <Typography>Expires: {new Date(l.expiresAt).toLocaleString()}</Typography>
          <Typography>Total Clicks: {l.clicks?.length || 0}</Typography>
        </Paper>
      ))}
    </>
  );
}
