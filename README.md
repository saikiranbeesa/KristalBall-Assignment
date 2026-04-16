# Military Asset Management System

A comprehensive web-based system for managing military assets across multiple bases with role-based access control.

## Project Structure

```
military-asset-management/
├── src/                          # React frontend
│   ├── pages/                    # Page components
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   ├── PurchasesPage.js
│   │   ├── TransfersPage.js
│   │   └── AssignmentsPage.js
│   ├── App.js
│   └── App.css
└── backend/                      # Node.js Express backend
    ├── middleware/               # Authentication middleware
    │   └── auth.js
    ├── routes/                   # API routes
    │   ├── auth.js
    │   ├── dashboard.js
    │   ├── purchases.js
    │   ├── transfers.js
    │   └── assignments.js
    ├── database.js               # SQLite database setup
    ├── server.js                 # Main server entry point
    ├── package.json
    └── .env                      # Environment variables
```

## Technology Stack

### Frontend
- **React**: UI library
- **Axios**: HTTP client for API calls
- **CSS3**: Styling

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **SQLite3**: Relational database
- **JWT**: Authentication
- **bcryptjs**: Password hashing

## Features

### Dashboard
- Real-time metrics display (Opening Balance, Closing Balance, Net Movement)
- Filter by base, equipment type, and date range
- Net Movement breakdown (Purchases, Transfers In, Transfers Out)
- Assigned and Expended assets tracking

### Purchases Page
- Record equipment purchases for bases
- View purchase history
- Filter by equipment type and date
- Track purchase costs

### Transfers Page
- Transfer assets between bases
- Maintain complete transfer history
- Filter by source/destination base and date
- Timestamp all transfers for audit trail

### Assignments & Expenditures
- Assign assets to personnel
- Track asset expenditures with reasons
- Filter and view historical records
- Two-tab interface for assignments and expenditures

### Role-Based Access Control (RBAC)
- **Admin**: Full system access
- **Base Commander**: Access to data for assigned base only
- **Logistics Officer**: Limited access to purchases and transfers

### Security Features
- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based authorization
- Audit logging for all transactions

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the React app directory:
```bash
cd military-asset-management
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Default Demo Users

After running the backend, use these credentials to login:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| commander | pass123 | Base Commander |
| logistics | pass123 | Logistics Officer |

**Note**: These are demo credentials. Change them in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Dashboard
- `GET /api/dashboard/metrics` - Get asset metrics (with filters)
- `GET /api/dashboard/net-movement/:base_id/:equipment_type_id` - Get net movement details

### Purchases
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases` - Record new purchase
- `GET /api/purchases/:id` - Get single purchase

### Transfers
- `GET /api/transfers` - Get all transfers
- `POST /api/transfers` - Record new transfer
- `GET /api/transfers/:id` - Get single transfer

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Record new assignment
- `GET /api/assignments/expenditure` - Get all expenditures
- `POST /api/assignments/expenditure` - Record expenditure

## Database Schema

### Tables
- **users** - System users with roles
- **bases** - Military bases
- **equipment_types** - Types of equipment
- **asset_inventory** - Current asset inventory
- **purchases** - Equipment purchases
- **transfers** - Asset transfers between bases
- **assignments** - Asset assignments to personnel
- **expenditures** - Asset expenditures
- **audit_logs** - All transaction logs

## Development Tips

### CORS Configuration
The frontend connects to `http://localhost:5000`. If you change the backend URL, update the `API_BASE` constant in [src/App.js](src/App.js).

### Database Reset
To reset the database completely, delete `backend/military_assets.db` and restart the server.

### Adding Demo Data
You can manually add demo bases and equipment types through the database or API:

```javascript
// Example: Add a base
POST http://localhost:5000/api/bases
{
  "name": "Base Alpha",
  "location": "Northern Region"
}

// Example: Add equipment type
POST http://localhost:5000/api/equipment-types
{
  "name": "Rifles",
  "description": "Military rifles"
}
```

## Security Considerations

1. **Change JWT_SECRET**: Update the JWT_SECRET in production
2. **Use HTTPS**: Always use HTTPSin production
3. **Validate Inputs**: All inputs are validated on the backend
4. **Database Backups**: Regular backups of SQLite database
5. **Audit Logs**: Review audit logs regularly for suspicious activities

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:
```bash
# Change PORT in backend/.env
PORT=5001
```

### Database Connection Error
Ensure SQLite3 is properly installed:
```bash
npm install --save sqlite3
```

### CORS Errors
Ensure the backend server is running and accessible at `http://localhost:5000`

## Future Enhancements

1. Real-time notifications
2. Advanced analytics and reporting
3. Mobile app version
4. Multi-language support
5. Integration with external systems
6. Two-factor authentication
7. Advanced search and filtering
8. Bulk operations
9. Historical data analysis
10. Email notifications

## License

This project is provided for educational purposes.

## Contact

For questions or issues, please contact the development team.
