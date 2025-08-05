# 🚀 Chainfly - Tender Management System

A modern, full-stack tender management system built with React, TypeScript, and FastAPI. Features include tender tracking, document management, automated reminders, and email notifications.

## ✨ Features

### 🎯 Core Features
- **Tender Management**: Search, filter, and manage tender opportunities
- **Document Upload**: Secure file upload with type categorization
- **Automated Reminders**: Email notifications for important deadlines
- **Modern UI**: Responsive design with Tailwind CSS
- **Real-time Updates**: Optimized state management with React Context

### 🔧 Technical Features
- **DSA Optimizations**: Efficient data structures (Maps for O(1) lookups)
- **Type Safety**: Full TypeScript implementation
- **API Integration**: RESTful API with FastAPI
- **Email Automation**: Gmail SMTP integration with APScheduler
- **File Management**: Secure document storage and retrieval

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **FastAPI** with Python
- **SQLAlchemy** for database ORM
- **SQLite** for data persistence
- **APScheduler** for task scheduling
- **Gmail SMTP** for email notifications

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chainfly
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in chainfly-backend/
   cp chainfly-backend/.env.example chainfly-backend/.env
   # Edit with your Gmail credentials
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

### Manual Setup

#### Backend Setup
```bash
cd chainfly-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
chainfly/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.tsx          # Main app component
│   └── package.json
├── chainfly-backend/         # FastAPI backend
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── requirements.txt
└── README.md
```

## 🔌 API Endpoints

### Tenders
- `GET /tenders/search` - Search tenders
- `GET /tenders` - Get all tenders
- `POST /tenders` - Create new tender
- `PUT /tenders/{id}` - Update tender
- `DELETE /tenders/{id}` - Delete tender

### Documents
- `POST /documents/upload` - Upload document
- `GET /documents` - Get all documents
- `GET /documents/{id}` - Get document by ID
- `DELETE /documents/{id}` - Delete document

### Reminders
- `POST /reminders/set` - Set reminder
- `GET /reminders` - Get all reminders
- `PUT /reminders/{id}` - Update reminder
- `DELETE /reminders/{id}` - Delete reminder

## 🎨 UI Components

### Modern Design System
- **Responsive Layout**: Mobile-first design
- **Dark/Light Mode**: Theme support (planned)
- **Interactive Elements**: Hover effects and animations
- **Accessibility**: WCAG compliant components

### Key Components
- **Dashboard**: Overview with statistics and quick actions
- **Tender Cards**: Visual tender information display
- **Document Manager**: File upload and organization
- **Reminder Scheduler**: Deadline management interface

## 🔒 Security Features

- **CORS Protection**: Configured for frontend-backend communication
- **File Validation**: Secure document upload with type checking
- **Email Authentication**: Gmail SMTP with app passwords
- **Input Validation**: Pydantic models for data validation

## 🚀 Performance Optimizations

### Frontend
- **Memoization**: React.memo and useMemo for expensive operations
- **Lazy Loading**: Code splitting for better initial load
- **Optimized State**: Context API with efficient data structures
- **Bundle Optimization**: Vite for fast builds

### Backend
- **Database Indexing**: Optimized queries with SQLAlchemy
- **Caching**: In-memory caching for frequently accessed data
- **Async Operations**: Non-blocking I/O operations
- **Connection Pooling**: Efficient database connections

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate app password
3. Set environment variables:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### Reminder Scheduling
- **Production**: 15, 6, and 1 day before deadline
- **Test Mode**: 1, 2, and 3 minutes for testing
- **Customizable**: Easy to modify intervals

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

### Backend Testing
```bash
cd chainfly-backend
pytest
```

### API Testing
- Use Swagger UI: http://localhost:8000/docs
- Postman collection available
- Automated tests with pytest

## 📊 Data Structures & Algorithms

### Optimized Data Structures
- **Maps for O(1) Lookups**: Fast tender/document/reminder retrieval
- **Efficient Filtering**: Optimized search algorithms
- **Memory Management**: Proper cleanup and garbage collection
- **State Optimization**: Minimal re-renders with React Context

### Algorithm Implementations
- **Search Algorithm**: Case-insensitive text search
- **Date Sorting**: Efficient date comparison and sorting
- **File Size Calculation**: Optimized byte conversion
- **Reminder Scheduling**: Priority-based scheduling

## 🔧 Development

### Available Scripts
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run build           # Build frontend for production
npm run preview         # Preview production build
```

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Python Black**: Python code formatting

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment
```bash
# Using Docker
docker build -t chainfly-backend .
docker run -p 8000:8000 chainfly-backend

# Using traditional hosting
pip install -r requirements.txt
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation at `/docs`
- Review the API documentation at `http://localhost:8000/docs`

---

**Built with ❤️ by the Chainfly Team** 