import * as React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Routes, Route, Link as RLink } from 'react-router-dom';
import Shortener from './pages/Shortener';
import Stats from './pages/Stats';

export default function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AffordMed URL Shortener
          </Typography>
          <Button color="inherit" component={RLink} to="/">Shorten</Button>
          <Button color="inherit" component={RLink} to="/stats">Stats</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Shortener />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Container>
    </>
  );
}
