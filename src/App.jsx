
import React, { useState, useEffect } from "react";
import "./App.css";

const initialProducts = [
  { id: 1, name: "ຊັ້ນວາງຕິດຝາ Modern", category: "Wall Shelf", price: 0, cost: 0, stock: 10 },
  { id: 2, name: "ຊັ້ນຈັດລະບຽບໂຕະ ໄມ້", category: "Organizer", price: 0, cost: 0, stock: 10 },
  { id: 3, name: "Desktop Organizer ສີຂາວ", category: "Desktop", price: 0, cost: 0, stock: 10 },
  { id: 4, name: "ຊັ້ນວາງປຶ້ມ ໄມ້", category: "Bookshelf", price: 0, cost: 0, stock: 10 },
  { id: 5, name: "ຊັ້ນໄມ້ປະສົມເຫຼັກ", category: "Wood & Metal", price: 0, cost: 0, stock: 10 },
];

const money = (n) => Number(n || 0).toLocaleString("en-US") + " ₭";

function App() {
  const [tab, setTab] = useState("store");
  const [products, setProducts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jp_products")) || initialProducts;
    } catch {
      return initialProducts;
    }
  });
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jp_orders")) || [];
    } catch {
      return [];
    }
  });
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newStock, setNewStock] = useState("");

  useEffect(() => {
    localStorage.setItem("jp_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("jp_orders", JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product) => {
    if (product.stock <= 0) return alert("ສິນຄ້າໝົດ!");
    setCart((old) => {
      const found = old.find((p) => p.id === product.id);
      if (found) {
        if (found.qty >= product.stock) return old;
        return old.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...old, { ...product, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  const checkout = () => {
    if (!cart.length) return alert("ກະຕ່າຍັງວ່າງ!");
    if (cart.some((item) =>
      item.price <= 0 || item.qty > (products.find(p => p.id === item.id)?.stock || 0)
    )) return alert("ກວດລາຄາ ຫຼື ສະຕັອກກ່ອນສັ່ງຊື້");

    const order = {
      id: "JP-" + Date.now(),
      date: new Date().toLocaleString(),
      items: cart,
      total: cartTotal,
      status: "Pending",
      payment: "Unpaid"
    };

    setOrders((old) => [order, ...old]);
    setProducts((old) => old.map((p) => {
      const item = cart.find((c) => c.id === p.id);
      return item ? { ...p, stock: p.stock - item.qty } : p;
    }));
    setCart([]);
    alert("ສ້າງອໍເດີສຳເລັດ: " + order.id);
    setTab("orders");
  };

  const addProduct = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setProducts((old) => [...old, {
      id: Date.now(),
      name: newName,
      category: "Other",
      price: Number(newPrice),
      cost: Number(newCost),
      stock: Number(newStock)
    }]);
    setNewName("");
    setNewPrice("");
    setNewCost("");
    setNewStock("");
    alert("ເພີ່ມສິນຄ້າແລ້ວ");
  };

  const updateProduct = (id, field, value) => {
    setProducts((old) => old.map((p) =>
      p.id === id ? { ...p, [field]: Number(value) } : p
    ));
  };

  const totalSales = orders.reduce((s, o) =>
    s + (o.status === "Completed" ? o.total : 0), 0
  );
  const totalCost = orders.filter(o => o.status === "Completed")
    .reduce((s, o) => s + o.items.reduce((v, p) => v + p.cost * p.qty, 0), 0);

  const nav = [
    ["store", "🏪", "ໜ້າຮ້ານ"],
    ["products", "📦", "ສິນຄ້າ"],
    ["inventory", "🗃️", "ສະຕັອກ"],
    ["orders", "🛒", "ຄຳສັ່ງຊື້"],
    ["reports", "📊", "ລາຍງານ"],
  ];

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="jp-app">
      <header className="jp-header">
        <div>
          <h1>JPSTORE</h1>
          <small>ONLINE SHOP & MANAGEMENT</small>
        </div>
        <div className="jp-cart">🛒 {cart.length}</div>
      </header>

      <nav className="jp-nav">
        {nav.map(([id, icon, label]) => (
          <button key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}>
            {icon} {label}
          </button>
        ))}
      </nav>

      <main className="jp-main">

        {tab === "store" && <>
          <section className="jp-banner">
            <h2>WELCOME TO JPSTORE</h2>
            <p>ສິນຄ້າຈັດລະບຽບໂຕະ ແລະ ຊັ້ນວາງດີໄຊນ໌</p>
          </section>
          <input className="jp-search" placeholder="🔍 ຄົ້ນຫາສິນຄ້າ..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <h2>ສິນຄ້າທັງໝົດ</h2>
          <div className="jp-grid">
            {filtered.map(p => <article className="jp-card" key={p.id}>
              <div className="jp-product-icon">🪵</div>
              <h3>{p.name}</h3>
              <p>{p.category}</p>
              <strong>{p.price > 0 ? money(p.price) : "ລໍຖ້າກຳນົດລາຄາ"}</strong>
              <small>ຄົງເຫຼືອ: {p.stock}</small>
              <button disabled={p.stock <= 0 || p.price <= 0}
                onClick={() => addToCart(p)}>ເພີ່ມໃສ່ກະຕ່າ</button>
            </article>)}
          </div>
          <section className="jp-panel">
            <h2>🛒 ກະຕ່າສິນຄ້າ</h2>
            {cart.map(p => <p key={p.id}>{p.name} × {p.qty} — {money(p.price * p.qty)}</p>)}
            <h3>ລວມ: {money(cartTotal)}</h3>
            <button onClick={checkout} disabled={!cart.length}>ຢືນຢັນສັ່ງຊື້</button>
          </section>
        </>}

        {tab === "products" && <>
          <h2>📦 ຈັດການສິນຄ້າ</h2>
          <form className="jp-panel jp-form" onSubmit={addProduct}>
            <h3>ເພີ່ມສິນຄ້າໃໝ່</h3>
            <input required placeholder="ຊື່ສິນຄ້າ" value={newName}
              onChange={e => setNewName(e.target.value)} />
            <input type="number" min="0" placeholder="ລາຄາຂາຍ (LAK)"
              value={newPrice} onChange={e => setNewPrice(e.target.value)} />
            <input type="number" min="0" placeholder="ຕົ້ນທຶນ (LAK)"
              value={newCost} onChange={e => setNewCost(e.target.value)} />
            <input type="number" min="0" placeholder="ຈຳນວນສະຕັອກ"
              value={newStock} onChange={e => setNewStock(e.target.value)} />
            <button type="submit">+ ເພີ່ມສິນຄ້າ</button>
          </form>
          <div className="jp-panel">
            {products.map(p => <div className="jp-row" key={p.id}>
              <strong>{p.name}</strong>
              <button onClick={() => setProducts(old => old.filter(x => x.id !== p.id))}>ລົບ</button>
            </div>)}
          </div>
        </>}

        {tab === "inventory" && <>
          <h2>🗃️ ຈັດການສະຕັອກ</h2>
          <div className="jp-panel">
            {products.map(p => <div className="jp-stock" key={p.id}>
              <strong>{p.name}</strong>
              <label>ລາຄາຂາຍ (₭)
                <input type="number" min="0" value={p.price}
                  onChange={e => updateProduct(p.id, "price", e.target.value)} />
              </label>
              <label>ຕົ້ນທຶນ (₭)
                <input type="number" min="0" value={p.cost}
                  onChange={e => updateProduct(p.id, "cost", e.target.value)} />
              </label>
              <label>ສະຕັອກ
                <input type="number" min="0" value={p.stock}
                  onChange={e => updateProduct(p.id, "stock", e.target.value)} />
              </label>
            </div>)}
          </div>
        </>}

        {tab === "orders" && <>
          <h2>🛒 ຄຳສັ່ງຊື້</h2>
          {orders.length === 0 && <p>ຍັງບໍ່ມີອໍເດີ</p>}
          {orders.map(o => <div className="jp-panel" key={o.id}>
            <strong>{o.id}</strong>
            <p>{o.date}</p>
            {o.items.map(p => <p key={p.id}>{p.name} × {p.qty}</p>)}
            <h3>{money(o.total)}</h3>
            <p>Payment: {o.payment}</p>
            <select value={o.status} onChange={e =>
              setOrders(old => old.map(x => x.id === o.id
                ? { ...x, status: e.target.value } : x))}>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>)}
        </>}

        {tab === "reports" && <>
          <h2>📊 ລາຍງານຮ້ານ JPSTORE</h2>
          <div className="jp-stats">
            <div>ສິນຄ້າ<strong>{products.length}</strong></div>
            <div>ອໍເດີ<strong>{orders.length}</strong></div>
            <div>ຍອດຂາຍ<strong>{money(totalSales)}</strong></div>
            <div>ກຳໄລຂັ້ນຕົ້ນ<strong>{money(totalSales - totalCost)}</strong></div>
          </div>
          <p>ກຳໄລນີ້ຄິດສະເພາະອໍເດີ Completed ແລະຫັກຕົ້ນທຶນສິນຄ້າ. ຍັງບໍ່ລວມຄ່າສົ່ງ ແລະຄ່າໃຊ້ຈ່າຍອື່ນ.</p>
        </>}

      </main>
      <footer>© JPSTORE · LAOS · LAK</footer>
    </div>
  );
}

export default App;
