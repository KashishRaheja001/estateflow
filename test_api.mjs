fetch('https://estateflow-seven.vercel.app/api/properties/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ location: 'Gurgaon', configuration: '3 BHK' })
})
.then(res => res.text())
.then(console.log)
.catch(console.error);
