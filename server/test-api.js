const http = require('http');

async function testEndpoints() {
  const req = (url, options = {}, data = null) => {
    return new Promise((resolve, reject) => {
      const u = new URL(url);
      const opt = {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };
      const r = http.request(opt, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, text: body });
          }
        });
      });
      r.on('error', reject);
      if (data) r.write(typeof data === 'string' ? data : JSON.stringify(data));
      r.end();
    });
  };

  try {
    console.log('Testing /api/health...');
    const health = await req('http://localhost:5000/api/health');
    console.log('Health:', health.data);

    console.log('\nTesting /api/menu...');
    const menu = await req('http://localhost:5000/api/menu');
    console.log(`Retrieved ${menu.data.count} dishes from source: ${menu.data.source}`);

    console.log('\nTesting /api/auth/login...');
    const login = await req('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'kubera@2026' });
    console.log('Login status:', login.status, 'Token acquired:', !!login.data.token);

    console.log('\nTesting /api/orders (Placing Order for Table 04)...');
    const order = await req('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      tableNumber: '04',
      items: [
        { id: 'kub-001', name: 'Kubera Special Chicken Dum Biryani', price: 380, quantity: 2, isVeg: false }
      ],
      customerNotes: 'Extra salan and raita please'
    });
    console.log('Order created:', order.data.data.orderNumber, 'Table:', order.data.data.tableNumber, 'Total: ₹' + order.data.data.totalAmount);

    console.log('\nTesting /api/orders (Listing Live Orders)...');
    const ordersList = await req('http://localhost:5000/api/orders');
    console.log(`Live Orders in Feed: ${ordersList.data.count}`);

    console.log('\nAll API endpoints tested successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testEndpoints();
