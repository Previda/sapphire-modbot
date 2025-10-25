# 🎮 Roblox Verification System - Complete Guide

## ✨ What It Does

Link Discord accounts to Roblox accounts with full verification!

---

## 🚀 Quick Setup

### **Step 1: Setup System**
```
/roblox setup
```

This creates:
- ✅ "Roblox Verified" role
- ✅ Verification database
- ✅ Configuration

### **Step 2: Send Panel**
```
/roblox panel
```

Or specify a channel:
```
/roblox panel channel:#verify-roblox
```

### **Step 3: Done!**
Users can now verify their Roblox accounts!

---

## 🎯 How Users Verify

1. **Click "Verify Roblox Account" button**
2. **Enter Roblox username** in the modal
3. **Add verification code** to Roblox profile description
4. **Click "Confirm Verification"**
5. **Get verified!** ✅

---

## ⚙️ Configuration

### **Basic Config:**
```
/roblox config
  verified_role: @Roblox Verified
  min_account_age: 30
```

### **Advanced Config:**
```
/roblox config
  verified_role: @Roblox Verified
  min_account_age: 90
  require_group: true
  group_id: 12345678
```

---

## 📊 Management Commands

### **Check User:**
```
/roblox check user:@User
```

Shows:
- Roblox username
- Roblox ID
- Verification date
- Profile picture

### **Unlink Account:**
```
/roblox unlink user:@User
```

Removes:
- Verification from database
- Roblox Verified role

### **View Stats:**
```
/roblox stats
```

Shows:
- Total verified users
- Verification rate
- Server statistics

---

## 🔒 Security Features

### **Account Age Check:**
- Minimum Roblox account age (default: 30 days)
- Prevents new/alt accounts
- Configurable per server

### **Profile Verification:**
- Users must add code to Roblox profile
- Proves account ownership
- Code expires in 10 minutes

### **Group Requirement (Optional):**
- Require users to be in specific Roblox group
- Perfect for group-based servers
- Configurable group ID

---

## 🎨 User Experience

### **Step 1: Click Button**
User sees:
```
🎮 Roblox Verification

Link your Roblox account to Discord!

Click the button below to verify your Roblox account.

Benefits:
• Get the Roblox Verified role
• Access exclusive channels
• Show your Roblox username

[Verify Roblox Account]
```

### **Step 2: Enter Username**
Modal appears:
```
🎮 Roblox Verification

Enter your Roblox username:
[YourRobloxUsername]
```

### **Step 3: Add Code**
Instructions shown:
```
🎮 Roblox Verification - Step 2

Roblox Account Found!

Username: YourUsername
User ID: 123456789

To complete verification:

1. Go to your Roblox profile
2. Click "Edit Profile"
3. Add this code to your About/Description:

ABC123XY

4. Save your profile
5. Click "Confirm Verification"

⏱️ This code expires in 10 minutes

[Confirm Verification]
```

### **Step 4: Success!**
```
✅ Roblox Verification Successful!

Congratulations! Your Roblox account has been verified!

Roblox Username: YourUsername
Roblox ID: 123456789

You now have access to Roblox-verified features! 🎉

You can now remove the code from your Roblox profile
```

---

## 📝 Example Workflows

### **Basic Server:**
```bash
# 1. Setup
/roblox setup

# 2. Send panel
/roblox panel channel:#verify

# 3. Done!
```

### **Group-Based Server:**
```bash
# 1. Setup
/roblox setup

# 2. Configure for group
/roblox config require_group:true group_id:12345678

# 3. Send panel
/roblox panel

# 4. Users must be in group to verify
```

### **Strict Security:**
```bash
# 1. Setup
/roblox setup

# 2. Strict settings
/roblox config min_account_age:90

# 3. Send panel
/roblox panel

# 4. Only 90+ day old accounts can verify
```

---

## 🔍 Admin Tools

### **Check Verification:**
```
/roblox check user:@User
```

Returns:
- ✅ Verified status
- 🎮 Roblox username
- 🆔 Roblox ID
- 📅 Verification date
- 🖼️ Profile picture

### **Unlink Account:**
```
/roblox unlink user:@User
```

Use when:
- User changed Roblox account
- Verification was incorrect
- User requests unlink

### **View Statistics:**
```
/roblox stats
```

Shows:
- 👥 Total verified
- 📈 Server members
- 📊 Verification rate

---

## ⚠️ Error Handling

### **User Not Found:**
```
❌ User Not Found

Roblox user "Username" not found.

Please check the spelling and try again.
```

### **Code Not Found:**
```
❌ Verification Code Not Found

I couldn't find the verification code in your Roblox profile description.

Make sure you:
1. Added the code: ABC123XY
2. Saved your profile
3. Waited a few seconds for Roblox to update

Then try clicking "Confirm Verification" again.
```

### **Verification Expired:**
```
⏱️ Verification Expired

Your verification code has expired.

Please start the verification process again.
```

---

## 🎯 Use Cases

### **Roblox Game Servers:**
- Verify players are real Roblox users
- Link Discord to Roblox for rewards
- Require group membership

### **Trading Servers:**
- Verify account age for trust
- Link Roblox profiles
- Prevent alt accounts

### **Community Servers:**
- Show Roblox usernames
- Verify group membership
- Create Roblox-verified channels

---

## 📊 Data Stored

### **Per User:**
```json
{
  "robloxId": 123456789,
  "robloxUsername": "YourUsername",
  "verifiedAt": "2025-10-25T19:00:00.000Z"
}
```

### **Configuration:**
```json
{
  "enabled": true,
  "verifiedRole": "role_id",
  "minAccountAge": 30,
  "requireGroup": false,
  "groupId": null
}
```

---

## 🔧 Troubleshooting

### **"Verification system not set up"**
- Run `/roblox setup` first

### **"No pending verification found"**
- Start verification process again
- Code may have expired

### **"Error looking up Roblox account"**
- Roblox API may be down
- Try again in a few minutes

### **Role not assigned**
- Check bot has "Manage Roles" permission
- Ensure bot role is above verified role

---

## ✅ Summary

**Commands:**
- `/roblox setup` - Create system
- `/roblox panel` - Send panel
- `/roblox config` - Configure settings
- `/roblox check` - Check user
- `/roblox unlink` - Unlink account
- `/roblox stats` - View statistics

**Features:**
- ✅ Profile verification
- ✅ Account age checking
- ✅ Group requirements
- ✅ Auto role assignment
- ✅ 10-minute expiry
- ✅ Full admin control

**Status:** 🎮 **Ready to use!**
