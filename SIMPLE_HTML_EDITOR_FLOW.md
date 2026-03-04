# Simple HTML Editor Flow - Easy Guide

## 🎯 What This System Does

This system lets you create email templates with:
- Text, images, forms
- Special codes like @CustomerName that get replaced with real data
- Signature boxes
- Save as HTML files

---

## 📋 PART 1: ANGULAR SYSTEM (Old Way)

### Step 1: User Opens Email Templates

```
User clicks "Email Templates" tab
         ↓
System loads list from database
         ↓
Shows table of existing templates
```

### Step 2: User Creates New Template

```
User clicks "Add" button
         ↓
Form opens with:
  - File Name: [_______]
  - Subject:   [_______]
  - Editor:    [Rich Text Box]
         ↓
Rich text editor loads (like Microsoft Word)
```

### Step 3: User Types @ to Add Placeholder

```
User types: "Hello @"
         ↓
Dropdown appears:
  ┌─────────────────────┐
  │ @CustomerName       │
  │ @CustomerEmail      │
  │ @CustomerPhone      │
  │ PH@FirstName        │
  │ PH@LoanAmount       │
  └─────────────────────┘
         ↓
User clicks "@CustomerName"
         ↓
Text becomes: "Hello @CustomerName"
```

### Step 4: User Saves Template

```
User clicks "Save"
         ↓
System sends to API:
  {
    FileName: "Welcome Email",
    Subject: "Welcome!",
    Content: "<p>Hello @CustomerName</p>"
  }
         ↓
Database stores HTML
         ↓
Success message shown
```

### Step 5: System Sends Email (Later)

```
Customer triggers email
         ↓
System gets template from database
         ↓
Replaces placeholders:
  @CustomerName → "John Smith"
  @CustomerEmail → "john@email.com"
         ↓
Sends email with real data
```

---

## 📋 PART 2: REACT SYSTEM (New Way)

### Step 1: Import Existing HTML

```
User clicks "Import HTML"
         ↓
System reads HTML file
         ↓
Detects what type:
  - Simple text? → Parse as paragraphs
  - Has tables? → Parse as layout
  - Has forms? → Parse as form blocks
         ↓
Converts to blocks you can edit
```

**Example:**

```
INPUT HTML:
<h1>Welcome</h1>
<p>Hello @CustomerName</p>
<table>
  <tr>
    <td>Column 1</td>
    <td>Column 2</td>
  </tr>
</table>

         ↓ CONVERTS TO ↓

EDITOR BLOCKS:
┌─────────────────────────┐
│ [Heading] Welcome       │
├─────────────────────────┤
│ [Paragraph] Hello @...  │
├─────────────────────────┤
│ [Table] 2 columns       │
└─────────────────────────┘
```

### Step 2: User Edits in Visual Editor

```
User sees blocks on canvas:

┌──────────────────────────────┐
│  CANVAS                      │
│  ┌────────────────────────┐  │
│  │ Heading: Welcome       │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ Paragraph: Hello @...  │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ Table: [  ][  ]        │  │
│  └────────────────────────┘  │
└──────────────────────────────┘

User clicks block → Inspector panel opens →
Can change: size, color, spacing, etc.
```

### Step 3: User Types @ for Placeholder

```
User types in paragraph: "Hello @"
         ↓
Dropdown appears:
┌──────────────────────────────┐
│ Tabs: [All][@ Standard][PH@] │
├──────────────────────────────┤
│ CUSTOMER                     │
│  • Customer Name             │
│  • Customer Email            │
│                              │
│ LOAN                         │
│  • Loan Amount               │
│  • APR                       │
└──────────────────────────────┘
         ↓
User selects "Customer Name"
         ↓
Text becomes: "Hello @CustomerName "
         ↓
Placeholder shows with blue background
```

### Step 4: User Adds Signature Block

```
User drags "Signature" from library
         ↓
Signature block appears:

┌─────────────────────────────┐
│ Signature                   │
│ ┌─────────────────────────┐ │
│ │ [✎ Sign] Button         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Step 5: User Exports HTML

```
User clicks "Export HTML"
         ↓
System converts blocks to HTML:

Block 1: Heading
  → <h1>Welcome</h1>

Block 2: Paragraph with placeholder
  → <p>Hello <span class="placeholder">@CustomerName</span></p>

Block 3: Signature
  → <div class="signature-area">
      <button>Sign</button>
      <input type="hidden" name="signature" />
    </div>
         ↓
Adds JavaScript for signature modal
         ↓
Downloads complete HTML file
```

### Step 6: Customer Opens HTML File

```
Customer opens HTML in browser
         ↓
Sees form with "Sign" button
         ↓
Clicks "Sign"
         ↓
Modal appears:

┌─────────────────────────────────┐
│ E-Sign Agreement                │
│                                 │
│ ☐ I agree to use electronic     │
│   signature                     │
│                                 │
│ [Continue]                      │
└─────────────────────────────────┘
         ↓
Customer checks box and clicks Continue
         ↓
Another modal:

┌─────────────────────────────────┐
│ Adopt Your Signature            │
│                                 │
│ Your name: John Smith           │
│                                 │
│ Preview: John Smith             │
│          (in cursive font)      │
│                                 │
│ [Adopt Signature]               │
└─────────────────────────────────┘
         ↓
Customer clicks "Adopt Signature"
         ↓
Signature appears on form:

┌─────────────────────────────────┐
│ John Smith    02/22/2024        │
│ ─────────────────────────────   │
└─────────────────────────────────┘
         ↓
Hidden field stores: "John Smith"
         ↓
Form can be submitted
```

---

## 🔄 COMPLETE FLOW: Creating & Using Email Template

### SIMPLE 10-STEP PROCESS

```
STEP 1: Admin creates template
   ↓
   User opens editor
   
STEP 2: Add content
   ↓
   Types: "Dear @CustomerName, your loan of PH@LoanAmount is approved"
   
STEP 3: Add signature block
   ↓
   Drags signature from library
   
STEP 4: Save/Export
   ↓
   Saves to database OR exports HTML file
   
STEP 5: Customer triggers email
   ↓
   (e.g., applies for loan)
   
STEP 6: System gets template
   ↓
   Loads from database
   
STEP 7: Replace placeholders
   ↓
   @CustomerName → "John Smith"
   PH@LoanAmount → "$5,000"
   
STEP 8: Send email
   ↓
   Email sent: "Dear John Smith, your loan of $5,000 is approved"
   
STEP 9: Customer opens email
   ↓
   Sees personalized message
   
STEP 10: Customer signs
   ↓
   Clicks sign button → Modal → Adopts signature → Submits
```

---

## 📊 DATA FLOW (Super Simple)

### Angular Flow:

```
┌─────────┐      ┌─────────┐      ┌──────────┐
│ Browser │ ───> │   API   │ ───> │ Database │
│ (User)  │      │ Server  │      │          │
└─────────┘      └─────────┘      └──────────┘
     │                │                  │
     │ 1. Get list   │                  │
     │ ───────────>  │ 2. SELECT *      │
     │               │ ──────────────>  │
     │               │ 3. Return data   │
     │ 4. Show list  │ <────────────── │
     │ <───────────  │                  │
     │                                  │
     │ 5. Save new                      │
     │ ───────────>  │ 6. INSERT        │
     │               │ ──────────────>  │
     │               │ 7. Success       │
     │ 8. Confirm    │ <────────────── │
     │ <───────────  │                  │
```

### React Flow:

```
┌─────────┐      ┌──────────┐      ┌──────────┐
│ Browser │      │  Editor  │      │   File   │
│ (User)  │      │  State   │      │  System  │
└─────────┘      └──────────┘      └──────────┘
     │                │                  │
     │ 1. Import HTML │                  │
     │ ───────────>   │ 2. Read file     │
     │                │ ──────────────>  │
     │                │ 3. HTML content  │
     │                │ <────────────── │
     │                │ 4. Parse HTML    │
     │                │    (internal)    │
     │ 5. Show blocks │                  │
     │ <───────────   │                  │
     │                                   │
     │ 6. Edit blocks                    │
     │ ───────────>   │                  │
     │                │ 7. Update state  │
     │ 8. Re-render   │    (internal)    │
     │ <───────────   │                  │
     │                                   │
     │ 9. Export HTML │                  │
     │ ───────────>   │ 10. Generate     │
     │                │     HTML         │
     │                │ 11. Save file    │
     │                │ ──────────────>  │
     │ 12. Download   │                  │
     │ <───────────   │                  │
```

---

## 🎨 PLACEHOLDER SYSTEM (Simple Explanation)

### What are Placeholders?

Placeholders are special codes that get replaced with real data.

**Two Types:**

1. **@ Placeholders** (Standard)
   - @CustomerName
   - @CustomerEmail
   - @CurrentDate

2. **PH@ Placeholders** (FinTech/Loan specific)
   - PH@FirstName
   - PH@LoanAmount
   - PH@APR

### How They Work:

```
TEMPLATE:
"Hello @CustomerName, your loan of PH@LoanAmount is ready."

         ↓ SYSTEM REPLACES ↓

ACTUAL EMAIL:
"Hello John Smith, your loan of $5,000 is ready."
```

### How to Add Them:

```
1. Type @ in editor
2. Dropdown appears
3. Select placeholder
4. It appears with blue background
5. When email sent, replaced with real data
```

---

## 🔐 SIGNATURE SYSTEM (Simple Explanation)

### What Happens:

```
STEP 1: Admin adds signature block to template
   ↓
   Block has: Label + Sign Button + Hidden Field

STEP 2: Customer opens form
   ↓
   Sees: "Signature: [✎ Sign]"

STEP 3: Customer clicks Sign
   ↓
   Modal 1: "Agree to e-sign?" → Check box → Continue

STEP 4: Customer continues
   ↓
   Modal 2: "Your signature: John Smith" → Adopt

STEP 5: Signature added
   ↓
   Shows: "John Smith  02/22/2024"
          ─────────────────────────

STEP 6: Form submitted
   ↓
   Hidden field contains: "John Smith"
   ↓
   Backend receives signature data
```

---

## 📁 FILE HANDLING (Simple Explanation)

### Angular - Logo Upload:

```
1. User clicks "Choose File"
2. Selects image (logo.png)
3. System stores:
   - File: logo.png
   - Path: StoreLogo/logo.png
4. Sends to server with form data
5. Server saves file
6. Database stores path
```

### React - Image Block:

```
1. User drags "Image" block
2. Block appears with placeholder
3. User enters image URL
4. Image displays in editor
5. On export, HTML includes:
   <img src="https://example.com/image.png" />
```

---

## 🔍 TROUBLESHOOTING (Common Issues)

### Issue 1: Placeholders Not Showing

```
Problem: Type @ but no dropdown
         ↓
Check: Is placeholder list loaded?
         ↓
Solution: Refresh page or check API
```

### Issue 2: Signature Not Working

```
Problem: Click Sign but nothing happens
         ↓
Check: Is JavaScript loaded?
         ↓
Solution: Check browser console for errors
```

### Issue 3: HTML Import Fails

```
Problem: Import HTML but shows empty
         ↓
Check: Is HTML valid?
         ↓
Solution: Validate HTML structure
```

---

## 📝 QUICK REFERENCE

### Angular APIs:

```
GET  /api/getDocuments          → Get all templates
POST /api/insertDocument        → Save new template
POST /api/updateDocument        → Update template
GET  /api/getPlaceHolder        → Get placeholder list
```

### React Features:

```
Import HTML    → Converts HTML to blocks
Edit Blocks    → Visual editing
Add Placeholder → Type @ for dropdown
Export HTML    → Converts blocks to HTML
```

### Placeholder Format:

```
Standard:  @CustomerName
FinTech:   PH@LoanAmount
```

### Signature Fields:

```
Label:     "Signature"
Button:    [✎ Sign]
Hidden:    <input type="hidden" name="signature" />
```

---

## ✅ SUMMARY

**What This System Does:**

1. ✅ Create email templates with rich content
2. ✅ Add placeholders that get replaced with real data
3. ✅ Add signature blocks for e-signing
4. ✅ Import existing HTML files
5. ✅ Export as HTML files
6. ✅ Save to database
7. ✅ Send personalized emails

**Two Systems:**

- **Angular** = Old way, uses external editor
- **React** = New way, custom block editor

**Key Features:**

- **Placeholders** = @CustomerName, PH@LoanAmount
- **Signatures** = Click → Modal → Adopt → Done
- **Import/Export** = HTML files in/out

**Simple Flow:**

```
Create Template → Add Placeholders → Add Signature → Save → 
Send Email → Replace Placeholders → Customer Signs → Submit
```

That's it! 🎉
