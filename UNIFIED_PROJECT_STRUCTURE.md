# Unified Project Structure

The project has been restructured from separate `frontend/` and `backend/` directories into a single unified project structure.

## New Structure

```
JITS/
├── src/
│   ├── client/          # Frontend React application
│   │   ├── pages/       # React pages
│   │   ├── context/     # React context providers
│   │   ├── utils/       # Frontend utilities
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.html
│   │   └── index.css
│   └── server/          # Backend Express application
│       ├── routes/       # API routes
│       ├── middleware/  # Express middleware
│       ├── utils/       # Backend utilities
│       ├── prisma/      # Prisma seed file
│       └── index.ts     # Server entry point
├── prisma/
│   └── schema.prisma    # Prisma schema (moved to root)
├── dist/                # Build output
│   ├── client/          # Built frontend
│   └── server/          # Compiled backend
├── package.json         # Unified dependencies
├── vite.config.ts       # Vite config (moved to root)
├── tsconfig.json        # TypeScript config for server
└── tailwind.config.js   # Tailwind config (moved to root)
```

## Key Changes

1. **Single package.json**: All dependencies (frontend + backend) are now in the root `package.json`
2. **Unified build**: Single build process that builds both client and server
3. **Development**: Run `npm run dev` to start both frontend and backend concurrently
4. **Production**: Server serves static files from built client in production mode

## Scripts

- `npm run dev` - Start both frontend (port 3001) and backend (port 5001) in development mode
- `npm run dev:server` - Start only the backend server
- `npm run dev:client` - Start only the frontend dev server
- `npm run build` - Build both client and server for production
- `npm run build:client` - Build only the frontend
- `npm run build:server` - Build only the backend
- `npm start` - Start the production server (serves both API and frontend)
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed the database

## Development

In development mode:
- Frontend runs on `http://localhost:3001` (Vite dev server)
- Backend runs on `http://localhost:5001` (Express server)
- Vite proxies `/api/*` requests to the backend

## Production

In production mode:
- Backend serves the built frontend static files
- All routes except `/api/*` serve the React app
- Single server handles both API and frontend

## Migration Notes

- Old `frontend/` and `backend/` directories are kept for reference but are no longer used
- Prisma schema moved from `backend/prisma/` to root `prisma/`
- All configuration files moved to root level
- API routes updated to use new import paths

## Next Steps (Optional Cleanup)

You can safely delete the old directories after verifying everything works:
- `frontend/` directory (no longer needed)
- `backend/` directory (no longer needed)

Make sure to test the application thoroughly before deleting these directories.



