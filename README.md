# Philadelphia Crime Analytics

A modern, full-stack web application for analyzing Philadelphia violent crime data with real-time statistics, year-based filtering, and clean data visualization.

## Features

### Backend (Spring Boot)
- **Real-time Data Integration**: Automatically fetches violent crime data from Philadelphia's official API
- **Historical Data Analysis**: Complete dataset from 2006-2025 with year-based filtering
- **Crime Type Analysis**: Breakdown by UCR codes (Homicide, Rape, Robbery, Aggravated Assault)
- **Automated Updates**: Hourly data refresh from Philadelphia crime database
- **RESTful API**: Clean endpoints for frontend consumption
- **Robust Error Handling**: Fallback to sample data if APIs are unavailable

### Frontend (React + Material-UI)
- **Modern UI**: Clean, responsive design with Material-UI components
- **Multi-tab Interface**: Organized navigation between Dashboard, Yearly Analysis, and Crime Map
- **Interactive Year Sorting**: Dropdown to filter incidents by year
- **Real-time Statistics**: Live crime statistics with color-coded cards
- **Advanced Search**: Filter incidents by crime type, location, or district
- **Data Table**: Paginated table with sorting and filtering capabilities
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Architecture

```
PhillyViolence/
├── src/main/java/              # Spring Boot Backend
│   ├── Controllers/            # REST API endpoints
│   ├── Models/                 # Data models and entities
│   ├── Repositories/           # Data access layer
│   ├── Services/               # Business logic
│   └── Config/                 # Security and configuration
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   └── services/           # API service layer
│   └── public/                 # Static assets
└── target/                     # Build artifacts
```

## Technology Stack

### Backend
- **Java 21** - Modern Java features
- **Spring Boot 3.5.3** - Framework for rapid development
- **Spring Data JPA** - Database abstraction
- **Spring Security** - Authentication and authorization
- **H2 Database** - In-memory database for development
- **JSON Simple** - JSON parsing for API data
- **Maven** - Dependency management

### Frontend
- **React 18** - Modern frontend framework
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client for API calls
- **Vite** - Fast build tool and dev server

## API Endpoints

### Incident Management
- `GET /api/incidents` - Get all incidents
- `GET /api/incidents/stats` - Get crime statistics
- `GET /api/incidents/by-year/{year}` - Get incidents by specific year
- `GET /api/incidents/sorted-by-year` - Get all incidents sorted by year
- `GET /api/incidents/crime-type/{ucrCode}` - Get incidents by crime type
- `POST /api/incidents/refresh` - Manually refresh data from Philadelphia API

### Statistics Response Example
```json
{
  "totalViolentCrimes": 986,
  "homicides": 45,
  "rapes": 23,
  "robberies": 312,
  "assaults": 606
}
```

## Getting Started

### Prerequisites
- Java 21 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup
1. Clone the repository
2. Navigate to the project root
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Backend will be available at `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Frontend will be available at `http://localhost:3000`

## Data Sources

The application uses Philadelphia's official crime data API:
- **Primary Source**: Philadelphia Police Department incident database
- **API Endpoint**: `phl.carto.com/api/v2/sql`
- **Data Coverage**: 2006-2025 violent crimes (UCR codes 100-400)
- **Update Frequency**: Hourly automatic refresh
- **Fallback**: Enhanced sample data if API is unavailable

## Key Features in Detail

### Year-Based Analysis
- **Dynamic Year Selection**: Choose specific years or view all years
- **Comparative Statistics**: See crime trends across different years
- **Filtered Data Table**: View detailed incident information by year
- **Search Functionality**: Search within year-filtered results

### Clean Frontend Design
- **Material-UI Components**: Professional, consistent design
- **Responsive Layout**: Adapts to all screen sizes
- **Color-coded Statistics**: Visual distinction between crime types
- **Interactive Elements**: Hover effects and smooth transitions
- **Loading States**: Professional loading indicators
- **Error Handling**: User-friendly error messages

### Data Visualization
- **Statistics Cards**: Key metrics at a glance
- **Recent Incidents**: Latest crime reports with details
- **Tabular Data**: Comprehensive incident listing with pagination
- **Search and Filter**: Find specific incidents quickly

## Development

### Backend Development
- Uses Spring Boot DevTools for hot reloading
- H2 console available at `/h2-console` (in development)
- API documentation via Spring Boot Actuator

### Frontend Development
- Vite dev server with hot module replacement
- Material-UI theme customization
- Axios interceptors for API error handling
- Component-based architecture

## Security

- Spring Security configuration for API endpoints
- CORS enabled for frontend-backend communication
- Public access to incident data (non-sensitive crime statistics)
- Input validation and sanitization

## Responsive Design

The application is fully responsive and works on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## Future Enhancements

- **Interactive Crime Map**: Geographic visualization with markers
- **Advanced Analytics**: Trend analysis and predictive modeling
- **Export Functionality**: CSV/PDF export of filtered data
- **Real-time Notifications**: Alerts for new incidents
- **District Analysis**: Detailed breakdown by police districts

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Built with care to bring awareness to Philadelphia violence and support data-driven community safety initiatives.** 