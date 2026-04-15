# 🚀 Quick Start Guide - Dreamgirl CRM

## Getting Started in 3 Steps

### Step 1: Start the Application
Double-click **`run.bat`** in the `dreamgirl sales` folder

The script will:
- ✅ Check Python installation
- ✅ Set up virtual environment (first time only)
- ✅ Install dependencies automatically
- ✅ Launch the Flask server

### Step 2: Open Your Browser
Navigate to: **http://localhost:5000**

### Step 3: Start Using!
- Click **"New Sale"** to add a sale entry
- Click **"Dashboard"** to view statistics
- Click **"Reports"** to generate reports and export to Excel

---

## 📝 Adding Your First Sale

1. Click **"New Sale"** in the header
2. Fill in the form:
   - **Date**: Today's date (pre-filled)
   - **Bill No**: e.g., BILL001 (must be unique)
   - **Salesman Name**: e.g., John Doe
   - **Sales Amount**: e.g., 10000
   - **Discount Amount**: e.g., 200
3. Watch the automatic calculations:
   - Discount %: 2.00%
   - Net Amount: ₹9,800
   - Commission: ₹98.00 (1%)
   - CD Bonus: Eligible ₹100
4. Click **"Save Sale"**

---

## 📊 Viewing Reports

1. Click **"Reports"** in the header
2. Select date range (optional)
3. Click **"Filter"** to view data
4. Click **"Export to Excel"** to download report

---

## 💡 Key Features

### Commission Calculation
- **1% commission** on net amount (sales - discount)
- Calculated automatically on every sale

### CD Bonus System
- Applied when discount is **≤ 3%**
- Progressive bonus slabs based on net amount
- Ranges from ₹50 to ₹1,500

### Excel Reports
- Professional formatting
- All transaction details
- Summary totals
- Date-based filtering

---

## 🔧 Troubleshooting

### Server won't start?
- Ensure Python 3.8+ is installed
- Check that port 5000 is not in use
- Try running `python app.py` manually

### Can't save data?
- Check write permissions in the folder
- Ensure bill number is unique
- Verify all required fields are filled

### Excel export not working?
- Ensure you have data to export
- Check write permissions
- Try selecting a specific date range

---

## 📁 Portable Deployment

### Copy to USB Drive
1. Copy entire `dreamgirl sales` folder to USB
2. Plug USB into any Windows PC with Python
3. Double-click `run.bat`
4. Application runs from USB!

### Copy to Another Computer
1. Copy entire folder to new location
2. Run `run.bat`
3. All data comes with it (in `dreamgirl_crm.db`)

---

## 🔒 Data Backup

**To backup your data:**
Simply copy `dreamgirl_crm.db` file to a safe location

**To restore:**
Replace `dreamgirl_crm.db` with your backup copy

---

## 📞 Need Help?

Refer to the comprehensive **README.md** file for:
- Detailed feature documentation
- CD bonus slab structure
- Technical specifications
- Advanced troubleshooting

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Built for**: Dreamgirl Clothing Store
