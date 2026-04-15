"""
Configuration settings for Dreamgirl CRM System
"""
import os

# Base directory (source code location, or PyInstaller bundle dir)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Database — stored in user home so data persists across updates/reinstalls
# Path: C:\Users\<name>\.shopcrm\database.db
APP_DATA_DIR = os.path.join(os.path.expanduser('~'), '.shopcrm')
os.makedirs(APP_DATA_DIR, exist_ok=True)
DATABASE_PATH = os.path.join(APP_DATA_DIR, 'database.db')
SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Application settings
SECRET_KEY = 'dg-crm-8f3a1b7e9c4d2f6a0e5b8c1d7f3a9e2b4c6d8f0a'
DEBUG = False

# Login credentials
ADMIN_USERNAME = 'dreamgirl'
ADMIN_PASSWORD = '242424'

# Commission rate (1%)
COMMISSION_RATE = 0.01

# CD Bonus settings
CD_BONUS_MAX_DISCOUNT_PERCENTAGE = 3.0

# CD Bonus Slabs (Tiered based on net_amount)
# Logic: If discount <= 3%, apply these slabs
# Format: (max_amount, bonus_amount)
CD_BONUS_SLABS = [
    (5000, 50),
    (10000, 100),
    (15000, 150),
    (20000, 200),
    (25000, 250),
    (30000, 300),
    (35000, 350),
    (40000, 400),
    (45000, 450),
    (50000, 500),
    (55000, 550),
    (60000, 600),
    (65000, 650),
    (70000, 700),
    (75000, 750),
    (80000, 800),
    (85000, 850),
    (90000, 900),
    (95000, 950),
    (100000, 1000),
    (float('inf'), 1050)
]

# LT Bonus threshold
LT_BONUS_THRESHOLD = 50000
LT_BONUS_AMOUNT = 100
