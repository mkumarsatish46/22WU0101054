import * as React from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, Alert } from '@mui/material';
import { api } from '../api';

const emptyRow = { url: '', validity: '', shortcode: '' };

export default function Shortener() {
  const [rows, setRows] = React.useState([{ ...emptyRow }]);
  const [results, setResults] = React.useState([]);
  const [error, setError] = React.useState('');

  const addRow = () => { if (rows.length < 5) setRows([...rows, { ...emptyRow }]); };
  const onChange = (i, key, val) => { const copy = [...rows]; copy[i][key] = val; setRows(copy); };

  const validateRow = (r) => {
    try { new URL(r.url); } catch { return 'Enter a valid URL'; }
    if (r.validity && (!/^\d+$/.test(r.validity) || parseInt(r.validity) <= 0)) return 'Validity must be a positive integer (minutes)';
    if (r.shortcode && !/^[a-zA-Z0-9]{3,20}$/.test(r.shortcode)) return 'Shortcode must be alphanumeric (3-20)';
    return '';
  };

  const submit = async () => {
    setError('');
    const payloads = [];
    for (const r of rows) {
      const err = validateRow(r);
      if (err) { setError(err); return; }
      const p = { url: r.url };
      if (r.validity) p.validity = parseInt(r.validity);
      if (r.shortcode) p.shortcode = r.shortcode;
      payloads.push(p);
    }
    const outs = [];
    for (const p of payloads) {
      try { const { data } = await api.post('/shorturls', p); outs.push(data); }
      catch (e) { outs.push({ error: e.response?.data?.error || 'Failed', message: e.response?.data?.message }); }
    }
    setResults(outs);
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>Shorten up to 5 URLs</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {rows.map((r, i) => (
        <Paper key={i} sx={{ p:2, mb:2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Original URL" fullWidth value={r.url}
                onChange={e=>onChange(i,'url',e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Validity (min)" fullWidth value={r.validity}
                onChange={e=>onChange(i,'validity',e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Custom Shortcode" fullWidth value={r.shortcode}
                onChange={e=>onChange(i,'shortcode',e.target.value)} />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Box sx={{ display:'flex', gap:2 }}>
        <Button variant="outlined" onClick={addRow} disabled={rows.length>=5}>Add Row</Button>
        <Button variant="contained" onClick={submit}>Create Short Links</Button>
      </Box>

      {results.length>0 && (
        <Box sx={{ mt:4 }}>
          <Typography variant="h6">Results</Typography>
          {results.map((r, i)=> (
            <Paper key={i} sx={{ p:2, my:1 }}>
              {r.shortLink ? (
                <>
                  <Typography>
                    Short Link: <a href={r.shortLink} target="_blank" rel="noreferrer">{r.shortLink}</a>
                  </Typography>
                  <Typography>Expiry: {r.expiry}</Typography>
                </>
              ) : (
                <Alert severity="error">{r.error}{r.message?`: ${r.message}`:''}</Alert>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </>
  );
}
