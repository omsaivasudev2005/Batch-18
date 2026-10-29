import { useState } from 'react'

export default function RetailerDashboard({ user, onChangeUserType, onLogout }) {
  const [orders, setOrders] = useState([])
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  function createOrder(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const quantity = Number(formData.get('quantity'))

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      setFormError('Enter a whole number greater than zero for the order quantity.')
      return
    }

    const warehouse = String(formData.get('warehouse')).trim()
    const order = {
      id: crypto.randomUUID(),
      reference: `ORD-${Date.now().toString(36).toUpperCase()}`,
      productName: String(formData.get('productName')).trim(),
      sku: String(formData.get('sku')).trim(),
      warehouse,
      quantity,
      requestedDate: String(formData.get('requestedDate')),
      createdAt: new Date().toISOString(),
    }

    setOrders((currentOrders) => [order, ...currentOrders])
    form.reset()
    setFormError('')
    setIsOrderFormOpen(false)
    setNotice(`Order draft saved for ${warehouse}; it was not sent.`)
  }

  function closeOrderForm() {
    setIsOrderFormOpen(false)
    setFormError('')
  }

  return (
    <main className="retailer-page">
      <header className="retailer-topbar">
        <a className="brand" href="#" onClick={(event) => {
          event.preventDefault()
          onChangeUserType()
        }}>
          <span className="brand-mark">t</span>
          <span>trackline<span className="brand-period">.</span></span>
        </a>
        <div className="retailer-account">
          <span className="retailer-user"><span>{(user.name || user.email).slice(0, 2).toUpperCase()}</span>{user.name || user.email}</span>
          <button className="retailer-header-button" onClick={onChangeUserType}>Change role</button>
          <button className="retailer-header-button" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <div className="retailer-content">
        <section className="retailer-heading">
          <div>
            <p className="retailer-eyebrow">RETAIL OPERATIONS</p>
            <h1>Warehouse orders</h1>
            <p>Request products from different warehouses and monitor each order.</p>
          </div>
          <button className="retailer-primary-button" onClick={() => {
            setNotice('')
            setIsOrderFormOpen(true)
          }}>
            <span aria-hidden="true">＋</span> Order from a warehouse
          </button>
        </section>

        <p className="retailer-storage-note">
          Prototype orders are saved only for this page session; requests are not sent to warehouses.
        </p>

        <section className="retailer-stats" aria-label="Order summary">
          <article className="retailer-stat-card">
            <span className="retailer-stat-icon purple" aria-hidden="true">↗</span>
            <div><p>Total orders</p><strong>{orders.length}</strong></div>
          </article>
          <article className="retailer-stat-card">
            <span className="retailer-stat-icon blue" aria-hidden="true">▦</span>
            <div><p>Units requested</p><strong>{orders.reduce((total, order) => total + order.quantity, 0).toLocaleString()}</strong></div>
          </article>
          <article className="retailer-stat-card">
            <span className="retailer-stat-icon green" aria-hidden="true">⌂</span>
            <div><p>Warehouses ordered from</p><strong>{new Set(orders.map((order) => order.warehouse.toLowerCase())).size}</strong></div>
          </article>
        </section>

        <section className="retailer-panel">
          <div className="retailer-panel-heading">
            <div>
              <h2>Order requests</h2>
              <p>Each order is associated with the warehouse selected for fulfillment.</p>
            </div>
            <span className="retailer-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
          </div>
          <div className="retailer-table-scroll">
            <table className="retailer-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Product</th>
                  <th scope="col">Warehouse</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Requested delivery</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong className="retailer-order-reference">{order.reference}</strong></td>
                    <td>
                      <div className="retailer-product">
                        <span className="retailer-product-icon" aria-hidden="true">▧</span>
                        <span><strong>{order.productName}</strong><small>SKU {order.sku}</small></span>
                      </div>
                    </td>
                    <td>{order.warehouse}</td>
                    <td><strong className="retailer-quantity">{order.quantity.toLocaleString()}</strong> units</td>
                    <td>{order.requestedDate ? new Date(`${order.requestedDate}T00:00:00`).toLocaleDateString() : 'Not specified'}</td>
                    <td><span className="retailer-order-status">Draft · not sent</span></td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td className="retailer-empty-state" colSpan={6}>
                      <span className="retailer-empty-icon" aria-hidden="true">▦</span>
                      <strong>No orders yet.</strong>
                      <span>Create an order and choose which warehouse should fulfill it.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {isOrderFormOpen && (
          <div className="retailer-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeOrderForm()
          }}>
            <section className="retailer-modal" role="dialog" aria-modal="true" aria-labelledby="retailer-order-title">
              <div className="retailer-modal-heading">
                <div>
                  <p className="retailer-eyebrow">WAREHOUSE FULFILLMENT</p>
                  <h2 id="retailer-order-title">Create a product order</h2>
                </div>
                <button className="retailer-close-button" onClick={closeOrderForm} aria-label="Close">×</button>
              </div>
              <p className="retailer-modal-description">Choose a warehouse for this request. You can select a different warehouse for each order.</p>
              <form className="retailer-order-form" onSubmit={createOrder}>
                <label>
                  Product name
                  <input name="productName" type="text" required maxLength={120} />
                </label>
                <label>
                  SKU
                  <input name="sku" type="text" required maxLength={64} />
                </label>
                <label>
                  Supplying warehouse
                  <input name="warehouse" type="text" placeholder="Enter warehouse name" required maxLength={120} />
                </label>
                <div className="retailer-form-row">
                  <label>
                    Quantity
                    <input name="quantity" type="number" min="1" step="1" required />
                  </label>
                  <label>
                    Requested delivery date
                    <input name="requestedDate" type="date" />
                  </label>
                </div>
                {formError && <p className="retailer-form-error" role="alert">{formError}</p>}
                <div className="retailer-form-actions">
                  <button className="retailer-secondary-button" type="button" onClick={closeOrderForm}>Cancel</button>
                  <button className="retailer-primary-button" type="submit">Save order draft</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {notice && <div className="retailer-toast" role="status">{notice}</div>}
      </div>
    </main>
  )
}
