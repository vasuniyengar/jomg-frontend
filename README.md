# JOMG Frontend Setup Guide

This guide ensures frontend connects correctly to backend auth APIs (signin + logout) and navigates to dashboard/login as expected.

## 1) Prerequisites

- Node.js `>=20`
- npm
- Backend API up and running (recommended on `http://localhost:4000`)

## 2) Install dependencies

From frontend root:

```bash
npm install
```

## 3) Configure frontend environment

Create `.env` in frontend root:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

If your backend runs on a different port, update this value.

After saving `.env`, restart frontend server if it was already running.

## 4) Start frontend

```bash
npm run dev
```

Open:

`http://localhost:3000/admin/login`