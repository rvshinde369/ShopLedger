const { test } = require('node:test');
const assert = require('node:assert/strict');

const inventory = require('../lib/inventory');
const orders = require('../lib/orders');

test('CURRENT BEHAVIOUR: check accepts buying exactly the last sellable unit', () => {
  const products = [{ id: 1, name: 'Rice', stock: 1, reserved: 0 }];

  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 1 }]), { ok: true });
});

test('CURRENT BEHAVIOUR: check rejects quantity above sellable stock', () => {
  const products = [{ id: 1, name: 'Rice', stock: 1, reserved: 0 }];

  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 2 }]), {
    ok: false,
    msg: 'Rice is out of stock (1 sellable available)'
  });
});

test('CURRENT BEHAVIOUR: check accepts quantity zero when stock is sellable', () => {
  const products = [{ id: 1, name: 'Rice', stock: 1, reserved: 0 }];

  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 0 }]), { ok: true });
});

test('CURRENT BEHAVIOUR: check allows buying the last unit after reserved stock is excluded', () => {
  const products = [{ id: 1, name: 'Rice', stock: 4, reserved: 3 }];

  assert.equal(inventory.getSellableStock(products[0]), 1);
  assert.deepEqual(inventory.check(products, [{ id: 1, qty: 1 }]), { ok: true });
});

test('CURRENT BEHAVIOUR: cancelling a pending order restores stock without changing reserved', () => {
  const product = {
    id: 1,
    sku: 'RICE-001',
    name: 'Rice',
    hsn: '1006',
    price: 10,
    stock: 4,
    reserved: 3
  };
  // Match the canonical line item constructed in routes/orders.js.
  const item = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    hsn: product.hsn,
    price: product.price,
    qty: 1
  };
  const db = {
    products: [product],
    orders: [{
      id: 1001,
      status: 'pending',
      paymentMode: 'cash',
      customerId: null,
      total: 10,
      items: [item]
    }]
  };

  const beforeOrder = { stock: product.stock, reserved: product.reserved };
  inventory.reserve(db.products, db.orders[0].items);
  const afterReserve = { stock: product.stock, reserved: product.reserved };

  const result = orders.cancel(db, 1001, 'characterization');
  const afterCancel = { stock: product.stock, reserved: product.reserved };

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.deepEqual(beforeOrder, { stock: 4, reserved: 3 });
  assert.deepEqual(afterReserve, { stock: 3, reserved: 3 });
  assert.deepEqual(afterCancel, { stock: 4, reserved: 3 });
});

test('regression: last sellable unit can be sold and cancellation restores stock exactly once', () => {
  const lastUnitProduct = { id: 2, name: 'Rice', stock: 1, reserved: 0 };
  const check = inventory.check([lastUnitProduct], [{ id: 2, qty: 1 }]);

  const product = {
    id: 1,
    sku: 'RICE-001',
    name: 'Rice',
    hsn: '1006',
    price: 10,
    stock: 4,
    reserved: 3
  };
  const item = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    hsn: product.hsn,
    price: product.price,
    qty: 1
  };
  const db = {
    products: [product],
    orders: [{
      id: 2001,
      status: 'pending',
      paymentMode: 'cash',
      customerId: null,
      total: 10,
      items: [item]
    }]
  };

  inventory.reserve(db.products, db.orders[0].items);
  const afterReserve = { stock: product.stock, reserved: product.reserved };
  const firstCancel = orders.cancel(db, 2001, 'regression test');
  const afterFirstCancel = { stock: product.stock, reserved: product.reserved };
  const secondCancel = orders.cancel(db, 2001, 'regression test');
  const afterSecondCancel = { stock: product.stock, reserved: product.reserved };

  assert.deepEqual({
    check,
    afterReserve,
    firstCancelOk: firstCancel.ok,
    afterFirstCancel,
    secondCancel,
    afterSecondCancel
  }, {
    check: { ok: true },
    afterReserve: { stock: 3, reserved: 3 },
    firstCancelOk: true,
    afterFirstCancel: { stock: 4, reserved: 3 },
    secondCancel: { ok: false, error: 'Order #2001 is already cancelled' },
    afterSecondCancel: { stock: 4, reserved: 3 }
  });
});

