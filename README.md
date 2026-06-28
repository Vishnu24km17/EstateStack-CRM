# EstateStack-CRM
Real Estate-Leads &amp; Infrastructure Management

Live hosted url's :

Frontend	https://estatestack-crm.vercel.app

Backend API	https://estatestack-crm.onrender.com/api

Admin Panel	https://estatestack-crm.onrender.com/admin

GitHub	https://github.com/Vishnu24km17/EstateStack-CRM


Backend setpu :

cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Update .env with your database credentials
# DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver



Frontend Setup:

cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Run development server
npm start


