import app from './src/app.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ONDEBUS API a escutar em http://localhost:${PORT}`);
});
