"""
Dreamgirl CRM - Sales Commission System
Flask Backend Application with Authentication
"""
from flask import Flask, request, jsonify, send_file, session, redirect, url_for, render_template, send_from_directory
from flask_cors import CORS
from datetime import datetime, date, timedelta
from sqlalchemy import func, extract
from functools import wraps
import os
import sys


def get_resource_path(relative_path):
    """
    Get the absolute path to a resource, works for both dev and PyInstaller.
    PyInstaller extracts bundled files to sys._MEIPASS at runtime.
    """
    if hasattr(sys, '_MEIPASS'):
        base = sys._MEIPASS
    else:
        base = os.path.abspath(os.path.dirname(__file__))
    return os.path.join(base, relative_path)


from config import (
    SQLALCHEMY_DATABASE_URI, 
    SQLALCHEMY_TRACK_MODIFICATIONS, 
    SECRET_KEY, 
    DEBUG,
    ADMIN_USERNAME,
    ADMIN_PASSWORD
)
from database import db, init_db
from models import User, Salesman, Sale
from utils import generate_excel_report, get_salesman_summary
app = Flask(__name__, 
            template_folder=get_resource_path('templates'), 
            static_folder=get_resource_path('static'))
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
app.config['SECRET_KEY'] = SECRET_KEY
app.config['DEBUG'] = DEBUG

# Session configuration for CORS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True

# Configure CORS (API and frontend are same-origin, but keep for flexibility)
CORS(app, supports_credentials=True)
init_db(app)

# Create default admin user
with app.app_context():
    existing_user = User.query.filter_by(username=ADMIN_USERNAME).first()
    if not existing_user:
        admin_user = User(username=ADMIN_USERNAME, password=ADMIN_PASSWORD)
        db.session.add(admin_user)
        db.session.commit()
        print(f"Created admin user: {ADMIN_USERNAME}")


# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login_page'))
        return f(*args, **kwargs)
    return decorated_function


# ===== AUTHENTICATION ROUTES =====

@app.route('/login', methods=['GET', 'POST'])
def login_page():
    """Serve login page and handle login"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username, password=password).first()
        
        if user:
            session['logged_in'] = True
            session['username'] = username
            return redirect('/')  # Redirect to React dashboard
        else:
            return render_template('login.html', error='Invalid credentials')
    
    if 'logged_in' in session:
        return redirect('/')  # Redirect to React dashboard
    return render_template('login.html')



@app.route('/api/login', methods=['POST'])
def login():
    """Handle API login"""
    # Handle both JSON and form data
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=username, password=password).first()
    
    if user:
        session['logged_in'] = True
        session['username'] = username
        return jsonify({'success': True, 'message': 'Login successful'}), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    """Handle logout"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200


# ===== REACT FRONTEND SERVING (After Login) =====
# Flask login page at /login, React handles everything else after authentication

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React app build files"""
    # Skip API routes and login route
    if path.startswith('api/') or path == 'login':
        return jsonify({'error': 'Not found'}), 404

    # Check authentication — redirect to login if not logged in
    if 'logged_in' not in session and path == '':
        return redirect(url_for('login_page'))

    # Serve static files from React build
    dist_dir = get_resource_path(os.path.join('frontend', 'dist'))
    
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    else:
        # Serve index.html for all other routes (React Router)
        return send_from_directory(dist_dir, 'index.html')



# ===== API ROUTES - SALESMEN =====

@app.route('/api/salesmen', methods=['GET'])
@login_required
def get_salesmen():
    """Get all salesmen"""
    try:
        salesmen = Salesman.query.filter_by(active=True).order_by(Salesman.name).all()
        return jsonify({
            'salesmen': [s.to_dict() for s in salesmen]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/salesmen', methods=['POST'])
@login_required
def create_salesman():
    """Create a new salesman"""
    try:
        data = request.json
        
        # Check if salesman already exists
        existing = Salesman.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({'error': 'Salesman with this name already exists'}), 400
        
        salesman = Salesman(
            name=data['name'],
            active=True
        )
        
        db.session.add(salesman)
        db.session.commit()
        
        return jsonify({
            'message': 'Salesman created successfully',
            'salesman': salesman.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/salesmen/<int:salesman_id>', methods=['PUT'])
@login_required
def update_salesman(salesman_id):
    """Update salesman details"""
    try:
        salesman = Salesman.query.get(salesman_id)
        if not salesman:
            return jsonify({'error': 'Salesman not found'}), 404
        
        data = request.json
        salesman.name = data.get('name', salesman.name)
        salesman.active = data.get('active', salesman.active)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Salesman updated successfully',
            'salesman': salesman.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/salesmen/<int:salesman_id>', methods=['DELETE'])
@login_required
def deactivate_salesman(salesman_id):
    """Deactivate a salesman"""
    try:
        salesman = Salesman.query.get(salesman_id)
        if not salesman:
            return jsonify({'error': 'Salesman not found'}), 404
        
        salesman.active = False
        db.session.commit()
        
        return jsonify({'message': 'Salesman deactivated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ===== API ROUTES - SALES =====

@app.route('/api/sales/calculate', methods=['POST'])
@login_required
def calculate_commission():
    """Calculate commission details without saving"""
    try:
        data = request.json
        sales_amt = float(data['sales_amt'])
        discount_amt = float(data.get('discount_amt', 0))
        gr_amt = float(data.get('gr_amt', 0))
        outstanding_amt = float(data.get('outstanding_amt', 0))
        
        if sales_amt <= 0:
            return jsonify({'error': 'Sales amount must be greater than 0'}), 400
        if discount_amt < 0:
            return jsonify({'error': 'Discount amount cannot be negative'}), 400
        if gr_amt < 0:
            return jsonify({'error': 'GR amount cannot be negative'}), 400
        if outstanding_amt < 0:
            return jsonify({'error': 'Amount Received cannot be negative'}), 400
        
        calculations = Sale.calculate_commission_details(sales_amt, discount_amt, gr_amt, outstanding_amt)
        
        return jsonify(calculations), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/sales', methods=['POST'])
@login_required
def create_sale():
    """Create a new sale entry"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['date', 'bill_no', 'salesman_name', 'sales_amt']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Parse date
        try:
            sale_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Validate amounts
        sales_amt = float(data['sales_amt'])
        discount_amt = float(data.get('discount_amt', 0))
        gr_amt = float(data.get('gr_amt', 0))
        outstanding_amt = float(data.get('outstanding_amt', 0))
        
        if sales_amt <= 0:
            return jsonify({'error': 'Sales amount must be greater than 0'}), 400
        if discount_amt < 0:
            return jsonify({'error': 'Discount amount cannot be negative'}), 400
        if gr_amt < 0:
            return jsonify({'error': 'GR amount cannot be negative'}), 400
        if outstanding_amt < 0:
            return jsonify({'error': 'Amount Received cannot be negative'}), 400
        
        # Calculate commission details
        calculations = Sale.calculate_commission_details(sales_amt, discount_amt, gr_amt, outstanding_amt)
        
        # outstanding_balance is not a DB column (it's derived), so remove it before unpacking
        calculations.pop('outstanding_balance', None)
        
        # Create new sale
        sale = Sale(
            date=sale_date,
            bill_no=data['bill_no'].strip(),
            salesman_name=data['salesman_name'].strip(),
            sales_amt=sales_amt,
            discount_amt=discount_amt,
            gr_amt=gr_amt,
            outstanding_amt=outstanding_amt,
            **calculations
        )
        
        db.session.add(sale)
        db.session.commit()
        
        return jsonify({
            'message': 'Sale created successfully',
            'sale': sale.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/sales', methods=['GET'])
@login_required
def get_sales():
    """Get all sales with optional filtering"""
    try:
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        salesman_name = request.args.get('salesman_name')
        
        # Build query
        query = Sale.query
        
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(Sale.date >= start)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format'}), 400
        
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(Sale.date <= end)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format'}), 400
        
        if salesman_name:
            query = query.filter(Sale.salesman_name == salesman_name)
        
        # Execute query
        sales = query.order_by(Sale.date.desc(), Sale.created_at.desc()).all()
        
        return jsonify({
            'sales': [sale.to_dict() for sale in sales],
            'count': len(sales)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/sales/<int:sale_id>', methods=['GET'])
@login_required
def get_sale(sale_id):
    """Get a specific sale by ID"""
    try:
        sale = Sale.query.get(sale_id)
        if not sale:
            return jsonify({'error': 'Sale not found'}), 404
        
        return jsonify(sale.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/sales/<int:sale_id>', methods=['PUT'])
@login_required
def update_sale(sale_id):
    """Update a sale"""
    try:
        sale = Sale.query.get(sale_id)
        if not sale:
            return jsonify({'error': 'Sale not found'}), 404
        
        data = request.json
        
        # Update basic fields
        if 'date' in data:
            sale.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'bill_no' in data:
            sale.bill_no = data['bill_no']
        if 'salesman_name' in data:
            sale.salesman_name = data['salesman_name']
        
        # Recalculate if amounts changed
        if 'sales_amt' in data or 'discount_amt' in data:
            sales_amt = float(data.get('sales_amt', sale.sales_amt))
            discount_amt = float(data.get('discount_amt', sale.discount_amt))
            
            calculations = Sale.calculate_commission_details(sales_amt, discount_amt)
            
            sale.sales_amt = sales_amt
            sale.discount_amt = discount_amt
            sale.net_amount = calculations['net_amount']
            sale.commission_1_percent = calculations['commission_1_percent']
            sale.discount_percentage = calculations['discount_percentage']
            sale.cd_bonus_eligible = calculations['cd_bonus_eligible']
            sale.cd_bonus_amount = calculations['cd_bonus_amount']
            sale.lt_bonus = calculations['lt_bonus']
            sale.total_commission = calculations['total_commission']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Sale updated successfully',
            'sale': sale.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/sales/<int:sale_id>', methods=['DELETE'])
@login_required
def delete_sale(sale_id):
    """Delete a sale"""
    try:
        sale = Sale.query.get(sale_id)
        if not sale:
            return jsonify({'error': 'Sale not found'}), 404
        
        db.session.delete(sale)
        db.session.commit()
        
        return jsonify({'message': 'Sale deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/sales/next-bill-no', methods=['GET'])
@login_required
def get_next_bill_no():
    """Get suggested next bill number"""
    try:
        today = date.today()
        prefix = today.strftime('%Y%m%d')
        
        # Find last bill number for today
        last_sale = Sale.query.filter(
            Sale.bill_no.like(f'{prefix}%')
        ).order_by(Sale.bill_no.desc()).first()
        
        if last_sale:
            try:
                last_num = int(last_sale.bill_no[-3:])
                next_num = last_num + 1
            except:
                next_num = 1
        else:
            next_num = 1
        
        next_bill_no = f'{prefix}{next_num:03d}'
        
        return jsonify({'next_bill_no': next_bill_no}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===== API ROUTES - DASHBOARD & REPORTS =====

@app.route('/api/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    """Get dashboard statistics for TODAY only"""
    try:
        # Get TODAY's date
        today = date.today()
        
        # Get sales for TODAY only
        today_sales = Sale.query.filter(Sale.date == today).all()
        
        # Calculate totals for TODAY
        total_sales = sum(s.sales_amt for s in today_sales)
        total_commission = sum(s.total_commission for s in today_sales)
        sales_count = len(today_sales)
        avg_commission = total_commission / sales_count if sales_count > 0 else 0
        
        return jsonify({
            'total_sales': round(total_sales, 2),
            'total_commission': round(total_commission, 2),
            'sales_count': sales_count,
            'avg_commission': round(avg_commission, 2)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500




@app.route('/api/reports/summary', methods=['GET'])
@login_required
def get_report_summary():
    """Get salesman-wise summary report"""
    try:
        start_date = request.args.get('start_date') or request.args.get('from_date')
        end_date = request.args.get('end_date') or request.args.get('to_date')
        
        query = Sale.query
        
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Sale.date >= start)
        
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Sale.date <= end)
        
        sales = query.all()
        sales_data = [sale.to_dict() for sale in sales]
        
        summary = get_salesman_summary(sales_data)
        
        # Calculate totals
        total_sales = sum(s.get('total_sales', 0) for s in summary)
        total_commission = sum(s.get('total_commission', 0) for s in summary)
        total_transactions = len(sales)
        
        return jsonify({
            'by_salesman': summary,  # React expects this field name
            'total_sales': total_sales,
            'total_commission': total_commission,
            'total_transactions': total_transactions
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/export/excel', methods=['POST'])
@login_required
def export_to_excel():
    """Export sales data to Excel"""
    try:
        data = request.json
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        query = Sale.query
        
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Sale.date >= start)
        
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Sale.date <= end)
        
        sales = query.order_by(Sale.date.desc()).all()
        sales_data = [sale.to_dict() for sale in sales]
        
        if not sales_data:
            return jsonify({'error': 'No data to export'}), 400
        
        # Generate filename
        if start_date and end_date:
            filename = f'sales_report_{start_date}_to_{end_date}.xlsx'
        elif start_date:
            filename = f'sales_report_from_{start_date}.xlsx'
        elif end_date:
            filename = f'sales_report_until_{end_date}.xlsx'
        else:
            filename = f'sales_report_{datetime.now().strftime("%Y%m%d")}.xlsx'
        
        filepath = generate_excel_report(sales_data, filename)
        
        return send_file(
            filepath,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500




import time
import threading
import sys

# ===== HEARTBEAT SHUTDOWN LOGIC =====
# This ensures the Flask server dies cleanly if the Edge window is closed.
LAST_HEARTBEAT = time.time()
HEARTBEAT_TIMEOUT = 10  # seconds

@app.route('/api/heartbeat', methods=['POST'])
def handle_heartbeat():
    global LAST_HEARTBEAT
    LAST_HEARTBEAT = time.time()
    return jsonify({'status': 'ok'})

def heartbeat_monitor():
    global LAST_HEARTBEAT
    # Give the UI some time to initially load (20 seconds) before we enforce heartbeats
    time.sleep(20)
    while True:
        if time.time() - LAST_HEARTBEAT > HEARTBEAT_TIMEOUT:
            print("Heartbeat lost. Shutting down server...")
            os._exit(0)
        time.sleep(2)

# Start monitor thread
monitor_thread = threading.Thread(target=heartbeat_monitor, daemon=True)
monitor_thread.start()

# ============================================================================
# RUN APPLICATION
# ============================================================================

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=DEBUG)
