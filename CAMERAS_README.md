# CyberCobra Frontend - Camera Management

## New Pages Added

### Camera Network Management
- **Route**: `/cameras`
- **Features**:
  - List all cameras with search functionality
  - Add new cameras
  - Edit existing cameras
  - Delete cameras
  - Real-time status badges (Recording/Offline/Maintenance)
  - Responsive table layout

### Camera Properties
- **Name**: Camera identifier (e.g., "Front Gate")
- **Zone**: Location/area (e.g., "Zone A", "Parking Lot")
- **IP Address**: Camera network address (IPv4/IPv6)
- **Resolution**: Video quality (720p, 1080p, 2K, 4K)
- **Status**: Current state (RECORDING, OFFLINE, MAINTENANCE)

## API Integration

The frontend communicates with the Django backend via REST API:
- Base URL: `http://localhost:8000/api/`
- Endpoints: `/cameras/` for CRUD operations
- Authentication: JWT Bearer token (stored in sessionStorage/localStorage)

## Running the Frontend

```bash
cd CyberCobra_front
npm install
npm run dev
```

Access the app at `http://localhost:3000` (or configured port)

## Navigation

The cameras page can be accessed from:
1. Direct URL: `/cameras`
2. Navigation sidebar (if configured)
3. Dashboard links (if configured)

## Components Used

- **shadcn/ui** components:
  - Table for data display
  - Dialog for add/edit forms
  - Select for dropdowns
  - Input for text fields
  - Button for actions
  - Badge for status indicators
  - Toast for notifications

## Development Notes

- Built with Next.js 14+ (App Router)
- TypeScript for type safety
- Tailwind CSS for styling
- Client-side rendering ("use client")
- Real-time validation and error handling
