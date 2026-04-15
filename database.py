"""
Database configuration and initialization
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.pool import NullPool

db = SQLAlchemy()

def init_db(app):
    """Initialize database with Flask app"""
    # NullPool: opens fresh connection per request, closes it when done
    # timeout: waits up to 30s if DB is briefly locked (e.g. during backup)
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'connect_args': {'timeout': 30},
        'poolclass': NullPool,
    }
    db.init_app(app)
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")
