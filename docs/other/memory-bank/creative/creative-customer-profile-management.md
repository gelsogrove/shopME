# Creative Phase: Customer Profile Management System

**Date**: Current session  
**User**: Andrea  
**Task**: Create secure customer profile management page with WhatsApp integration

---

📌 **CREATIVE PHASE START: Customer Profile Management**  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM  
**Description**: Users want to modify their personal data via WhatsApp but need a secure web interface  
**Requirements**: 
- WhatsApp bot generates secure links for profile editing
- 1-hour token-based security for profile page access
- Form for editing personal data (email, phone, addresses)
- Navigation to orders list and back
- UI/UX consistent with existing application design

**Constraints**: 
- No hardcoded data (everything from database)
- Workspace isolation required
- Must work with existing N8N workflow
- Token expiration after 1 hour
- Form validations required

## 2️⃣ ARCHITECTURE OPTIONS

### **Option A: Simple Form with Direct API Calls**
- **Approach**: Direct API calls without token validation
- **Pros**: Simple implementation
- **Cons**: No security, no token validation
- **Risk**: High security risk
- **Decision**: ❌ REJECTED

### **Option B: Token-Generated URL with SecureTokenService** ⭐ **SELECTED**
- **Approach**: Generate secure token, validate on frontend
- **Pros**: Secure, reusable pattern, consistent with existing system
- **Cons**: Slightly more complex
- **Risk**: Low, proven pattern
- **Decision**: ✅ **SELECTED**

### **Option C: Session-Based Authentication**
- **Approach**: Session tokens with longer expiration
- **Pros**: Longer access time
- **Cons**: More complex, security concerns
- **Risk**: Medium
- **Decision**: ❌ REJECTED

## 3️⃣ SELECTED ARCHITECTURE: Option B

### **🏗️ System Architecture**
```
WhatsApp Bot → GetCustomerProfileLink() → SecureTokenService → Frontend Page → Token Validation → Profile Form
```

### **🔐 Security Design**
- **Token Type**: 'profile' with 1-hour expiration
- **Token Generation**: SecureTokenService.createToken('profile', workspaceId, payload, '1h')
- **Token Validation**: Frontend validates before showing form
- **Payload**: { customerId, workspaceId, phone, createdAt }

### **🌐 URL Structure**
```
http://localhost:3000/customer-profile?token={SECURE_TOKEN}&phone={PHONE_NUMBER}
```

### **📱 Frontend Design**
- **Base Component**: CustomerProfilePublicPage.tsx
- **Form Design**: Based on ClientSheet.tsx (existing pattern)
- **Validation**: useTokenValidation hook
- **Navigation**: Link to orders list, back to WhatsApp

## 4️⃣ COMPONENT DESIGN

### **Backend Components**
1. **GetCustomerProfileLink.ts** (New)
   - Generate secure token for profile access
   - Return ShopMe URL with token
   - Handle customer lookup by phone

2. **Internal API Controller** (Extend)
   - Add 'profile' action to generateToken method
   - Support profile token generation

3. **Customer Service** (Extend)
   - Add methods for profile data retrieval
   - Add methods for profile data update

### **Frontend Components**
1. **CustomerProfilePublicPage.tsx** (New)
   - Token validation on load
   - Profile form with existing data
   - Form submission with validation
   - Navigation to orders list

2. **Profile Form Component** (New)
   - Based on ClientSheet.tsx design
   - Fields: name, email, phone, company, address
   - Exclude: boolean fields, notes
   - Include: invoice address fields

3. **Token Validation** (Reuse)
   - useTokenValidation hook
   - 1-hour token validation
   - Error handling for expired/invalid tokens

## 5️⃣ UI/UX DESIGN DECISIONS

### **🎨 Visual Design**
- **Consistency**: Match existing ClientSheet.tsx design
- **Layout**: Single column form with proper spacing
- **Colors**: Use existing color scheme
- **Typography**: Consistent with application fonts

### **📋 Form Fields**
**Personal Information:**
- Name (required)
- Email (required, email validation)
- Phone (required, phone validation)
- Company (optional)

**Address Information:**
- Street Address (optional)
- City (optional)
- Postal Code (optional)
- Country (optional)

**Invoice Address (if different):**
- Invoice First Name (optional)
- Invoice Last Name (optional)
- Invoice Company (optional)
- Invoice Address (optional)
- Invoice City (optional)
- Invoice Postal Code (optional)
- Invoice Country (optional)
- Invoice VAT Number (optional)
- Invoice Phone (optional)

### **🔗 Navigation**
- **Header**: "Customer Profile Management"
- **Save Button**: "Save Changes"
- **Cancel Button**: "Back to Orders"
- **Orders Link**: "View My Orders"

### **⚡ User Experience**
- **Loading States**: Show loading during token validation
- **Error Handling**: Clear error messages for invalid tokens
- **Success Feedback**: Toast notification on successful save
- **Form Validation**: Real-time validation with error messages

## 6️⃣ TECHNICAL IMPLEMENTATION PLAN

### **Phase 1: Backend Implementation**
1. Create GetCustomerProfileLink.ts calling function
2. Extend InternalApiController for profile token generation
3. Add profile token type to SecureTokenService
4. Create customer profile update endpoints

### **Phase 2: Frontend Implementation**
1. Create CustomerProfilePublicPage.tsx
2. Create ProfileForm component based on ClientSheet.tsx
3. Implement token validation
4. Add form validation and submission

### **Phase 3: Integration & Testing**
1. Test WhatsApp bot integration
2. Test token generation and validation
3. Test form submission and data updates
4. End-to-end testing

## 7️⃣ RISK ASSESSMENT

### **🔴 High Risk**
- **Token Security**: Mitigated by using proven SecureTokenService
- **Data Validation**: Mitigated by comprehensive form validation

### **🟡 Medium Risk**
- **UI/UX Consistency**: Mitigated by basing design on existing components
- **WhatsApp Integration**: Mitigated by following existing patterns

### **🟢 Low Risk**
- **Performance**: Simple form, minimal impact
- **Compatibility**: Standard React/TypeScript implementation

## 8️⃣ SUCCESS METRICS

### **Functional Requirements**
- ✅ WhatsApp bot generates secure profile links
- ✅ 1-hour token security works correctly
- ✅ Form displays and updates customer data
- ✅ Navigation to orders list works
- ✅ UI/UX matches existing design

### **Technical Requirements**
- ✅ Token validation on frontend
- ✅ Form validation and error handling
- ✅ API security with workspace isolation
- ✅ Database updates work correctly

---

🎯 **CREATIVE PHASE COMPLETE**  
**Selected Architecture**: Option B - Token-Generated URL with SecureTokenService  
**Next Phase**: VAN QA for technical validation

