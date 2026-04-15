# DreamGirl CRM - Installation & User Guide

## 🎯 Quick Start

### For First-Time Setup:
1. **Extract** the DreamGirl CRM folder
2. **Double-click** `install.bat`
3. Wait for installation to complete
4. **Double-click** `run.bat`
5. Open your browser to: **http://localhost:5001**

### Login Credentials:
- **Username:** `dreamgirl`
- **Password:** `242424`

---

## 📋 System Requirements

- **Windows** 7/8/10/11
- **Python** 3.8 or higher ([Download here](https://www.python.org/downloads/))
- **Web Browser** (Chrome, Firefox, Edge)

---

## 🚀 Features

### 1. **Dashboard**
- Real-time sales statistics
- Commission overview
- Sales trends chart
- Recent sales table

### 2. **Sales Entry**
- Add new sales with real-time commission calculation
- Fields: Date, Bill No, Salesman, Amount, Discount, GR, Amount Received
- Automatic commission breakdown display

### 3. **View Sales**
- Browse all sales records
- Filter by date range, salesman
- Search functionality
- Delete sales (with confirmation)

### 4. **Reports**
- Salesman-wise commission reports
- Date range filtering
- Export to Excel
- Detailed breakdowns

### 5. **Salesmen Management**
- Add new salesmen
- View all salesmen
- Delete salesmen (with validation)

---

## 💡 Usage Guide

### Adding a New Sale:
1. Click **"New Sale"** in sidebar
2. Select **Salesman** from dropdown
3. Enter **Sales Amount**
4. (Optional) Enter Discount, GR Amount, Amount Received
5. Watch **real-time commission calculation** on the right
6. Click **"Submit Sale"**

### Viewing Reports:
1. Click **"Reports"** in sidebar
2. Select **date range** (optional)
3. Filter by **salesman** (optional)
4. Click **"Export to Excel"** to download

### Managing Salesmen:
1. Click **"Salesmen"** in sidebar
2. Enter new salesman name
3. Click **"Add Salesman"**
4. View all salesmen in the table

---

## 🔧 Troubleshooting

### Server won't start:
- Make sure Python is installed
- Run `install.bat` first
- Check if port 5001 is available

### Page not loading:
- Wait 5-10 seconds after running `run.bat`
- Refresh your browser
- Try http://127.0.0.1:5001 instead

### Commission not calculating:
- Make sure Sales Amount is entered
- Check that all amounts are positive numbers
- Refresh the page and try again

---

## 📦 Distribution

### To share with others:
1. Zip the entire `DreamGirl CRM` folder
2. Share the zip file
3. Recipient extracts and runs `install.bat`
4. That's it!

---

## 🛡️ Data & Security

- All data is stored locally in `sales.db`
- No internet connection required
- Backup `sales.db` regularly to prevent data loss

---

## 📞 Support

For issues or questions, contact your system administrator.

---

**DreamGirl CRM v1.0**  
*Scalable Sales Commission Management System*
