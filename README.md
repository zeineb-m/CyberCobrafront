# CyberCobra - Government Cybersecurity Platform

A modern, production-ready frontend template for government ministry cybersecurity operations. Built with React, Vite, TailwindCSS, and Three.js.

## Features

- **Dual Interface**: Front Office (public) and Back Office (admin/operator)
- **Role-Based Access Control**: Public, Operator, and Admin roles
- **Management Modules**:
  - User Management
  - Sensitive Zone Monitoring
  - Object Inventory
  - Security Equipment Tracking
  - Camera Network Management
  - Reports & Statistics
- **3D Animations**: Interactive Three.js scene on homepage
- **Dark/Light Mode**: Theme switching with smooth transitions
- **Responsive Design**: Mobile-first, fully responsive UI
- **Security-First**: Mock JWT authentication, secure token handling

## Tech Stack

- **Frontend**: React 18 (Functional Components)
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4
- **3D Graphics**: Three.js
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios (ready for integration)

## Installation

### Option 1: Using Vite CLI

\`\`\`bash
npm create vite@latest cybercobra -- --template react
cd cybercobra
npm install
npm install react-router-dom three
npm run dev
\`\`\`

### Option 2: Clone and Install

\`\`\`bash
git clone <repository-url>
cd cybercobra-platform
npm install
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── Layout.jsx
│   ├── DataTable.jsx
│   ├── Modal.jsx
│   ├── StatCard.jsx
│   ├── ChartCard.jsx
│   ├── ThreeDScene.jsx
│   └── ProtectedRoute.jsx
├── context/            # React Context for state management
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   └── admin/          # Admin pages
│       ├── UsersPage.jsx
│       ├── ZonesPage.jsx
│       ├── ObjectsPage.jsx
│       ├── EquipmentPage.jsx
│       ├── CamerasPage.jsx
│       └── ReportsPage.jsx
├── App.jsx             # Main app component with routing
├── main.jsx            # Entry point
└── index.css           # Global styles & Tailwind config
\`\`\`

## Demo Accounts

The platform includes three demo accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cybercobra.gov | admin123 |
| Operator | operator@cybercobra.gov | operator123 |
| Public | user@cybercobra.gov | user123 |

## Authentication

### Current Implementation (Mock)

The app uses mock JWT tokens stored in `sessionStorage`. Tokens include:
- User ID (`sub`)
- Name
- Email
- Roles array
- Expiration time (`exp`)

### Integrating Real Authentication

To connect to a real backend:

1. **Replace mock login in `src/context/AuthContext.jsx`**:

\`\`\`javascript
const login = async (email, password) => {
  const response = await axios.post('/api/auth/login', { email, password })
  const { token, user } = response.data
  
  setUser(user)
  setToken(token)
  // Use HttpOnly cookies instead of sessionStorage for production
  // The server should set: Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict
  
  return user
}
\`\`\`

2. **Update API calls** in all pages to use your backend endpoints

3. **Security Best Practices**:
   - Use HttpOnly cookies for token storage (not localStorage)
   - Implement CSRF protection
   - Use HTTPS in production
   - Validate tokens on the backend
   - Implement token refresh mechanism

## Customization

### Changing Colors

Edit the theme variables in `src/index.css`:

\`\`\`css
@theme inline {
  --color-primary: #0f172a;
  --color-accent: #06b6d4;
  /* ... other colors ... */
}
\`\`\`

### Adding New Pages

1. Create a new file in `src/pages/`
2. Add the route in `src/App.jsx`
3. Add navigation link in `src/components/Sidebar.jsx`

### Integrating Real API

Replace mock data with API calls using Axios:

\`\`\`javascript
import axios from 'axios'

const fetchZones = async () => {
  const response = await axios.get('/api/zones', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}
\`\`\`

## 3D Scene

The homepage features an interactive Three.js scene with:
- Rotating icosahedron with cyan glow
- Wireframe overlay
- Floating particles
- Dynamic lighting
- Responsive to window resize

Customize in `src/components/ThreeDScene.jsx`

## Performance Optimization

- Lazy-load 3D scene (only on homepage)
- Code splitting with React Router
- Optimized images and assets
- Efficient re-renders with React Context

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader friendly

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Development

\`\`\`bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## Deployment

### Vercel (Recommended)

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Other Platforms

\`\`\`bash
npm run build
# Deploy the 'dist' folder to your hosting
\`\`\`

## Security Notes

⚠️ **Important**: This is a frontend template. For production:

1. **Never store sensitive data in localStorage/sessionStorage**
   - Use HttpOnly cookies set by the server
   - Implement token refresh mechanism

2. **Validate all user input** on the backend

3. **Implement CORS properly** on your backend

4. **Use HTTPS** in production

5. **Implement rate limiting** on authentication endpoints

6. **Add CSRF protection** tokens

7. **Sanitize all user-generated content**

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open an issue in the repository.

---

**CyberCobra v1.0** - Ministry of Interior Security Platform
