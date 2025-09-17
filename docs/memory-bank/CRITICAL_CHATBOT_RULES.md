# 🚨 CRITICAL CHATBOT FLOW RULES - NEVER FORGET

## MANDATORY RULES - ALWAYS FOLLOW

### 1. **LLM DECIDES EVERYTHING**
- ❌ NO hardcoded if statements
- ❌ NO regex patterns
- ❌ NO include patterns
- ✅ LLM decides what to do based on the prompt

### 2. **CF EXECUTION**
- When LLM calls a CF, pass ALL data:
  - customerId
  - workspaceId
  - query
  - language
  - etc.
- CF saves response to DB automatically

### 3. **SEARCHRAG FLOW**
Always run SearchRag after CF execution:
- **If SearchRag is EMPTY** → return saved response from CF
- **If SearchRag has results** → return FAQ response from SearchRag

### 4. **FORMATTER RECEIVES 5 PARAMETERS**
Always pass these to FormatterService:
- `language`
- `discount` (customer discount)
- `question` (original user input)
- `workspaceId`
- `customerId`

### 5. **VARIABLE REPLACEMENT**
- Formatter finds variables like `[LIST_ALL_PRODUCTS]`, `[USER_DISCOUNT]`, etc.
- Replaces them with real data from database
- Applies proper formatting

### 6. **NO HARDCODING**
- ❌ Never use hardcoded patterns
- ❌ Never use hardcoded keywords
- ❌ Never use hardcoded logic
- ✅ Everything must be intelligent and dynamic

## FLOW SUMMARY
```
User Question → LLM Decides → CF Executes → CF Saves to DB → SearchRag → 
If Empty: Use Saved Response | If Has Results: Use FAQ Response → 
Formatter (5 params) → Variable Replacement → Final Response
```

## ⚠️ CRITICAL
These rules are MANDATORY and must be followed in every implementation.
No exceptions. No shortcuts. No hardcoding.
