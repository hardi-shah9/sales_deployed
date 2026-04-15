# 🔒 Database Safety Guide for Shop Owner

## 📊 **Your Data is Stored Here**
- **Database File:** `dreamgirl_crm.db`
- **Location:** Same folder as the application
- **Type:** SQLite database (single file)

---

## ✅ **Daily Backup (VERY IMPORTANT!)**

### **Run This Every Day:**
1. Double-click `backup_database.bat`
2. Wait for "Backup created successfully!" message
3. Done! Your data is safe.

**Backups are saved in:** `backups\` folder with date and time

**Example backup name:** `dreamgirl_crm_20260217_143022.db`

---

## 💾 **Manual Backup (Alternative Method)**

If you want to manually backup:
1. **Close the application** (very important!)
2. Copy `dreamgirl_crm.db` file
3. Paste it somewhere safe (external drive, cloud, etc.)
4. Rename it with today's date (e.g., `dreamgirl_crm_17Feb2026.db`)

---

## 🔄 **When You Get Code Updates**

### **BEFORE Installing Updates:**
1. Run `backup_database.bat` 
2. Copy the entire `backups` folder to a safe location
3. Copy `dreamgirl_crm.db` to a safe location

### **After Installing Updates:**
1. **DO NOT delete** `dreamgirl_crm.db`
2. The new code will work with your existing database
3. If something breaks, use `restore_database.bat`

---

## 🆘 **If Something Goes Wrong**

### **To Restore from Backup:**
1. Double-click `restore_database.bat`
2. You'll see a list of available backups
3. Type the backup filename you want to restore
4. Press Enter
5. Done!

---

## 📁 **What Files to Keep Safe**

### **Critical Files (NEVER DELETE):**
- ✅ `dreamgirl_crm.db` - Your main database
- ✅ `backups\` folder - All your backup copies

### **Safe to Replace (when updating):**
- ✅ `app.py` - Backend code
- ✅ `models.py` - Database logic
- ✅ `templates\` folder - HTML pages
- ✅ `static\` folder - CSS/JS files

---

## 🎯 **Best Practices**

1. **Backup Daily** - Run `backup_database.bat` every evening
2. **Keep Multiple Backups** - Don't delete old backups for at least 1 month
3. **External Backup** - Once a week, copy the `backups` folder to USB/cloud
4. **Before Updates** - Always backup before installing new code
5. **Test Restore** - Try restoring once to make sure you know how

---

## 📞 **Emergency Contact**

If you lose data or have issues:
1. **DON'T PANIC** - Your backups are safe
2. Check the `backups\` folder
3. Use `restore_database.bat`
4. Contact developer if needed

---

## 🔍 **Viewing Your Database**

To view/export your data outside the application:
1. Download **DB Browser for SQLite** (free)
   - https://sqlitebrowser.org/dl/
2. Open `dreamgirl_crm.db` with it
3. You can view, export to Excel, or make manual changes

---

## ⚠️ **Important Warnings**

- ❌ **NEVER** delete `dreamgirl_crm.db` while the app is running
- ❌ **NEVER** edit the database while the app is running
- ❌ **NEVER** delete the `backups\` folder
- ✅ **ALWAYS** close the app before copying the database
- ✅ **ALWAYS** backup before any major changes

---

## 💡 **Quick Reference**

| Task | Action |
|------|--------|
| Daily backup | Run `backup_database.bat` |
| Restore backup | Run `restore_database.bat` |
| View data | Use DB Browser for SQLite |
| Before updates | Backup + copy `backups` folder |
| Lost data? | Check `backups\` folder |

---

**Remember:** Your data is precious! Backup daily! 🔒
