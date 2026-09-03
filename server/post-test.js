(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3001/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prenom: 'Web', nom: 'Visitor', message: 'Test envoi depuis post-test.js' })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (e) {
    console.error('Request failed:', e);
  }
})();
