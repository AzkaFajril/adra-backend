# Backend API

Express + MongoDB service that stores hero slides and uploads images to Cloudinary.

## Requirements

- Node.js 18+
- MongoDB database URI
- Cloudinary account (cloud name, API key, API secret)

## Setup

```bash
cd backend
npm install
cp env.example .env
# update .env with your credentials
npm run dev
```

### Environment variables

| Key | Description |
| --- | --- |
| `PORT` | Port for Express (default 5000) |
| `MONGODB_URI` | Connection string to MongoDB |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud |
| `CLOUDINARY_API_KEY` | Cloudinary key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `ALLOWED_ORIGINS` | Comma-separated origins for CORS |
| `JWT_SECRET` | Secret used to sign admin tokens |
| `ADMIN_SETUP_CODE` | Shared code required to create the first admin |

## API

- `POST /api/auth/register` — create an admin (requires `setupCode` that matches `ADMIN_SETUP_CODE`)
- `POST /api/auth/login` — returns JWT for dashboard
- `GET /api/auth/me` — returns current admin profile
- `GET /api/slides` — list slides (public)
- `POST /api/slides` — create slide (authenticated multipart with `title`, `subtitle`, `image`)
- `PUT /api/slides/:id` — update slide (authenticated, optionally include new `image`)
- `DELETE /api/slides/:id` — remove slide (authenticated)
- `GET /api/products` — list products (public)
- `POST /api/products` — create product (auth + multipart). Fields: `name`, `description`, `longDescription`, `price`, optional `currency`, `links` JSON (or `shopee`, `tiktok`, `whatsapp`), file `mainImage`, optional multiple `gallery`.
- `PUT /api/products/:id` — update product (auth + multipart)
- `DELETE /api/products/:id` — remove product (auth)

Send the JWT in the `Authorization: Bearer <token>` header for the protected slide routes. All responses are JSON except the `204` from delete (no body).

