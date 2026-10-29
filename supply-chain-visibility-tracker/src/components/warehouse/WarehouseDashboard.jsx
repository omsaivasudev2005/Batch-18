import { useMemo, useState } from 'react'

const stockFilters = ['All products', 'Low stock']

function getStockKey(receipt) {
  return `${receipt.sku.trim().toLowerCase()}::${receipt.manufacturer.trim().toLowerCase()}`
}

function summarizeInventory(receipts) {
  const inventory = new Map()

  for (const receipt of receipts) {
    const key = getStockKey(receipt)
    const product = inventory.get(key)

    if (product) {
      product.quantity += receipt.quantity
      if (receipt.receivedAt > product.lastReceivedAt) {
        product.lastReceivedAt = receipt.receivedAt
        product.reorderLevel = receipt.reorderLevel
        product.productName = receipt.productName
      }
    } else {
      inventory.set(key, {
        key,
        productName: receipt.productName,
        sku: receipt.sku,
        manufacturer: receipt.manufacturer,
        quantity: receipt.quantity,
        reorderLevel: receipt.reorderLevel,
        lastReceivedAt: receipt.receivedAt,
      })
    }
  }

  return [...inventory.values()]
}

export default function WarehouseDashboard({ user, onChangeUserType, onLogout }) {
  const [receipts, setReceipts] = useState([])
  const [stockOrders, setStockOrders] = useState([])
  const [query, setQuery] = useState('')
  const [manufacturerFilter, setManufacturerFilter] = useState('All manufacturers')
  const [stockFilter, setStockFilter] = useState('All products')
  const [isReceiveFormOpen, setIsReceiveFormOpen] = useState(false)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const inventory = useMemo(() => summarizeInventory(receipts), [receipts])
  const lowStockCount = inventory.filter(
    (product) => product.reorderLevel > 0 && product.quantity <= product.reorderLevel,
  ).length
  const manufacturers = [...new Set(inventory.map((product) => product.manufacturer))].sort()
  const normalizedQuery = query.trim().toLowerCase()
  const filteredInventory = inventory.filter((product) => {
    const matchesSearch = [
      product.productName,
      product.sku,
      product.manufacturer,
    ].some((value) => value.toLowerCase().includes(normalizedQuery))
    const matchesManufacturer = manufacturerFilter === 'All manufacturers'
      || product.manufacturer === manufacturerFilter
    const isLowStock = product.reorderLevel > 0 && product.quantity <= product.reorderLevel
    const matchesStock = stockFilter === 'All products' || isLowStock
    return matchesSearch && matchesManufacturer && matchesStock
  })

  function recordReceipt(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const quantity = Number(formData.get('quantity'))
    const reorderLevel = Number(formData.get('reorderLevel') || 0)

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      setFormError('Enter a whole number greater than zero for the received quantity.')
      return
    }
    if (!Number.isSafeInteger(reorderLevel) || reorderLevel < 0) {
      setFormError('The reorder level must be a non-negative whole number.')
      return
    }

    setReceipts((currentReceipts) => [
      {
        id: crypto.randomUUID(),
        productName: String(formData.get('productName')).trim(),
        sku: String(formData.get('sku')).trim(),
        manufacturer: String(formData.get('manufacturer')).trim(),
        quantity,
        reorderLevel,
        receivedAt: new Date().toISOString(),
      },
      ...currentReceipts,
    ])
    form.reset()
    setFormError('')
    setIsReceiveFormOpen(false)
    setNotice('Product receipt recorded and stock updated.')
  }

  function closeReceiveForm() {
    setIsReceiveFormOpen(false)
    setFormError('')
  }

  function createStockOrder(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const quantity = Number(formData.get('quantity'))

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      setFormError('Enter a whole number greater than zero for the order quantity.')
      return
    }

    setStockOrders((currentOrders) => [
      {
        id: crypto.randomUUID(),
        reference: `REQ-${Date.now().toString(36).toUpperCase()}`,
        productName: String(formData.get('productName')).trim(),
        sku: String(formData.get('sku')).trim(),
        manufacturer: String(formData.get('manufacturer')).trim(),
        quantity,
        expectedDate: String(formData.get('expectedDate')),
        createdAt: new Date().toISOString(),
      },
      ...currentOrders,
    ])
    form.reset()
    setFormError('')
    setIsOrderFormOpen(false)
    setNotice('Stock order request saved as a local draft; it was not sent to the manufacturer.')
  }

  function closeOrderForm() {
    setIsOrderFormOpen(false)
    setFormError('')
  }

  return (
    <main className="warehouse-page">
      <header className="warehouse-topbar">
        <a className="brand" href="#" onClick={(event) => {
          event.preventDefault()
          onChangeUserType()
        }}>
          <span className="brand-mark">t</span>
          <span>trackline<span className="brand-period">.</span></span>
        </a>
        <div className="warehouse-account">
          <span className="warehouse-user"><span>{(user.name || user.email).slice(0, 2).toUpperCase()}</span>{user.name || user.email}</span>
          <button className="warehouse-header-button" onClick={onChangeUserType}>Change role</button>
          <button className="warehouse-header-button" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <div className="warehouse-content">
        <section className="warehouse-heading">
          <div>
            <p className="warehouse-eyebrow">WAREHOUSE OPERATIONS</p>
            <h1>Receiving &amp; stock</h1>
            <p>Track manufacturer deliveries and keep product inventory up to date.</p>
          </div>
          <div className="warehouse-heading-actions">
            <button className="warehouse-primary-button" onClick={() => {
              setNotice('')
              setIsReceiveFormOpen(true)
            }}>
              <span aria-hidden="true">＋</span> Record received products
            </button>
            <button className="warehouse-order-button" onClick={() => {
              setNotice('')
              setIsOrderFormOpen(true)
            }}>
              Order stock
            </button>
          </div>
        </section>

        <p className="warehouse-storage-note">
          Prototype inventory and orders are kept only for this page session; requests are not sent to manufacturers.
        </p>

        <section className="warehouse-stats" aria-label="Inventory summary">
          <article className="warehouse-stat-card">
            <span className="warehouse-stat-icon purple" aria-hidden="true">▦</span>
            <div><p>Products tracked</p><strong>{inventory.length}</strong></div>
          </article>
          <article className="warehouse-stat-card">
            <span className="warehouse-stat-icon blue" aria-hidden="true">▤</span>
            <div><p>Total units in stock</p><strong>{inventory.reduce((total, product) => total + product.quantity, 0).toLocaleString()}</strong></div>
          </article>
          <article className="warehouse-stat-card">
            <span className="warehouse-stat-icon green" aria-hidden="true">⌂</span>
            <div><p>Manufacturers</p><strong>{manufacturers.length}</strong></div>
          </article>
          <article className="warehouse-stat-card">
            <span className="warehouse-stat-icon orange" aria-hidden="true">!</span>
            <div><p>Low-stock products</p><strong>{lowStockCount}</strong></div>
          </article>
          <article className="warehouse-stat-card">
            <span className="warehouse-stat-icon purple" aria-hidden="true">↗</span>
            <div><p>Order requests</p><strong>{stockOrders.length}</strong></div>
          </article>
        </section>

        <section className="warehouse-panel">
          <div className="warehouse-panel-heading">
            <div>
              <h2>Product stock</h2>
              <p>Current on-hand quantity grouped by product and manufacturer.</p>
            </div>
            <span className="warehouse-count">{inventory.length} {inventory.length === 1 ? 'product' : 'products'}</span>
          </div>

          <div className="warehouse-toolbar">
            <label className="warehouse-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search product, SKU, or manufacturer"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search inventory"
              />
            </label>
            <label className="warehouse-select">
              <span className="visually-hidden">Filter by manufacturer</span>
              <select value={manufacturerFilter} onChange={(event) => setManufacturerFilter(event.target.value)}>
                <option>All manufacturers</option>
                {manufacturers.map((manufacturer) => <option key={manufacturer}>{manufacturer}</option>)}
              </select>
            </label>
            <div className="warehouse-filter-tabs" aria-label="Filter by stock level">
              {stockFilters.map((filter) => (
                <button
                  className={stockFilter === filter ? 'selected' : ''}
                  key={filter}
                  onClick={() => setStockFilter(filter)}
                  aria-pressed={stockFilter === filter}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="warehouse-table-scroll">
            <table className="warehouse-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Manufacturer</th>
                  <th scope="col">On hand</th>
                  <th scope="col">Reorder level</th>
                  <th scope="col">Last received</th>
                  <th scope="col">Stock status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((product) => {
                  const isLowStock = product.reorderLevel > 0 && product.quantity <= product.reorderLevel
                  return (
                    <tr key={product.key}>
                      <td>
                        <div className="warehouse-product">
                          <span className="warehouse-product-icon" aria-hidden="true">▧</span>
                          <span><strong>{product.productName}</strong><small>SKU {product.sku}</small></span>
                        </div>
                      </td>
                      <td>{product.manufacturer}</td>
                      <td><strong className="warehouse-quantity">{product.quantity.toLocaleString()}</strong> units</td>
                      <td>{product.reorderLevel.toLocaleString()} units</td>
                      <td>{new Date(product.lastReceivedAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`warehouse-stock-status ${isLowStock ? 'low' : 'in-stock'}`}>
                          {isLowStock ? 'Low stock' : 'In stock'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td className="warehouse-empty-state" colSpan={6}>
                      <span className="warehouse-empty-icon" aria-hidden="true">▦</span>
                      <strong>{inventory.length === 0 ? 'No product stock recorded yet.' : 'No products match these filters.'}</strong>
                      <span>Record products received from a manufacturer to start monitoring stock.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="warehouse-panel">
          <div className="warehouse-panel-heading">
            <div>
              <h2>Stock order requests</h2>
              <p>Draft requests to replenish stock from product manufacturers.</p>
            </div>
            <span className="warehouse-count">{stockOrders.length} {stockOrders.length === 1 ? 'request' : 'requests'}</span>
          </div>
          {stockOrders.length === 0 ? (
            <p className="warehouse-receipts-empty">No stock order requests yet.</p>
          ) : (
            <div className="warehouse-table-scroll">
              <table className="warehouse-table">
                <thead>
                  <tr>
                    <th scope="col">Request</th>
                    <th scope="col">Product</th>
                    <th scope="col">Manufacturer</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Requested delivery</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong className="warehouse-quantity">{order.reference}</strong></td>
                      <td><div className="warehouse-product"><span><strong>{order.productName}</strong><small>SKU {order.sku}</small></span></div></td>
                      <td>{order.manufacturer}</td>
                      <td><strong className="warehouse-quantity">{order.quantity.toLocaleString()}</strong> units</td>
                      <td>{order.expectedDate ? new Date(`${order.expectedDate}T00:00:00`).toLocaleDateString() : 'Not specified'}</td>
                      <td><span className="warehouse-stock-status low">Draft · not sent</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="warehouse-panel warehouse-receipts-panel">
          <div className="warehouse-panel-heading">
            <div>
              <h2>Recent receipts</h2>
              <p>Products most recently received from manufacturers.</p>
            </div>
            <span className="warehouse-count">{receipts.length} {receipts.length === 1 ? 'receipt' : 'receipts'}</span>
          </div>
          {receipts.length === 0 ? (
            <p className="warehouse-receipts-empty">No receipts recorded yet.</p>
          ) : (
            <ul className="warehouse-receipt-list">
              {receipts.slice(0, 5).map((receipt) => (
                <li key={receipt.id}>
                  <span className="warehouse-receipt-icon" aria-hidden="true">↓</span>
                  <span className="warehouse-receipt-copy">
                    <strong>{receipt.productName}</strong>
                    <small>{receipt.sku} · Received from {receipt.manufacturer}</small>
                  </span>
                  <strong className="warehouse-receipt-quantity">+{receipt.quantity.toLocaleString()}</strong>
                  <time dateTime={receipt.receivedAt}>{new Date(receipt.receivedAt).toLocaleDateString()}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isReceiveFormOpen && (
          <div className="warehouse-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeReceiveForm()
          }}>
            <section className="warehouse-modal" role="dialog" aria-modal="true" aria-labelledby="receive-title">
              <div className="warehouse-modal-heading">
                <div>
                  <p className="warehouse-eyebrow">INBOUND INVENTORY</p>
                  <h2 id="receive-title">Record a product receipt</h2>
                </div>
                <button className="warehouse-close-button" onClick={closeReceiveForm} aria-label="Close">×</button>
              </div>
              <p className="warehouse-modal-description">Record the manufacturer and quantity received to update stock levels.</p>
              <form className="warehouse-receive-form" onSubmit={recordReceipt}>
                <label>
                  Product name
                  <input name="productName" type="text" required maxLength={120} />
                </label>
                <label>
                  SKU
                  <input name="sku" type="text" required maxLength={64} />
                </label>
                <label>
                  Product manufacturer
                  <input name="manufacturer" type="text" required maxLength={120} />
                </label>
                <div className="warehouse-form-row">
                  <label>
                    Quantity received
                    <input name="quantity" type="number" min="1" step="1" required />
                  </label>
                  <label>
                    Reorder level
                    <input name="reorderLevel" type="number" min="0" step="1" defaultValue="0" required />
                  </label>
                </div>
                {formError && <p className="warehouse-form-error" role="alert">{formError}</p>}
                <div className="warehouse-form-actions">
                  <button className="warehouse-secondary-button" type="button" onClick={closeReceiveForm}>Cancel</button>
                  <button className="warehouse-primary-button" type="submit">Save receipt</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {isOrderFormOpen && (
          <div className="warehouse-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeOrderForm()
          }}>
            <section className="warehouse-modal" role="dialog" aria-modal="true" aria-labelledby="order-title">
              <div className="warehouse-modal-heading">
                <div>
                  <p className="warehouse-eyebrow">MANUFACTURER ORDER</p>
                  <h2 id="order-title">Request stock</h2>
                </div>
                <button className="warehouse-close-button" onClick={closeOrderForm} aria-label="Close">×</button>
              </div>
              <p className="warehouse-modal-description">Prepare a stock request for a product manufacturer. This prototype saves a local draft only.</p>
              <form className="warehouse-receive-form" onSubmit={createStockOrder}>
                <label>
                  Product name
                  <input name="productName" type="text" required maxLength={120} />
                </label>
                <label>
                  SKU
                  <input name="sku" type="text" required maxLength={64} />
                </label>
                <label>
                  Product manufacturer
                  <input name="manufacturer" type="text" list="warehouse-manufacturers" required maxLength={120} />
                  <datalist id="warehouse-manufacturers">
                    {manufacturers.map((manufacturer) => <option key={manufacturer} value={manufacturer} />)}
                  </datalist>
                </label>
                <div className="warehouse-form-row">
                  <label>
                    Quantity requested
                    <input name="quantity" type="number" min="1" step="1" required />
                  </label>
                  <label>
                    Requested delivery date
                    <input name="expectedDate" type="date" />
                  </label>
                </div>
                {formError && <p className="warehouse-form-error" role="alert">{formError}</p>}
                <div className="warehouse-form-actions">
                  <button className="warehouse-secondary-button" type="button" onClick={closeOrderForm}>Cancel</button>
                  <button className="warehouse-primary-button" type="submit">Save order draft</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {notice && <div className="warehouse-toast" role="status">{notice}</div>}
      </div>
    </main>
  )
}
