// Mock HTML templates for testing without backend
// These simulate Angular-generated HTML that the editor must handle

export const mockAgreementHTML = `
<html>
<body>
  <h1>Financial Services Agreement</h1>
  <p style="text-align: center; color: #64748b;">This Agreement is entered into as of the date signed below, between the parties identified herein. Please review all terms carefully before signing.</p>
  <hr style="border-top: 2px solid #e2e8f0; margin: 24px 0;" />
  
  <h3>Client Information</h3>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <div>
      <label for="full_name">Full Legal Name <span style="color: #ef4444;">*</span></label>
      <input type="text" id="full_name" name="full_name" placeholder="Enter your full name" required />
    </div>
    <div>
      <label for="phone">Phone Number <span style="color: #ef4444;">*</span></label>
      <input type="tel" id="phone" name="phone" placeholder="(555) 000-0000" required />
    </div>
    <div>
      <label for="email">Email Address <span style="color: #ef4444;">*</span></label>
      <input type="email" id="email" name="email" placeholder="name@example.com" required />
    </div>
    <div>
      <label for="dob">Date of Birth <span style="color: #ef4444;">*</span></label>
      <input type="date" id="dob" name="dob" required />
    </div>
  </div>
  
  <h3>Service Selection</h3>
  <p>Please select the services you are interested in:</p>
  <select id="service_type" name="service_type" required>
    <option value="">Select a service...</option>
    <option value="investment">Investment Management</option>
    <option value="retirement">Retirement Planning</option>
    <option value="tax">Tax Advisory</option>
    <option value="estate">Estate Planning</option>
  </select>
  
  <h3>Terms &amp; Conditions</h3>
  <p>By executing this Agreement, you acknowledge that you have read, understood, and agree to be bound by the terms and conditions set forth herein. This Agreement constitutes the entire understanding between the parties.</p>
  <p>Dear <strong>@CustomerName</strong>, thank you for choosing our services. Your account number is <strong>@AccountNumber</strong>.</p>
  
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <thead>
      <tr style="background-color: #f1f5f9;">
        <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Service</th>
        <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Fee</th>
        <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Frequency</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px; border: 1px solid #e2e8f0;">Portfolio Management</td>
        <td style="padding: 12px; border: 1px solid #e2e8f0;">1.5% AUM</td>
        <td style="padding: 12px; border: 1px solid #e2e8f0;">Annual</td>
      </tr>
      <tr>
        <td style="padding: 12px; border: 1px solid #e2e8f0;">Financial Planning</td>
        <td style="padding: 12px; border: 1px solid #e2e8f0;">$500</td>
        <td style="padding: 12px; border: 1px solid #e2e8f0;">One-time</td>
      </tr>
    </tbody>
  </table>
  
  <div>
    <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer;">
      <input type="checkbox" name="terms_agree" required />
      <span>I have read and agree to the Terms &amp; Conditions, Privacy Policy, and Disclosure Agreement.</span>
    </label>
  </div>
  
  <div>
    <label>Applicant Signature <span style="color: #ef4444;">*</span></label>
    <img class="signature" src="signature-placeholder.png" alt="Signature" style="border: 1px dashed #e2e8f0; padding: 20px; width: 300px; height: 100px;" />
  </div>
  
  <div style="display: flex; gap: 12px; margin-top: 24px;">
    <button type="button" class="btn-save">Save Draft</button>
    <button type="submit" class="btn-submit">Submit Agreement</button>
    <button type="button" class="btn-cancel">Cancel</button>
  </div>
</body>
</html>
`;

export const mockSimpleFormHTML = `
<html>
<body>
  <h2>Contact Information Form</h2>
  <p>Please fill out the following information to get started.</p>
  
  <div>
    <label for="name">Your Name <span style="color: red;">*</span></label>
    <input type="text" id="name" name="name" placeholder="John Doe" required />
  </div>
  
  <div>
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="4" placeholder="Enter your message..."></textarea>
  </div>
  
  <p>Contact us at <a href="mailto:support@example.com">support@example.com</a> or visit our <a href="https://example.com">website</a>.</p>
  
  <button type="submit">Send Message</button>
</body>
</html>
`;

export const mockRichTextHTML = `
<html>
<body>
  <h1 style="color: #1e40af; text-align: center;">Welcome to Our Platform</h1>
  <p style="font-size: 18px; line-height: 1.8;">
    We are <strong>excited</strong> to have you here! This is a <em>demonstration</em> of our 
    <u>rich text</u> capabilities. You can create content with 
    <span style="color: #dc2626;">colored text</span> and 
    <span style="font-size: 14px;">different sizes</span>.
  </p>
  <p style="background-color: #fef3c7; padding: 12px; border-radius: 6px;">
    <strong>Note:</strong> This highlighted section contains important information.
  </p>
  
  <h2>Features Include:</h2>
  <ul>
    <li>Rich text editing</li>
    <li>HTML import/export</li>
    <li>@Placeholder support</li>
    <li>Table editing</li>
  </ul>
  
  <ol>
    <li>First step in the process</li>
    <li>Second step with more details</li>
    <li>Final step to complete</li>
  </ol>
  
  <img src="https://via.placeholder.com/400x200" alt="Sample Image" style="border-radius: 8px; margin: 16px 0;" />
</body>
</html>
`;

// Available placeholders for the @ mention system
export const availablePlaceholders = [
  { value: "@CustomerName", label: "Customer Name", category: "Customer" },
  { value: "@CustomerEmail", label: "Customer Email", category: "Customer" },
  { value: "@CustomerPhone", label: "Customer Phone", category: "Customer" },
  { value: "@AccountNumber", label: "Account Number", category: "Account" },
  { value: "@AccountType", label: "Account Type", category: "Account" },
  { value: "@CurrentDate", label: "Current Date", category: "System" },
  { value: "@ExpiryDate", label: "Expiry Date", category: "System" },
  { value: "@CompanyName", label: "Company Name", category: "Company" },
  { value: "@CompanyAddress", label: "Company Address", category: "Company" },
  { value: "@AgentName", label: "Agent Name", category: "Agent" },
  { value: "@AgentEmail", label: "Agent Email", category: "Agent" },
  // PH@ style placeholders (FinTech format)
  { value: "PH@FirstName", label: "First Name", category: "Customer" },
  { value: "PH@LastName", label: "Last Name", category: "Customer" },
  { value: "PH@LoanAmount", label: "Loan Amount", category: "Loan" },
  { value: "PH@APR", label: "APR %", category: "Loan" },
  { value: "PH@InterestRate", label: "Interest Rate", category: "Loan" },
  { value: "PH@DateNow", label: "Date Now", category: "System" },
  { value: "PH@PortfolioName", label: "Portfolio Name", category: "Company" },
];

// External FinTech Loan Agreement HTML (simulates real external HTML)
export const mockLoanAgreementHTML = `
<html>
<head>
<style>
html, body {
  font-family: "Open Sans", Arial, Helvetica, "Nimbus Sans L", sans-serif;
  font-size: 13px;
  line-height: 1.4;
  color: #000;
}
h1, h2, h3, h4, h5, h6 {
  font-family: "Open Sans", Arial, Helvetica, sans-serif;
  font-size: 15px;
  font-weight: bold;
}
p {
  font-size: 11px;
  margin: 0 0 8px 0;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
  margin-top: 15px;
}
td, th {
  border: 1px solid black;
  padding: 7px;
  text-align: left;
}
button {
  background: #ffeb3b;
  border: 1px solid #000;
  padding: 5px 15px;
  cursor: pointer;
  font-weight: bold;
  font-size: 11px;
}
.signdiv {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
}
</style>
</head>
<body>
<div class="documentmain">
  <h1 style="font-size: 18px; text-align: center;">CREDIT SERVICES ORGANIZATION DISCLOSURE</h1>
  <h2 class="secondhead">Date: PH@DateNow</h2>
  
  <table>
    <tr>
      <td style="width: 50%;"><strong>Credit Services Organization:</strong><br>PH@PortfolioName<br>PH@CSO_Address<br>PH@CSO_Phone</td>
      <td style="width: 50%;"><strong>Consumer:</strong><br>PH@FirstName PH@LastName<br>PH@CustomerAddress<br>PH@CustomerPhone</td>
    </tr>
  </table>
  
  <h3 style="margin-top: 20px;">Consumer Information</h3>
  <table>
    <tr>
      <td style="width: 25%;"><strong>Name:</strong></td>
      <td style="width: 25%;">PH@FirstName PH@LastName</td>
      <td style="width: 25%;"><strong>SSN:</strong></td>
      <td style="width: 25%;">PH@SSN</td>
    </tr>
    <tr>
      <td><strong>Address:</strong></td>
      <td>PH@CustomerAddress</td>
      <td><strong>DOB:</strong></td>
      <td>PH@DOB</td>
    </tr>
    <tr>
      <td><strong>City/State/ZIP:</strong></td>
      <td>PH@City, PH@State PH@ZIP</td>
      <td><strong>ID Type/Number:</strong></td>
      <td>PH@IDType / PH@IDNumber</td>
    </tr>
  </table>
  
  <h3 style="margin-top: 20px;">CSO FEE SCHEDULE</h3>
  <table>
    <thead>
      <tr style="background-color: #f0f0f0;">
        <th>Description</th>
        <th>Amount</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>CSO Fee</td>
        <td>PH@CSOFee</td>
        <td>Due at signing</td>
      </tr>
      <tr>
        <td>Total Finance Charge</td>
        <td>PH@FinanceCharge</td>
        <td>APR: PH@APR%</td>
      </tr>
    </tbody>
  </table>
  
  <h3 style="margin-top: 20px;">TRUTH-IN-LENDING DISCLOSURES</h3>
  <table>
    <tr>
      <td style="width: 25%; text-align: center;"><strong>ANNUAL PERCENTAGE RATE</strong><br>PH@APR%</td>
      <td style="width: 25%; text-align: center;"><strong>FINANCE CHARGE</strong><br>PH@FinanceCharge</td>
      <td style="width: 25%; text-align: center;"><strong>AMOUNT FINANCED</strong><br>PH@AmountFinanced</td>
      <td style="width: 25%; text-align: center;"><strong>TOTAL OF PAYMENTS</strong><br>PH@TotalPayments</td>
    </tr>
  </table>
  
  <h3 style="margin-top: 20px;">Terms and Conditions</h3>
  <p>By executing this Agreement, you acknowledge that you have read and understood all terms. The Credit Services Organization (PH@PortfolioName) will assist in obtaining a loan from a third-party Lender.</p>
  <p>Dear PH@FirstName PH@LastName, your loan application for PH@LoanAmount has been processed.</p>
  
  <h3 style="margin-top: 20px;">ACKNOWLEDGMENT AND AGREEMENT</h3>
  <p>I have received a copy of this disclosure statement and understand all terms.</p>
  
  <div class="signdiv">
    <button type="button">SIGN</button>
    <span>Consumer Signature</span>
    <span style="margin-left: 20px;">Date: PH@TILADate</span>
  </div>
  
  <div class="signdiv">
    <button type="button">SIGN</button>
    <span>CSO Representative Signature</span>
    <span style="margin-left: 20px;">Date: PH@ApprovedDate</span>
  </div>
  
  <p style="margin-top: 20px; font-size: 9px; color: #666;">This document was generated electronically. IP: PH@IP</p>
</div>
</body>
</html>
`;
