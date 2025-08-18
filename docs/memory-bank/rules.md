# 🧠 MEMORY BANK - DEVELOPMENT RULES

## 📋 **CRITICAL RULES - ALWAYS FOLLOW**

### 🚨 **AUTOMATED PROCESSES**

#### 📝 **Prompt Agent Changes**
**Rule**: Every time `prompt_agent.md` is modified, run `npm run seed`  
**Location**: `docs/other/prompt_agent.md`  
**Command**: `npm run seed`  
**Reason**: Propagate changes to N8N/workflow and related systems  
**Status**: ✅ **ACTIVE**  

#### 🤖 **Prompt Management**
**Rule**: NEVER modify prompts directly in N8N - ALWAYS modify `prompt_agent.md`  
**Location**: `docs/other/prompt_agent.md` (source of truth)  
**Reason**: Prompts are dynamic and managed through the seed process  
**Status**: ✅ **ACTIVE**  

#### 🔄 **N8N Workflow Management**
**Rule**: N8N workflows are imported from JSON files, not edited directly  
**Location**: `n8n/workflows/shopme-whatsapp-workflow.json`  
**Command**: Use scripts to import/export workflows  
**Reason**: Maintain version control and consistency  
**Status**: ✅ **ACTIVE**  

#### 🔄 **API Changes**
**Rule**: After any API modification, update `swagger.json` immediately  
**Location**: `backend/src/swagger.yaml`  
**Command**: Update swagger documentation  
**Reason**: Keep API documentation current and accurate  
**Status**: ✅ **ACTIVE**  

#### 🧪 **Code Changes**
**Rule**: Before marking any task as "DONE", run tests to verify functionality  
**Command**: `npm test` or appropriate test command  
**Reason**: Ensure code quality and prevent regressions  
**Status**: ✅ **ACTIVE**  

### 🔒 **SECURITY RULES**

#### 🔐 **Environment Files**
**Rule**: NEVER touch `.env` files without creating backup first  
**Command**: `cp .env .env.backup.$(date +%Y%m%d_%H%M%S)`  
**Reason**: Prevent loss of critical configuration  
**Status**: ✅ **ACTIVE**  

#### 🗄️ **Database Queries**
**Rule**: ALL database queries MUST include workspaceId filtering  
**Reason**: Ensure workspace isolation and data security  
**Status**: ✅ **ACTIVE**  

#### 🚫 **Hardcoding**
**Rule**: NEVER create hardcoded fallbacks - everything from database  
**Reason**: Maintain system flexibility and configuration-driven approach  
**Status**: ✅ **ACTIVE**  

### 🏗️ **ARCHITECTURE RULES**

#### 📁 **File Structure**
**Rule**: Follow established folder structure - no files in root  
**Reason**: Maintain organized codebase structure  
**Status**: ✅ **ACTIVE**  

#### 🧪 **Testing**
**Rule**: All new features must include tests  
**Location**: `__tests__/` directories  
**Reason**: Ensure code quality and prevent regressions  
**Status**: ✅ **ACTIVE**  

#### 📚 **Documentation**
**Rule**: Update relevant documentation after code changes  
**Reason**: Keep documentation current and useful  
**Status**: ✅ **ACTIVE**  

---

## 📋 **WORKFLOW RULES**

### 🔄 **Development Process**
1. **Before Starting**: Check current task in `tasks.md`
2. **During Development**: Update progress in `progress.md`
3. **After Changes**: Run tests and update swagger if needed
4. **Before Completion**: Verify all requirements are met
5. **After Completion**: Create reflection document

### 📝 **Code Standards**
- **Language**: All code and comments in English
- **Naming**: Follow established naming conventions
- **Comments**: Clear, helpful comments for complex logic
- **Error Handling**: Proper error handling with meaningful messages

### 🎨 **UI/UX Rules**
- **Layout Changes**: Never modify layout without explicit permission
- **Consistency**: Follow existing design patterns
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG compliance

---

## 📋 **AUTOMATION RULES**

### 🤖 **AI Assistant Rules**
- **Task Tracking**: Always update task progress
- **Documentation**: Keep Memory Bank current
- **Testing**: Verify functionality before completion
- **Communication**: Address Andrea by name

### 📝 **Prompt Management Best Practices**
- **Source of Truth**: `prompt_agent.md` is the ONLY source for prompts
- **Version Control**: Always commit prompt changes to git
- **Testing**: Test chatbot behavior after prompt changes
- **Documentation**: Document significant prompt changes
- **Backup**: Keep backup of working prompts before major changes
- **Incremental**: Make small, testable changes rather than large modifications

### 🔧 **Build Rules**
- **Development**: `npm run dev` includes seed process
- **Testing**: Run tests before deployment
- **Documentation**: Update swagger after API changes
- **Backup**: Create backups before critical changes

### 🤖 **Prompt Workflow**
1. **Edit**: Modify `docs/other/prompt_agent.md` (source of truth)
2. **Seed**: Run `npm run seed` to propagate changes
3. **Verify**: Check N8N workflow for updated prompts
4. **Test**: Verify chatbot behavior with new prompts
5. **Commit**: Commit changes to version control

---

## 📋 **QUALITY ASSURANCE RULES**

### ✅ **Before "DONE" Checklist**
- [ ] All tests pass
- [ ] Swagger updated (if API changes)
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Functionality verified
- [ ] No hardcoded values
- [ ] Workspace isolation maintained

### 🔍 **Code Review Checklist**
- [ ] Follows project patterns
- [ ] Proper error handling
- [ ] Clear documentation
- [ ] No security issues
- [ ] Performance considerations
- [ ] Test coverage adequate

---

## 📋 **EMERGENCY RULES**

### 🚨 **Critical Issues**
1. **Data Loss**: Immediately restore from backup
2. **Security Breach**: Isolate and investigate
3. **System Down**: Check logs and restart services
4. **Configuration Lost**: Restore from `.env.backup.*`
5. **Prompt Changes Lost**: Restore from `prompt_agent.md` and re-run seed

### 🔄 **Recovery Procedures**
- **Database Issues**: Check Prisma migrations
- **API Issues**: Verify swagger and endpoints
- **Frontend Issues**: Check build and dependencies
- **N8N Issues**: Restart and verify credentials
- **Prompt Issues**: Check `prompt_agent.md` and re-run `npm run seed`

---

## 📋 **COMMUNICATION RULES**

### 💬 **With Andrea**
- **Address**: Always call Andrea by name
- **Updates**: Regular progress updates
- **Questions**: Ask before making assumptions
- **Decisions**: Get approval for major changes

### 📊 **Reporting**
- **Progress**: Update progress.md regularly
- **Issues**: Document problems and solutions
- **Success**: Celebrate completed milestones
- **Next Steps**: Clear next action items

---

## 📋 **MAINTENANCE RULES**

### 🔄 **Regular Tasks**
- **Daily**: Update progress and check for issues
- **Weekly**: Review and clean up temporary files
- **Monthly**: Update documentation and dependencies
- **Quarterly**: Review and optimize performance

### 📈 **Continuous Improvement**
- **Learn**: Document lessons learned
- **Optimize**: Improve processes and code
- **Update**: Keep tools and dependencies current
- **Plan**: Prepare for future development

---

## 📋 **RULE ENFORCEMENT**

### ✅ **Compliance**
- **Automatic**: AI assistant enforces rules automatically
- **Manual**: Andrea reviews and approves changes
- **Verification**: Tests and checks ensure compliance
- **Documentation**: Rules are documented and accessible

### 🔄 **Updates**
- **Review**: Rules reviewed regularly
- **Update**: Rules updated as needed
- **Communication**: Changes communicated clearly
- **Training**: Team trained on new rules

---

## 📝 **NOTES**

- **Priority**: Critical rules must be followed always
- **Flexibility**: Rules can be updated based on project needs
- **Documentation**: All rule changes must be documented
- **Enforcement**: AI assistant enforces rules automatically
- **Review**: Regular review of rules effectiveness
