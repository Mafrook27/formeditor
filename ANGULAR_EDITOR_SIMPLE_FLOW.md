# Angular HTML Editor - Simple Flow

## What Editor They Use

**Editor Name:** jQuery RichText Editor  
**Library:** `jquery.richtext.js`  
**CSS:** `richtext.min.css`

---

## How It Works - Simple Steps

### STEP 1: User Opens Email Template Form

```
User clicks "Add" button in Email Templates
         ↓
Angular component opens form
         ↓
HTML creates textarea:
  <div id="editor">
    <textarea class="texteditor" name="texteditor"></textarea>
  </div>
```

### STEP 2: Component Initializes Editor

**TypeScript Code (email.component.ts):**

```typescript
// Declare external JavaScript function
declare function richText(val, placeholder): any

// When form opens:
toggleFormView() {
  $("#editor").empty();
  $("#editor").html(`<textarea class="texteditor" name="texteditor"></textarea>`);
  richText('.texteditor', this.PlaceholderList)
}
```

### STEP 3: richText Function Called

**JavaScript Code (generalscript.js):**

```javascript
function richText(selector, placeholder) {
    $(selector).richText(placeholder);
}
```

**What happens:**
```
richText('.texteditor', PlaceholderList)
         ↓
Finds: <textarea class="texteditor">
         ↓
Converts to: Rich Text Editor with toolbar
```

---

## What Values Are Passed

### Parameter 1: Selector (val)

```
Value: '.texteditor'
Type: String (CSS selector)
Purpose: Tells jQuery which textarea to convert
```

### Parameter 2: Placeholder List (placeholder)

```
Value: this.PlaceholderList
Type: Array of objects
Purpose: List of placeholders for dropdown

Example:
[
  {
    PlaceholderID: 1,
    PlaceholderName: "@CustomerName",
    PlaceholderValue: "@CustomerName"
  },
  {
    PlaceholderID: 2,
    PlaceholderName: "PH@FirstName",
    PlaceholderValue: "PH@FirstName"
  },
  {
    PlaceholderID: 3,
    PlaceholderName: "PH@LoanAmount",
    PlaceholderValue: "PH@LoanAmount"
  }
]
```

---

## Complete Flow with Values

```
STEP 1: Get Placeholder List from API
   ↓
   API Call: getPlaceHolder()
   ↓
   Response: Array of placeholder objects
   ↓
   Store in: this.PlaceholderList

STEP 2: User Opens Form
   ↓
   Click "Add" button
   ↓
   toggleFormView() called

STEP 3: Create Textarea
   ↓
   $("#editor").html(`<textarea class="texteditor"></textarea>`)
   ↓
   Empty textarea created

STEP 4: Initialize Editor
   ↓
   richText('.texteditor', this.PlaceholderList)
   ↓
   Pass selector: '.texteditor'
   Pass data: PlaceholderList array

STEP 5: jQuery RichText Plugin
   ↓
   $('.texteditor').richText(PlaceholderList)
   ↓
   Converts textarea to rich editor
   ↓
   Adds toolbar with buttons
   ↓
   Adds placeholder dropdown

STEP 6: User Sees Editor
   ↓
   ┌─────────────────────────────────────┐
   │ [B] [I] [U] [≡] [≡] [≡] [@]        │ ← Toolbar
   ├─────────────────────────────────────┤
   │                                     │
   │  Type your content here...          │ ← Editor Area
   │                                     │
   └─────────────────────────────────────┘
```

---

## Editor Features (from jquery.richtext.js)

The editor supports:

```javascript
{
  // Text formatting
  bold: true,              // [B] button
  italic: true,            // [I] button
  underline: true,         // [U] button

  // Text alignment
  leftAlign: true,         // [≡] left
  centerAlign: true,       // [≡] center
  rightAlign: true,        // [≡] right
  justify: true,           // [≡] justify

  // Lists
  ol: true,                // Numbered list
  ul: true,                // Bullet list

  // Title
  heading: true,           // H1, H2, H3, etc.

  // Fonts
  fonts: true,             // Font family dropdown
  fontColor: true,         // Text color picker
  fontSize: true,          // Font size dropdown

  // Media
  imageUpload: true,       // Insert image
  fileUpload: true,        // Insert file
  videoEmbed: true,        // Embed video

  // Links
  urls: true,              // Insert hyperlink

  // Tables
  table: true,             // Insert table

  // Code
  code: true,              // View HTML code
  removeStyles: true       // Clear formatting
}
```

---

## Placeholder Dropdown in Editor

When editor loads with PlaceholderList:

```
User clicks [@] button in toolbar
         ↓
Dropdown shows:
  ┌─────────────────────┐
  │ @CustomerName       │
  │ @CustomerEmail      │
  │ @CustomerPhone      │
  │ PH@FirstName        │
  │ PH@LastName         │
  │ PH@LoanAmount       │
  │ PH@APR              │
  └─────────────────────┘
         ↓
User clicks "PH@LoanAmount"
         ↓
Text inserted: "PH@LoanAmount"
```

---

## Save Flow - What Gets Sent to API

### When User Clicks Save:

```
STEP 1: Get HTML from editor
   ↓
   content = $('.texteditor').val()
   OR
   content = editor.getHTML()

STEP 2: Create document object
   ↓
   documentEntity = {
     FileName: "Welcome Email",
     FileType: "Email",
     DocumentLanguage: "English",
     Subject: "Welcome!",
     Content: "<p>Hello PH@FirstName, your loan of PH@LoanAmount...</p>",
     IsActive: true,
     LastModifiedBy: userId,
     IPAddress: "192.168.1.1"
   }

STEP 3: Send to API
   ↓
   POST /api/insertDocument
   Body: documentEntity
   ↓
   Database stores HTML with placeholders

STEP 4: Success
   ↓
   Show message: "Template saved successfully"
   ↓
   Refresh template list
```

---

## Edit Flow - Loading Existing Template

### When User Clicks Edit:

```
STEP 1: User clicks Edit icon on template row
   ↓
   confirmedit(document) called
   ↓
   Stores: this.currentdocumentObj = document

STEP 2: Confirmation modal appears
   ↓
   Modal asks: "Are you sure you want to edit?"
   ↓
   User clicks "Yes"

STEP 3: editDocument(currentdocumentObj) called
   ↓
   Receives document object:
   {
     TemplateID: 123,
     FileName: "Welcome Email",
     FileType: "Email",
     DocumentLanguage: "English",
     Subject: "Welcome!",
     Content: "<p>Hello PH@FirstName, your loan...</p>",
     IsActive: true
   }

STEP 4: Set form to edit mode
   ↓
   this.toggleFormDoc = true
   this.toggleupdateDoc = true  ← Edit mode flag
   $("#toggleFormDoc").show()

STEP 5: Populate form fields
   ↓
   documentForm.controls['FileName'].setValue("Welcome Email")
   documentForm.controls['FileType'].setValue("Email")
   documentForm.controls['DocumentLanguage'].setValue("English")
   documentForm.controls['Subject'].setValue("Welcome!")
   documentForm.controls['IsActive'].setValue('1')

STEP 6: Prepare editor area
   ↓
   $("#editor").empty()  ← Clear any existing editor
   ↓
   $("#editor").html(`<textarea class="texteditor"></textarea>`)
   ↓
   Fresh textarea created

STEP 7: Load HTML content into textarea
   ↓
   $(".texteditor").val(document.Content)
   ↓
   Textarea now contains:
   "<p>Hello PH@FirstName, your loan of PH@LoanAmount...</p>"

STEP 8: Initialize rich text editor
   ↓
   richText('.texteditor', this.PlaceholderList)
   ↓
   Parameters:
   - Selector: '.texteditor'
   - Placeholders: Array of placeholder objects
   ↓
   Editor converts HTML and shows formatted content

STEP 9: User sees populated editor
   ↓
   ┌─────────────────────────────────────┐
   │ File Name: [Welcome Email        ] │
   │ Subject:   [Welcome!             ] │
   ├─────────────────────────────────────┤
   │ [B] [I] [U] [≡] [@]                │ ← Toolbar
   ├─────────────────────────────────────┤
   │ Hello PH@FirstName, your loan of   │
   │ PH@LoanAmount is approved!         │ ← Content loaded
   └─────────────────────────────────────┘
   
   Button shows: [Update] (not [Submit])

STEP 10: User edits content
   ↓
   Makes changes in editor
   ↓
   Clicks "Update" button

STEP 11: updateDocument() called
   ↓
   Gets HTML from editor:
   content = $('.texteditor').val()
   ↓
   Creates update object:
   {
     TemplateID: 123,  ← Important: includes ID
     FileName: "Welcome Email Updated",
     Content: "<p>Hello PH@FirstName, updated...</p>",
     LastModifiedBy: userId,
     IPAddress: "192.168.1.1"
   }

STEP 12: Send to API
   ↓
   POST /api/updateDocument
   Body: documentEntity with TemplateID
   ↓
   Database updates existing record

STEP 13: Success
   ↓
   Show message: "Template updated successfully"
   ↓
   Refresh template list
   ↓
   Close form
```

---

## Edit vs Insert - Key Differences

### INSERT (New Template):

```typescript
insertDocument() {
  let documentEntity = new DocumentModel();
  // NO TemplateID - it's a new record
  documentEntity.FileName = this.documentForm.value.FileName;
  documentEntity.Content = $('.texteditor').val();
  // ... other fields
  
  this.ConfigService.insertDocument(documentEntity).subscribe(...)
}
```

**Button shows:** [Submit]  
**API:** insertDocument  
**Database:** INSERT new record

### UPDATE (Existing Template):

```typescript
updateDocument() {
  let documentEntity = new DocumentModel();
  documentEntity.TemplateID = this.currentdocumentObj.TemplateID;  ← Has ID
  documentEntity.FileName = this.documentForm.value.FileName;
  documentEntity.Content = $('.texteditor').val();
  // ... other fields
  
  this.ConfigService.updateDocument(documentEntity).subscribe(...)
}
```

**Button shows:** [Update]  
**API:** updateDocument  
**Database:** UPDATE existing record WHERE TemplateID = 123

---

## Visual Representation

### Before richText() Call:

```html
<div id="editor">
  <textarea class="texteditor" name="texteditor"></textarea>
</div>
```

### After richText() Call:

```html
<div id="editor">
  <div class="richText">
    <div class="richText-toolbar">
      <button class="richText-btn" data-command="bold">B</button>
      <button class="richText-btn" data-command="italic">I</button>
      <button class="richText-btn" data-command="underline">U</button>
      <select class="richText-dropdown" id="placeholder-dropdown">
        <option>@CustomerName</option>
        <option>PH@FirstName</option>
        <option>PH@LoanAmount</option>
      </select>
    </div>
    <div class="richText-editor" contenteditable="true">
      <!-- User types here -->
    </div>
    <textarea class="texteditor" style="display:none;">
      <!-- Hidden - stores HTML -->
    </textarea>
  </div>
</div>
```

---

## API Calls Summary

### 1. Get Placeholder List

```
API: getPlaceHolder()
Method: GET
Response: 
{
  success: true,
  res: {
    NewDataSet: {
      GetPlaceholder: [
        { PlaceholderID: 1, PlaceholderName: "@CustomerName", ... },
        { PlaceholderID: 2, PlaceholderName: "PH@FirstName", ... }
      ]
    }
  }
}

Used for: Populating placeholder dropdown in editor
```

### 2. Get Documents/Templates

```
API: getDocuments()
Method: GET
Response:
{
  success: true,
  res: {
    NewDataSet: {
      GetDocuments: [
        {
          TemplateID: 123,
          FileName: "Welcome Email",
          FileType: "Email",
          Subject: "Welcome",
          Content: "<p>Hello PH@FirstName...</p>",
          IsActive: true
        }
      ]
    }
  }
}

Used for: Loading template list and editing
```

### 3. Insert Document

```
API: insertDocument(documentEntity)
Method: POST
Body:
{
  FileName: "Welcome Email",
  FileType: "Email",
  DocumentLanguage: "English",
  Subject: "Welcome!",
  Content: "<p>Hello PH@FirstName...</p>",
  IsActive: true,
  LastModifiedBy: 1,
  IPAddress: "192.168.1.1"
}

Response:
{
  success: true,
  res: {
    NewDataSet: {
      InsDocuments: [{ Column1: 0 }],  // 0 = success, 1 = already exists
      Table1: [{ TemplateID: 124, ... }]  // New template data
    }
  }
}

Used for: Saving new template
```

### 4. Update Document

```
API: updateDocument(documentEntity)
Method: POST
Body:
{
  TemplateID: 123,
  FileName: "Welcome Email Updated",
  FileType: "Email",
  DocumentLanguage: "English",
  Subject: "Welcome!",
  Content: "<p>Hello PH@FirstName, updated...</p>",
  IsActive: true,
  LastModifiedBy: 1,
  IPAddress: "192.168.1.1"
}

Response:
{
  success: true,
  res: {
    NewDataSet: {
      UpdDocuments: [{ TemplateID: 123, ... }]  // Updated template
    }
  }
}

Used for: Updating existing template
```

---

## Code Example - Complete Flow

### TypeScript (email.component.ts):

```typescript
export class EmailComponent {
  PlaceholderList: any = [];
  documentObj: DocumentModel = new DocumentModel();
  
  // 1. Load placeholders on init
  ngOnInit() {
    this.getPlaceHolder();
    this.getDocuments();
  }
  
  // 2. Get placeholder list from API
  getPlaceHolder() {
    this.ConfigService.getPlaceHolder().subscribe(res => {
      if (res.success) {
        this.PlaceholderList = res.res.NewDataSet.GetPlaceholder;
      }
    });
  }
  
  // 3. Open form and initialize editor
  toggleFormView() {
    this.toggleFormDoc = true;
    $("#toggleFormDoc").show();
    $("#editor").empty();
    $("#editor").html(`<textarea class="texteditor" name="texteditor"></textarea>`);
    richText('.texteditor', this.PlaceholderList);  // ← Initialize editor
  }
  
  // 4. Edit existing template
  editDocument(doc) {
    // Set edit mode flags
    this.toggleFormDoc = true;
    this.toggleupdateDoc = true;  // ← Shows "Update" button instead of "Submit"
    this.currentdocumentObj = doc;  // ← Store for update
    
    $("#toggleFormDoc").show();
    
    // Populate form fields
    this.documentForm.controls['FileName'].setValue(doc.FileName);
    this.documentForm.controls['FileType'].setValue(doc.FileType);
    this.documentForm.controls['DocumentLanguage'].setValue(doc.DocumentLanguage);
    this.documentForm.controls['Subject'].setValue(doc.Subject);
    
    // Set IsActive radio button
    if (doc.IsActive == 'true' || doc.IsActive == true) {
      this.documentForm.controls['IsActive'].setValue('1');
    } else {
      this.documentForm.controls['IsActive'].setValue('0');
    }
    
    // Prepare editor
    $("#editor").empty();
    $("#editor").html(`<textarea class="texteditor" name="texteditor"></textarea>`);
    
    // Load existing HTML content
    $(".texteditor").val(doc.Content);  // ← Set HTML content BEFORE richText()
    
    // Initialize editor with content
    richText('.texteditor', this.PlaceholderList);  // ← Editor parses and displays HTML
  }
  
  // 5. Update existing template
  updateDocument() {
    let documentEntity = new DocumentModel();
    
    // IMPORTANT: Include TemplateID for update
    documentEntity.TemplateID = this.currentdocumentObj.TemplateID;  // ← Required for UPDATE
    
    documentEntity.FileName = this.documentForm.value.FileName;
    documentEntity.FileType = this.documentForm.value.FileType;
    documentEntity.DocumentLanguage = this.documentForm.value.DocumentLanguage;
    documentEntity.Subject = this.documentForm.value.Subject;
    documentEntity.Content = $('.texteditor').val();  // ← Get updated HTML
    documentEntity.IsActive = this.documentForm.value.IsActive;
    documentEntity.LastModifiedBy = this.userID;
    documentEntity.IPAddress = this.ip;
    
    this.ConfigService.updateDocument(documentEntity).subscribe(res => {
      if (res.success) {
        Swal.fire("Success!", "Template updated successfully.", "success");
        this.resetForm();
        this.getDocuments();  // Refresh list
      }
    });
  }
  
  // 6. Confirm edit (called when user clicks edit icon)
  confirmedit(doc) {
    this.currentdocumentObj = doc;  // ← Store document for modal
    // Modal opens asking "Are you sure you want to edit?"
    // If user clicks "Yes", editDocument(currentdocumentObj) is called
  }
  
  // 5. Save template
  insertDocument() {
    let documentEntity = new DocumentModel();
    documentEntity.FileName = this.documentForm.value.FileName;
    documentEntity.Subject = this.documentForm.value.Subject;
    documentEntity.Content = $('.texteditor').val();  // ← Get HTML from editor
    documentEntity.FileType = "Email";
    documentEntity.IsActive = true;
    documentEntity.LastModifiedBy = this.userID;
    documentEntity.IPAddress = this.ip;
    
    this.ConfigService.insertDocument(documentEntity).subscribe(res => {
      if (res.success) {
        Swal.fire("Success!", "Template saved successfully.", "success");
        this.getDocuments();  // Refresh list
      }
    });
  }
}
```

### HTML (email.component.html):

```html
<!-- Table with Edit button -->
<table datatable class="table">
  <thead>
    <tr>
      <th>File Name</th>
      <th>Subject</th>
      <th>Edit</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let doc of documentList">
      <td>{{doc.FileName}}</td>
      <td>{{doc.Subject}}</td>
      <td (click)="confirmedit(doc)">
        <a title="Edit" data-toggle="modal" data-target="#editmodal">
          <i class="fa fa-pencil"></i>
        </a>
      </td>
    </tr>
  </tbody>
</table>

<!-- Edit Confirmation Modal -->
<div class="modal fade" id="editmodal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Confirm Edit</h4>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to edit this template?</p>
      </div>
      <div class="modal-footer">
        <button type="button" 
                data-dismiss="modal" 
                (click)="editDocument(currentdocumentObj)">
          Yes
        </button>
        <button type="button" data-dismiss="modal">No</button>
      </div>
    </div>
  </div>
</div>

<!-- Form -->
<div id="toggleFormDoc" style="display: none;">
  <form [formGroup]="documentForm">
    <div class="form-row">
      <div class="col-md-4">
        <label>File Name</label>
        <input type="text" formControlName="FileName" />
      </div>
      
      <div class="col-md-4">
        <label>Subject</label>
        <input type="text" formControlName="Subject" />
      </div>
    </div>
    
    <div class="form-row">
      <div class="col-md-12">
        <label>Editor</label>
        <div id="editor" class="doceditor">
          <!-- Textarea created dynamically -->
          <!-- richText() converts it to rich editor -->
        </div>
      </div>
    </div>
    
    <!-- Conditional buttons based on mode -->
    <button *ngIf="!toggleupdateDoc" (click)="insertDocument()">Submit</button>
    <button *ngIf="toggleupdateDoc" (click)="updateDocument()">Update</button>
    <button (click)="resetForm()">Cancel</button>
  </form>
</div>
```

---

## Summary

**Editor Used:** jQuery RichText Editor (jquery.richtext.js)

**Function Call:**
```javascript
richText('.texteditor', PlaceholderList)
```

**Parameters:**
1. **Selector** = '.texteditor' (which textarea to convert)
2. **PlaceholderList** = Array of placeholder objects from API

**What It Does:**
- Converts plain textarea into rich text editor
- Adds formatting toolbar (bold, italic, etc.)
- Adds placeholder dropdown with values from API
- Stores HTML in hidden textarea

**Data Flow:**
```
API → PlaceholderList → richText() → Editor → User Types → 
Get HTML → Save to API → Database
```

That's it! Simple and clear. 🎯
