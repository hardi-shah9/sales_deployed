"""
Database models for Dreamgirl CRM System
"""
from datetime import datetime
from database import db
from config import (
    COMMISSION_RATE, 
    CD_BONUS_MAX_DISCOUNT_PERCENTAGE, 
    CD_BONUS_SLABS,
    LT_BONUS_THRESHOLD,
    LT_BONUS_AMOUNT
)


class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    
    def __repr__(self):
        return f'<User {self.username}>'


class Salesman(db.Model):
    """Salesman model"""
    __tablename__ = 'salesmen'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'active': self.active
        }
    
    def __repr__(self):
        return f'<Salesman {self.name}>'


class Sale(db.Model):
    """Sales transaction model with complete commission calculation"""
    __tablename__ = 'sales'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.Date, nullable=False, index=True)
    bill_no = db.Column(db.String(50), nullable=False, index=True)
    salesman_name = db.Column(db.String(100), nullable=False, index=True)
    sales_amt = db.Column(db.Float, nullable=False)
    discount_amt = db.Column(db.Float, nullable=False, default=0)
    gr_amt = db.Column(db.Float, nullable=False, default=0)
    outstanding_amt = db.Column(db.Float, nullable=False, default=0)
    net_amount = db.Column(db.Float, nullable=False)
    commission_1_percent = db.Column(db.Float, nullable=False)
    discount_percentage = db.Column(db.Float, nullable=False)
    cd_bonus_eligible = db.Column(db.Boolean, nullable=False)
    cd_bonus_amount = db.Column(db.Float, nullable=False, default=0)
    lt_bonus = db.Column(db.Float, nullable=False, default=0)
    total_commission = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    @staticmethod
    def calculate_commission_details(sales_amt, discount_amt, gr_amt=0, outstanding_amt=0):
        """
        Calculate all commission components
        Returns a dictionary with all calculated values
        
        Args:
            sales_amt: Sales amount
            discount_amt: Discount amount (optional, defaults to 0)
            gr_amt: Goods Return amount (optional, defaults to 0)
            outstanding_amt: Outstanding amount (optional, defaults to 0)
        """
        # Handle None or empty values
        if discount_amt is None:
            discount_amt = 0
        if gr_amt is None:
            gr_amt = 0
        if outstanding_amt is None:
            outstanding_amt = 0
            
        # Step 1: Net Amount (Sales - Discount - GR)
        net_amount = sales_amt - discount_amt - gr_amt
        
        # Step 2: 1% Commission
        # If Outstanding Amount is present, calculate on that; otherwise on Net Amount
        commission_base = outstanding_amt if outstanding_amt > 0 else net_amount
        commission_1_percent = commission_base * COMMISSION_RATE
        
        # Step 3: Discount Percentage (for CD Bonus eligibility)
        discount_percentage = (discount_amt / sales_amt * 100) if sales_amt > 0 else 0
        
        # Step 4: CD Bonus Eligibility & Amount
        # No bonus if: discount > 3%, net_amount < 5000, or partial payment (amt received entered)
        cd_bonus_eligible = discount_percentage <= CD_BONUS_MAX_DISCOUNT_PERCENTAGE and outstanding_amt == 0
        cd_bonus_amount = 0
        
        if cd_bonus_eligible and net_amount >= 5000:
            for max_amount, bonus in CD_BONUS_SLABS:
                if net_amount <= max_amount:
                    cd_bonus_amount = bonus
                    break
        
        # Step 5: LT Bonus — no bonus if partial payment (amt received entered)
        lt_bonus = LT_BONUS_AMOUNT if (net_amount > LT_BONUS_THRESHOLD and outstanding_amt == 0) else 0
        
        # Step 6: Total Commission
        total_commission = commission_1_percent + cd_bonus_amount + lt_bonus
        
        # Step 7: Outstanding Balance — only when Amt Received is entered
        outstanding_balance = round(net_amount - outstanding_amt, 2) if outstanding_amt > 0 else 0

        return {
            'net_amount': round(net_amount, 2),
            'commission_1_percent': round(commission_1_percent, 2),
            'discount_percentage': round(discount_percentage, 2),
            'cd_bonus_eligible': cd_bonus_eligible,
            'cd_bonus_amount': round(cd_bonus_amount, 2),
            'lt_bonus': round(lt_bonus, 2),
            'total_commission': round(total_commission, 2),
            'outstanding_balance': outstanding_balance
        }
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d'),
            'bill_no': self.bill_no,
            'salesman_name': self.salesman_name,
            'sales_amt': float(self.sales_amt),
            'discount_amt': float(self.discount_amt),
            'gr_amt': float(self.gr_amt),
            'outstanding_amt': float(self.outstanding_amt),
            'net_amount': float(self.net_amount),
            'outstanding_balance': round(float(self.net_amount) - float(self.outstanding_amt), 2) if float(self.outstanding_amt) > 0 else 0,
            'commission_1_percent': float(self.commission_1_percent),
            'discount_percentage': float(self.discount_percentage),
            'cd_bonus_eligible': self.cd_bonus_eligible,
            'cd_bonus_amount': float(self.cd_bonus_amount),
            'lt_bonus': float(self.lt_bonus),
            'total_commission': float(self.total_commission),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def __repr__(self):
        return f'<Sale {self.bill_no} - {self.salesman_name}>'
