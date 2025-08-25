# ShopMe - AI Agent Instructions

**Transform WhatsApp into your complete sales channel with AI-powered automation**

## 🚨 CRITICAL RULES - ABSOLUTE PRIORITY

⚠️ **THESE RULES HAVE ABSOLUTE PRECEDENCE OVER EVERYTHING ELSE:**

1. **ALWAYS CALL ME ANDREA** - Never forget the name
2. **MANDATORY .ENV BACKUP** - Before any .env interaction: `cp .env .env.backup.$(date +%Y%m%d_%H%M%S)`
3. **NEVER TOUCH THE PDF** - `backend/prisma/temp/international-transportation-law.pdf` is SACRED
4. **ZERO HARDCODE** - Everything from database, never static fallbacks
5. **SWAGGER ALWAYS UPDATED** - After every API modification, update swagger.json IMMEDIATELY
6. **TEST BEFORE "DONE"** - Never say completed without verifying it works
7. **WORKSPACE ISOLATION** - Always filter by workspaceId in every query

## ✅ MANDATORY CHECKLIST BEFORE COMPLETING ANY TASK

- [ ] Did I call Andrea by name?
- [ ] Is Swagger updated after API changes?
- [ ] Do all tests pass?
- [ ] No hardcode added?
- [ ] Database seed updated if necessary?
- [ ] WorkspaceId filtering present in all queries?
- [ ] Layout/graphics not modified without permission?
- [ ] Don't invent anything, always ask first, if not in PRD or task list, ask first
- [ ] First PRD then tests then code (truth scale)

## 🧠 Core Development Rules

### Communication & Context
- Address me **by name (Andrea)** in chats and discussions (e.g., "Hello Andrea", "Andrea, what do you think?")
- Context: @/terraform @/backend @/frontend @/scripts
- Focus **only** on code areas **relevant to the assigned task**
- **DO NOT INVENT** anything outside of the assigned scope
- **Keep solutions simple** and avoid unnecessary complexity

### Code Standards
- All code and comments must be **in English**
- **NEVER** run `git push` — **only Andrea** can do this
- Use **PostgreSQL** (not SQLite)
- **OPENROUTER_API_KEY** is stored in the `.env` file of the backend (DO NOT TOUCH `.env`)
- All **scripts** must be placed inside the `/scripts` folder
- If the request is not documented in the PRD please alert the user
- Maintain the existing **graphics and layout**; DO NOT make changes unless **explicit permission** is granted

## 🔒 Security & Data Management

### Critical Backup Rules
⚠️ **MANDATORY BACKUP BEFORE ANY .ENV INTERACTION:**
- **BEFORE** reading, checking, or interacting with ANY `.env` file, **ALWAYS** create a backup first
- **COMMAND TO RUN FIRST:** `cp .env .env.backup.$(date +%Y%m%d_%H%M%S)`
- **NEVER** touch `.env` files without creating a timestamped backup
- **IF .ENV IS LOST:** immediately restore from the most recent `.env.backup.*` file
- **ALWAYS** inform Andrea when creating backups: "Andrea, I'm creating a backup of .env before proceeding"

### Critical File Protection
⚠️ **NEVER DELETE OR MODIFY THE PDF FILE:**
- **NEVER** delete, modify, or touch `backend/prisma/temp/international-transportation-law.pdf`
- **NEVER** remove files from `backend/prisma/temp/` directory
- **NEVER** modify the seed script to remove PDF file creation
- **THIS FILE IS CRITICAL** for the system to work properly
- **IF DELETED:** Andrea will be very angry and the system will break
- **ALWAYS** preserve this file during any script or seed modifications

### Database-Only Configuration
⚠️ **NEVER CREATE HARDCODED CONFIGURATION FALLBACKS:**
- **NEVER** create hardcoded default prompts, models, or agent configurations
- **NEVER** use fallback values like `DEFAULT_PROMPT` or `initialConfig` in frontend/backend
- **ALL CONFIGURATION MUST COME FROM DATABASE** - no exceptions
- **IF DATABASE CONFIG IS MISSING:** show proper error message to user, don't create fallbacks
- **AGENT PROMPTS:** must always come from `agentConfig` table in database
- **NO STATIC PROMPTS:** everything must be dynamic from database
- **ERROR HANDLING:** if config not found, show error - don't invent default values
- **FRONTEND:** if no config from API, show error state - don't use hardcoded defaults
- **BACKEND:** if no agent config in DB, return error - don't use fallback prompts

## 📁 Project Structure & Architecture

### Root Project Structure
```
AI4Devs-finalproject/
├── 📁 backend/                     # Backend Node.js application
├── 📁 frontend/                    # Frontend React application
├── 📁 scripts/                     # Project automation scripts
├── 📁 docs/                        # Documentation and prompts
├── 📄 docker-compose.yml           # Docker services configuration
├── 📄 .gitignore                   # Git ignore rules
└── 📄 README.md                    # Project overview
```

### Backend Structure (`/backend/`)
```
backend/
├── 📁 src/                         # Source code
│   ├── 📁 controllers/             # API controllers (DDD Application Layer)
│   ├── 📁 services/                # Business logic services (DDD Domain Layer)
│   ├── 📁 repositories/            # Data access layer (DDD Infrastructure)
│   ├── 📁 middleware/              # Express middleware
│   ├── 📁 routes/                  # API route definitions
│   ├── 📁 types/                   # TypeScript type definitions
│   ├── 📁 utils/                   # Utility functions
│   └── 📄 index.ts                 # Application entry point
├── 📁 prisma/                      # Database schema and migrations
│   ├── 📁 migrations/              # Database migration files
│   ├── 📁 temp/                    # Temporary files for seeding
│   ├── 📄 schema.prisma            # Database schema definition
│   └── 📄 seed.ts                  # Database seeding script
├── 📁 uploads/                     # File upload storage
│   └── 📁 documents/               # Document storage directory
├── 📁 __tests__/                   # Test files (MANDATORY structure)
│   ├── 📁 unit/                    # Unit tests
│   │   ├── 📁 __mocks__/           # Unit test mocks
│   │   └── 📄 *.spec.ts            # Unit test files
│   └── 📁 integration/             # Integration tests
│       ├── 📁 __mocks__/           # Integration test mocks
│       └── 📄 *.integration.spec.ts # Integration test files
├── 📄 package.json                 # Dependencies and scripts
├── 📄 jest.config.js               # Jest testing configuration
├── 📄 tsconfig.json                # TypeScript configuration
└── 📄 .env                         # Environment variables (DO NOT COMMIT)
```

### Frontend Structure (`/frontend/`)
```
frontend/
├── 📁 src/                         # Source code
│   ├── 📁 components/              # React components
│   │   ├── 📁 ui/                  # Reusable UI components (shadcn/ui)
│   │   └── 📁 layout/              # Layout components
│   ├── 📁 pages/                   # Page components
│   ├── 📁 hooks/                   # Custom React hooks
│   ├── 📁 services/                # API service functions
│   ├── 📁 types/                   # TypeScript type definitions
│   ├── 📁 utils/                   # Utility functions
│   ├── 📁 styles/                  # CSS and styling files
│   └── 📄 main.tsx                 # Application entry point
├── 📁 public/                      # Static assets
├── 📁 __test__/                    # Test files (MANDATORY structure)
│   ├── 📁 unit/                    # Unit tests
│   │   └── 📄 *.{test,spec}.{js,ts,tsx} # Unit test files
│   └── 📁 e2e/                     # End-to-end tests
│       ├── 📁 support/             # Cypress support files
│       │   ├── 📄 commands.js      # Custom Cypress commands
│       │   └── 📄 e2e.js           # Cypress setup file
│       └── 📄 *.cy.{js,ts,tsx}     # E2E test files
├── 📄 package.json                 # Dependencies and scripts
├── 📄 vite.config.ts               # Vite configuration
├── 📄 vitest.config.ts             # Vitest testing configuration
├── 📄 cypress.config.cjs           # Cypress E2E testing configuration
├── 📄 tailwind.config.js           # Tailwind CSS configuration
└── 📄 tsconfig.json                # TypeScript configuration
```

### Naming Conventions
- **Directories**: kebab-case (`document-service`, `user-controller`)
- **TypeScript files**: camelCase (`userService.ts`, `documentController.ts`)
- **React components**: PascalCase (`UserProfile.tsx`, `DocumentList.tsx`)
- **Test files**: `*.spec.ts` (unit), `*.integration.spec.ts` (integration), `*.cy.js` (E2E)

### Forbidden Patterns
**DO NOT CREATE:**
- `package.json` in project root
- Test files outside `__tests__/` or `__test__/` directories
- Files directly in `src/` without proper subdirectories
- Mixed naming conventions
- Any `.js` files (use TypeScript only)

## 🧪 Testing & Quality Assurance

### Test Organization
- **Unit tests**: `backend/src/__tests__/unit/` and `frontend/src/__test__/unit/`
- **Integration tests**: `backend/src/__tests__/integration/` and `frontend/src/__test__/e2e/`
- **Mocks**: Must be in `__mocks__/` subdirectories within test folders
- **Test user**: Always use the same test user for automated tests, stored in memory bank

### Testing Workflow
- **TDD approach**: First design tests for a bug, then develop the fix, verify success
- **Real tests**: Tests must be real and not use mocks
- **Verification**: Run `npm run test:unit`, `npm run test:integration`, `npm run seed`, and `npm run build` for both frontend and backend

### API Testing
- **Swagger updates**: After every API modification, update swagger.json IMMEDIATELY
- **Integration tests**: Require backend active (`npm run dev`) and N8N active
- **If tests fail**: Verify backend (port 3001), N8N (port 5678), database, seed

## 📚 Documentation & References

### Project Documentation
All project documentation is located under:
- **Task List**: `docs/other/task-list.md`
- **PRD Document**: `docs/PRD.md`
- **LangChain Documentation**: `docs/langchain.md`
- **MetaPrompt**: `docs/metaprompt.md`
- **OWASP Security**: `docs/owasp.md`
- **Agent Prompt**: `docs/prompt_agent.md`

### Database Queries
To see what we have in the DB use for examples:
```bash
docker exec -it shopmefy-db psql -U shopmefy -d shopmefy -c "SELECT COUNT(*) FROM document_chunks;"
```

### Architecture Notes
#### LLM Workflow
The user's input is processed through a two-stage LLM workflow:
1. **First LLM**: Decides the target calling function
2. **Second LLM**: Has history and formats the final user response

> **Note**: This is the **only static point** in the workflow. If the flow **does not follow** this structure, we must discuss it or **modify the agent's prompt** inside the **SEED**.

#### Calling Functions
- Calling functions are located in `backend/src/chatbot/calling-functions/`
- Use LangChain for implementing message flows
- Follow the repository pattern
- Keep business logic in service layers

## 🚫 Strict Prohibitions

### Never Hardcode Data
- **NEVER** create hardcoded responses or fallback data in controllers
- **NEVER** return fake/mock data outside of test environments
- **NEVER** use hardcoded product lists, prices, or inventory data
- **NEVER** create static responses that bypass database queries
- **ALWAYS** use dynamic database searches and fetch real data from **Prisma**
- **NO** static text, prompts, or codes; **everything must come from the database**

### Critical Restrictions
- **NEVER** use hardcoded conditions like `lowerQuery.includes('vino') || lowerQuery.includes('export')`
- **DO NOT USE OPENAI** - use **OPENROUTER** instead
- **NEVER** use the word "hardcode" in the backend code
- **NEVER** use static prompts - prompts must come from database agent settings along with temperature, topP, token, model

### Additional Restrictions
- DO NOT write any **catch blocks** with generic messages; **always provide the full error stack**
- **NEVER create fake functions** – everything must reflect the real database and logic
- **NEVER change the layout or graphics** without **explicit permission**
- **Update ONLY existing tasks** in the task list when completing work - **DO NOT add new tasks**
- **DO NOT invent npm run commands!**

## 📋 Task Management

### Task Updates
- Always update **ONLY the existing tasks** in `docs/other/task-list.md` when completing tasks that are already present on the list
- **DO NOT add new tasks** to the task list - only mark existing ones as completed or update their status
- Keep track of progress and document changes properly

### Context Gathering
- Get always the full context from @backend @frontend and @final
- Get the context from the test unit, integration, integration for having a better understanding
- When I say PRD, consider the file `/docs/PRD.md`
- Remember that PRD has absolute truth, then truth is in tests, then in code

### Development Workflow
- **Reflect, reason, compare, read** in order: PRD → tests → code before taking any action
- If I write something that's not in line, block the user
- Servers restart automatically, no need to open many terminals, always use the same terminal
- Use good practices for BE (DDD), for FE create reusable components if necessary

## 🔧 Technical Guidelines

### Environment & Setup
- **Terminal context**: Always check the context of the terminal, if in wrong terminal, ask to switch to correct terminal
- **Package management**: Don't create `package.json` in root - use `backend` or `frontend` folders for installing packages
- **File organization**: All `.md` files must be in `docs` except `README.md`
- **Credentials**: Avoid putting credentials on git
- **Scripts**: All scripts must be in `/scripts/` directory and be executable
- **Temporary scripts**: When creating a script for temporary updates, delete it afterwards

### System Synchronization
- System must be synchronized: swagger, seed code, test BE FE, README, prompts folder
- When finishing a job, ask: "Do you need to update this section too?"
- After every API modification: update swagger.json immediately
- Before saying "done": verify that swagger is updated and working

### Memory Bank Integration
- All core Memory Bank files reside within the `docs/memory-bank/` directory
- **Tasks File**: `docs/memory-bank/tasks.md` - Active, in-progress task tracking
- **Active Context File**: `docs/memory-bank/activeContext.md`
- **Progress File**: `docs/memory-bank/progress.md`
- **Project Brief File**: `docs/memory-bank/projectbrief.md`
- **Product Context File**: `docs/memory-bank/productContext.md`
- **System Patterns File**: `docs/memory-bank/systemPatterns.md`
- **Tech Context File**: `docs/memory-bank/techContext.md`
- **Style Guide File**: `docs/memory-bank/style-guide.md`

## 🎯 Success Criteria

### Verification Checklist
- [ ] All tests pass (unit, integration, build)
- [ ] Swagger documentation is updated and accurate
- [ ] No hardcoded values introduced
- [ ] Database seed works correctly
- [ ] Workspace isolation is maintained
- [ ] Layout/graphics unchanged without permission
- [ ] Code follows naming conventions
- [ ] Documentation is updated
- [ ] Memory bank is current
- [ ] Andrea is satisfied with the implementation

### Quality Standards
- **Code quality**: Clean, organized, well-commented, readable flow
- **Performance**: Optimized solutions, avoid unnecessary complexity
- **Security**: Proper error handling, no credentials in code
- **Maintainability**: Follow established patterns, reusable components
- **Documentation**: Keep all documentation current and accurate

---

**Remember**: This is a multilingual SaaS platform (Italian, English, Spanish) for WhatsApp e-commerce automation. Every decision should align with the goal of creating intelligent chatbots, managing products, and processing orders through WhatsApp with AI-powered automation.
