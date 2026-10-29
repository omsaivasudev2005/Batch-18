# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Spring Boot authentication API

The client displays the user-type chooser first, then requires a successful API login for the selected role. The backend is not included in this repository.

Configure the Spring Boot API origin with a Vite environment variable:

```env
VITE_API_URL=http://localhost:8080
```

The client sends:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password",
  "requestedRole": "RETAILER"
}
```

`requestedRole` is one of `ADMIN`, `PRODUCT_MANUFACTURER`, `WAREHOUSE_MANAGER`, or `RETAILER`. The backend must reject the request unless the authenticated account is assigned that role. On success, return HTTP 200 with a bearer token and the authenticated user's assigned role:

```json
{
  "token": "access-token",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "RETAILER"
  }
}
```

Return a non-2xx response for invalid credentials or an unassigned role, preferably with a JSON `message` property for the sign-in form to display. The client also checks the returned user role before allowing access. It keeps the token in memory and sends it as `Authorization: Bearer <token>` on subsequent requests; refreshing the page requires signing in again. Configure Spring Boot CORS to allow the Vite development origin.

The client-side role check is only a usability guard, not authorization. Spring Boot must enforce the user's permissions on login and every protected API, and must not trust the role selected in the browser. The Admin user list is still a prototype and is not connected to server-side user-management APIs.

## Warehouse inventory API

The Warehouse manager screen currently calculates on-hand stock and recent receipts in page memory. It does not persist data or load shared inventory. To make warehouse records persistent across sessions and users, implement authenticated Spring Boot endpoints such as:

- `GET /api/warehouse/inventory` — return stock grouped by product and manufacturer, including SKU, on-hand quantity, reorder level, and last-received timestamp.
- `GET /api/warehouse/receipts` — return recent product receipts with manufacturer, SKU, quantity, and received timestamp.
- `POST /api/warehouse/receipts` — record a receipt with `productName`, `sku`, `manufacturer`, `quantity`, and `reorderLevel`; update the matching product/manufacturer stock atomically.
- `GET /api/warehouse/orders` — return stock order requests and manufacturer fulfillment status.
- `POST /api/warehouse/orders` — submit a stock request with `productName`, `sku`, `manufacturerId`, `quantity`, and optional `requestedDeliveryDate`; persist it and notify/assign it to the selected manufacturer.
- `GET /api/retailer/orders` — return the retailer's orders and fulfillment status.
- `POST /api/retailer/orders` — submit an order with `productName`, `sku`, `warehouseId`, `quantity`, and optional `requestedDeliveryDate`; persist it and assign it to the selected warehouse.

Restrict these endpoints to users assigned the `WAREHOUSE_MANAGER` role (and any explicitly authorized admin role). The Spring Boot service must validate quantities and calculate stock from persisted receipts rather than trusting client-provided totals.

The Warehouse manager can prepare separate stock-order drafts for different product manufacturers. The Retailer can prepare separate orders for different warehouses. Both screens currently save drafts in page memory only; they do not submit orders or notify counterparties. Connect them to the authenticated order endpoints and use server-managed manufacturer/warehouse directories before treating requests as submitted orders.
