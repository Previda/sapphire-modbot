# 🎫 Complete Ticket System Guide

## Overview
Your bot now has a **professional ticket system** with buttons, menus, and advanced management features!

---

## 🚀 Quick Start

### 1. Setup Ticket System
```
/ticket setup
```
This creates:
- 📋 Ticket category
- 🎫 Create ticket channel
- 📜 Transcript log channel
- 3 default categories (Support, Report, Question)

### 2. Users Create Tickets
1. Click "Create Ticket" button
2. Select category from dropdown
3. Ticket channel created automatically!

---

## 🎮 Ticket Buttons

Every ticket has these buttons:

### 🔒 Close Button
- Closes and deletes the ticket
- 5-second countdown
- Shows who closed it

### ✋ Claim Button
- Staff member claims the ticket
- Shows who's handling it
- Prevents duplicate work

### 💾 Save Transcript Button
- Saves all messages to file
- Stores in `data/transcripts/`
- Posts to log channel
- Shows message count

---

## 📋 Management Menu

Use `/ticket-manage menu` to show the full management panel with:

### Available Actions:
- **🔒 Close** - Close the ticket
- **✋ Claim** - Claim the ticket
- **💾 Save** - Save transcript
- **⏸️ Pause** - Lock the channel
- **▶️ Resume** - Unlock the channel
- **🏷️ Priority** - Set priority level

---

## 🛠️ Management Commands

### `/ticket-manage menu`
Shows interactive management panel with all buttons

### `/ticket-manage close [reason]`
Close ticket with optional reason
```
/ticket-manage close reason:Issue resolved
```

### `/ticket-manage claim`
Claim the ticket as yours

### `/ticket-manage unclaim`
Unclaim the ticket

### `/ticket-manage pause`
Lock the ticket (users can't send messages)

### `/ticket-manage resume`
Unlock the ticket

### `/ticket-manage save`
Save transcript to file

### `/ticket-manage rename <name>`
Rename the ticket channel
```
/ticket-manage rename name:urgent-bug-report
```

### `/ticket-manage priority <level>`
Set priority: High 🔴, Medium 🟡, or Low 🟢
```
/ticket-manage priority level:high
```

---

## 🎯 Priority System

### 🔴 High Priority
- Urgent issues
- Immediate attention needed
- Red color indicator

### 🟡 Medium Priority
- Standard issues
- Normal response time
- Yellow color indicator

### 🟢 Low Priority
- Non-urgent issues
- Can wait
- Green color indicator

---

## 📊 Ticket Features

### Automatic Features:
✅ **Auto-numbering** - Each ticket gets unique number  
✅ **Category display** - Shows category and description  
✅ **User permissions** - Only ticket creator and staff can see  
✅ **Role pinging** - Pings configured support role  
✅ **Transcript logging** - Auto-saves to log channel  
✅ **Button interactions** - All buttons work instantly  

### Staff Features:
✅ **Claim system** - Prevent duplicate work  
✅ **Pause/Resume** - Control user access  
✅ **Priority levels** - Organize by urgency  
✅ **Transcript saving** - Keep records  
✅ **Channel renaming** - Better organization  

---

## 🎨 Ticket Flow

```
User clicks "Create Ticket"
    ↓
Selects category
    ↓
Ticket channel created
    ↓
Welcome message with buttons
    ↓
Staff claims ticket
    ↓
Issue discussed
    ↓
Staff saves transcript
    ↓
Staff closes ticket
    ↓
Channel deleted
    ↓
Transcript saved in logs
```

---

## 🔧 Configuration

### Add Custom Category
```
/ticket category name:Billing emoji:💰 description:Billing and payment issues
```

### Set Ping Role
```
/ticket category name:Support ping_role:@Support Team
```

### Remove Category
```
/ticket remove-category name:Question
```

### List Categories
```
/ticket list
```

### View Stats
```
/ticket stats
```

---

## 💡 Use Cases

### Support Server
```
Categories: Technical Support, Account Issues, Billing
Priority: High for billing, Medium for technical
```

### Gaming Server
```
Categories: Report Player, Bug Report, Appeal Ban
Priority: High for exploits, Low for minor bugs
```

### Community Server
```
Categories: General Help, Suggestions, Partnership
Priority: Medium for most, High for urgent issues
```

---

## 📝 Transcript System

### Automatic Saving:
- Saves last 100 messages
- Includes timestamps
- Shows author tags
- Stores in `data/transcripts/`

### File Format:
```
[2025-10-29 12:47:00] User#1234: I need help with...
[2025-10-29 12:48:15] Staff#5678: Sure! Let me assist...
```

### Log Channel:
- Posts transcript notification
- Shows ticket name
- Shows who saved it
- Shows message count

---

## 🎯 Best Practices

### For Staff:
1. **Claim tickets** when you start helping
2. **Set priority** based on urgency
3. **Save transcripts** before closing
4. **Use pause** for breaks
5. **Close with reason** for records

### For Setup:
1. **Create categories** for your needs
2. **Set ping roles** for notifications
3. **Configure log channel** for records
4. **Test system** before announcing
5. **Train staff** on commands

---

## 🔍 Troubleshooting

### Button not working?
- Check bot has `Manage Channels` permission
- Verify bot can see the channel
- Try `/ticket-manage menu` instead

### Can't close ticket?
- Check you have staff permissions
- Use `/ticket-manage close` command
- Check bot has delete channel permission

### Transcript not saving?
- Check `data/transcripts/` folder exists
- Verify bot has write permissions
- Check log channel is configured

### Priority not changing?
- Make sure you're in a ticket channel
- Use the dropdown menu
- Check bot has permission to send messages

---

## 📊 Statistics

Track your ticket system:
```
/ticket stats
```

Shows:
- 🎫 Active tickets
- 📋 Total categories
- 📈 Total tickets created

---

## ✨ Features Summary

### ✅ What You Get:

**Buttons:**
- 🔒 Close
- ✋ Claim
- 💾 Save Transcript

**Management Menu:**
- ⏸️ Pause
- ▶️ Resume
- 🏷️ Priority

**Commands:**
- `/ticket` - Full ticket system
- `/ticket-manage` - Management menu
- All subcommands

**Automatic:**
- Category selection
- Permission setup
- Transcript logging
- Number assignment

---

## 🎉 Example Usage

### Creating a Ticket:
1. User clicks "Create Ticket"
2. Selects "Support" category
3. Ticket #1 created
4. Welcome message shows with buttons

### Managing a Ticket:
1. Staff uses `/ticket-manage menu`
2. Clicks "Claim" button
3. Sets priority to "High"
4. Helps user
5. Clicks "Save Transcript"
6. Clicks "Close"
7. Ticket deleted, transcript saved

---

## 🚀 Update Instructions

### On Raspberry Pi:
```bash
cd ~/sapphire-modbot
bash update-pi.sh
```

Or manually:
```bash
git pull origin main
pm2 restart skyfall-bot
pm2 logs skyfall-bot
```

---

## ✅ Summary

Your ticket system now has:

✅ **Interactive buttons** on every ticket  
✅ **Management menu** with `/ticket-manage`  
✅ **Priority system** (High/Medium/Low)  
✅ **Pause/Resume** functionality  
✅ **Transcript saving** with logging  
✅ **Claim system** for staff  
✅ **Professional UI** with embeds  

**Everything works with buttons and menus - no typing required!** 🎊

---

**Last Updated:** 2025-10-29  
**Commit:** `4f5e797`  
**Status:** ✅ FULLY FUNCTIONAL
