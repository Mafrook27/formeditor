# Complete Angular HTML Editor Summary

## 📚 What We Covered

### 1. Editor Used
- **Library:** jQuery RichText Editor (`jquery.richtext.js`)
- **CSS:** `richtext.min.css`
- **Location:** `frontend/frontend/src/assets/js/`

### 2. How It's Called

```typescript
// Declare external function
declare function richText(val, placeholder): any

// Initialize editor
richText('.texteditor', this.PlaceholderList)
```

### 3. Parameters Passed

**Parameter 1: Selector**
```javascript
'.texteditor'  // CSS selector for textarea
```

**Parameter 2: Placeholder List**
```javascript
[
  { PlaceholderID: 1, PlaceholderName: "@CustomerName" },
  { PlaceholderID: 2, PlaceholderName: "PH@LoanAmount" },
  // ... more placeholders
]
```

---

## 🔄 Complete Flows

### INSERT Flow (New Template)

```
1. User clicks "Add"
2. Form opens
3. Create textarea
4. Call richText('.texteditor', PlaceholderList)
5. User types content with placeholders
6. Click "Submit"
7. Get HTML: $('.texteditor').val()
8. Send to API: insertDocument(entity)
9. Database stores (NO TemplateID)
10. Success message
```

### EDIT Flow (Existing Template)

```
1. User clicks Edit icon
2. confirmedit(doc) stores document
3. Modal asks confirmation
4. editDocument(doc) called
5. Populate form fields
6. Create textarea
7. Load content: $(".texteditor").val(doc.Content)
8. Call richText('.texteditor', PlaceholderList)
9. User edits content
10. Click "Update"
11. Get HTML: $('.texteditor').val()
12. Send to API: updateDocument(entity WITH TemplateID)
13. Database updates existing record
14. Success message
```

---

## 🔑 Key Differences: Insert vs Edit

| Feature | INSERT | EDIT |
|---------|--------|------|
| **TemplateID** | NO (new record) | YES (required) |
| **Button** | [Submit] | [Update] |
| **API** | insertDocument | updateDocument |
| **Database** | INSERT | UPDATE WHERE TemplateID = X |
| **Flag** | toggleupdateDoc = false | toggleupdateDoc = true |
| **Content Load** | Empty textarea | $(".texteditor").val(content) |

---

## 📝 API Calls

### 1. Get Placeholders
```
GET /api/getPlaceHolder
Response: Array of placeholder objects
Used for: Dropdown in editor
```

### 2. Get Documents
```
GET /api/getDocuments
Response: Array of template objects
Used for: Template list
```

### 3. Insert Document
```
POST /api/insertDocument
Body: { FileName, Content, ... } (NO TemplateID)
Response: Success + new template data
```

### 4. Update Document
```
POST /api/updateDocument
Body: { TemplateID, FileName, Content, ... } (WITH TemplateID)
Response: Success + updated template data
```

---

## ✍️ Signature System

### Important: NOT in Angular!

The fancy e-sign modal system is from **React editor export**, not Angular.

**Angular signature options:**
1. Simple text input: `<input type="text" name="signature" />`
2. Canvas drawing (if custom implemented)
3. Third-party service (DocuSign, etc.)

**Most common:** Simple text input where customer types their name.

---

## 📂 File Locations

```
frontend/frontend/src/
├── assets/
│   ├── js/
│   │   ├── jquery.richtext.js      ← Editor library
│   │   └── generalscript.js        ← richText() wrapper
│   └── css/
│       └── richtext.min.css        ← Editor styles
└── component/
    └── config/
        ├── Email/
        │   ├── email.component.ts   ← Main logic
        │   └── email.component.html ← Template
        └── documents/
            ├── documents.component.ts
            └── documents.component.html
```

---

## 💡 Quick Reference

### Initialize Editor (New)
```typescript
$("#editor").html(`<textarea class="texteditor"></textarea>`);
richText('.texteditor', this.PlaceholderList);
```

### Initialize Editor (Edit)
```typescript
$("#editor").html(`<textarea class="texteditor"></textarea>`);
$(".texteditor").val(existingContent);  // Load first
richText('.texteditor', this.PlaceholderList);  // Then initialize
```

### Get Content
```typescript
const htmlContent = $('.texteditor').val();
```

### Save New
```typescript
documentEntity.Content = $('.texteditor').val();
// NO TemplateID
this.ConfigService.insertDocument(documentEntity).subscribe(...)
```

### Update Existing
```typescript
documentEntity.TemplateID = this.currentdocumentObj.TemplateID;  // Required!
documentEntity.Content = $('.texteditor').val();
this.ConfigService.updateDocument(documentEntity).subscribe(...)
```

---

## 🎯 Summary

**What Angular Does:**
- Creates email templates using jQuery RichText Editor
- Passes selector and placeholder list to editor
- Saves HTML content to database
- Loads and edits existing templates

**What Gets Passed:**
- Selector: `.texteditor` (which element to convert)
- Placeholders: Array from API (for dropdown)

**Key Points:**
- Insert = No TemplateID, shows Submit button
- Edit = Has TemplateID, shows Update button
- Content loaded BEFORE richText() call for edit
- Signature modal is NOT in Angular (it's React feature)

**Simple Flow:**
```
Get Placeholders → Open Form → Initialize Editor → 
User Types → Save/Update → Database → Done
```

That's everything! 🎉
