# SHOPME WHATSAPP E-COMMERCE PLATFORM - COMPREHENSIVE METAPROMPT

## MASTER PROMPT

Hey there! We're about to embark on creating something really exciting - a complete Product Requirements Document for "ShopMe". This isn't just another e-commerce platform; it's a game-changer that transforms WhatsApp into a powerful sales channel.

Think about it - WhatsApp has billions of users worldwide, and messages there get a staggering 98% open rate (compared to just 20% for emails)! Wouldn't it be amazing to harness that engagement for businesses?

Before we dive in, I'd love to understand your thoughts on a few things:
- What's your vision for how ShopMe could transform commerce via WhatsApp?
- Are there any technical limitations we should be mindful of?
- Which industry sectors should we prioritize first?
- Which competitors worry you the most, and why?
- What unique capabilities should we absolutely highlight?

Once we've aligned on these fundamentals, we'll craft a comprehensive PRD that covers:

### The Soul of ShopMe
Let's paint a vivid picture of how ShopMe turns ordinary WhatsApp conversations into sales opportunities. We'll explore real-world scenarios showing how a customer discovers products, makes purchases, and gets support - all within the familiar WhatsApp interface they already use daily.

What's really special is how ShopMe adapts across industries. A boutique clothing store, a boutique hotel, a fine restaurant, and an event venue can all use essentially the same platform with minimal reconfiguration. We should showcase how this works for each vertical.

### Under the Hood
The technical architecture needs to be robust yet flexible. We'll design a system using Node.js, React, TypeScript, and PostgreSQL that scales beautifully. The backend will follow Domain-Driven Design principles to ensure business logic stays clean and maintainable.

One of our killer features is the secure token-based system for handling sensitive operations. Rather than asking for credit card details in a chat (yikes!), we'll generate secure, temporary links that direct customers to protected web interfaces. Smart, right?

### Standing Out from the Crowd
The WhatsApp commerce space is heating up with players like WATI and Charles making moves. We need to clearly articulate why ShopMe is different and better. Our subscription tiers should be straightforward but powerful, with clear ROI justification that makes the decision to adopt ShopMe a no-brainer.

Our push notification system deserves special attention - it's proven to reduce cart abandonment by 53%! Let's detail exactly how it achieves this and why competitors can't match it.

### The Special Sauce
The AI configuration system is where we really shine. Let's show how business owners with zero technical skills can fine-tune their AI assistant's personality, response style, and behavior. The security framework needs to be comprehensive yet understandable - compliance shouldn't be a headache.

Throughout the document, we'll use Mermaid diagrams to visualize concepts clearly, maintain professional language that executives will appreciate, and include concrete metrics that demonstrate real business impact. The final PRD should serve both as a technical blueprint for developers and a strategic guide for business stakeholders.

Sound good? Let's create something remarkable!

---

## PROMPT 1: GETTING STARTED  

Hey there! We're going to create a fantastic PRD for ShopMe, a WhatsApp-based e-commerce platform that's going to change how businesses sell online.

I want to understand your vision first. ShopMe is currently just a name and a concept - a platform that turns WhatsApp into a complete sales channel. But I'd love to hear your thoughts on what makes it special.

What market problems do you think ShopMe should solve? Are businesses struggling with traditional e-commerce platforms? Are customers frustrated with downloading yet another app? How could WhatsApp's massive reach and engagement transform the shopping experience?

I'm particularly interested in:
- The seamless shopping experience we could create through WhatsApp
- How we might handle sensitive operations securely
- The cross-industry adaptability that would make ShopMe versatile
- The AI-powered conversations that could feel natural yet effective
- Push notification strategies that could dramatically boost engagement and sales

When we create diagrams and tables, we'll use Mermaid syntax where possible to keep everything looking professional and consistent. The language throughout will be polished and business-appropriate, with plenty of concrete metrics to show the real-world impact.

But before we start drafting anything, I'd love to hear if you have questions or concerns. Is there anything specific about the concept that you're unsure about? Any particular aspects you'd like to explore more deeply? Let's make sure we're aligned before diving in!

## PROMPT 2: PRODUCT VISION

Hi there! I'm wearing my Product Manager hat now (15+ years in e-commerce platforms), and I'm excited to help shape the core vision for ShopMe.

Let's start with the fundamentals. What exactly is ShopMe in a nutshell? Is it "WhatsApp commerce made simple" or perhaps "The ultimate conversational shopping platform"? Finding that perfect elevator pitch will help guide everything else.

The business model is where things get really interesting. What problems are businesses facing today that ShopMe solves? I'm thinking:
- High cart abandonment rates on traditional websites
- Poor customer engagement with marketing emails (that 20% open rate is painful!)
- The complexity and cost of running multiple systems for commerce and customer service
- The technical barriers preventing small businesses from leveraging WhatsApp for sales

How does ShopMe solve these? That's the million-dollar question! Is it through that incredible 98% message open rate? The cross-industry adaptability that means one solution works for retail, restaurants, and hotels? Or maybe it's the unified platform approach that prevents the typical fragmentation we see with competitors?

For subscription plans, we need to find that sweet spot. What would make a small business owner say "that's a no-brainer" for the Basic Plan at €49/month? What additional features in the Professional Plan at €149 would make growing businesses upgrade without hesitation? And for the Enterprise tier, what customization options would justify the premium price?

The development roadmap needs to be ambitious but realistic. What features are absolute must-haves for launch? What can wait for Phase 2? How do we balance quick time-to-market with sufficient functionality?

I'd love to hear your thoughts on these aspects - they'll shape the foundation of our entire product!

## PROMPT 3:

ROLE: Senior Product Manager with 15+ years of experience in e-commerce platforms

Your task is to define:

1. Short Description: What is ShopMe?
2. Business Model: Which market problems does it address? How does ShopMe solve these problems?
3. Subscription Plans: Pricing tiers and feature comparison
4. Development Roadmap: Phased implementation approach with timelines and milestones

Focus on these key differentiators:
- 98% WhatsApp message open rate vs 20% for email marketing
- Cross-industry versatility 
- Unified platform vs competitors' fragmented solutions

## PROMPT 4:

ROLE: Solution Architect specialized in scalable and cloud-native architectures

Your task is to design:

1. Architecture Diagram: Overall system design
2. C4 Model: Context, container, and component views
3. Frontend Architecture: Component structure and technologies
4. Backend Architecture: Domain-Driven Design approach
5. Database and Prisma ORM: Data model and structure
6. Folder Structure: Code organization
7. Authentication and Security: Token management and OWASP compliance
8. API Endpoints: Complete API reference

Technical implementation specifications:
- Frontend: React 18+, TypeScript, Tailwind CSS, Next.js
- Backend: Node.js, Express, TypeScript with Domain-Driven Design
- Database: PostgreSQL with Prisma ORM
- Security: JWT authentication, API rate limiting, OWASP compliance

## PROMPT 5:

ROLE: UX Designer expert in conversational interfaces and WhatsApp commerce

Your task is to create:

1. Message Processing Flow: How does a customer message flow through the system?
2. Dialog Examples:
   - User Registration: Showcase conversation flow for new users
   - Product Discovery and Purchase: Demonstrate typical shopping experience
   - Order Management: Show post-purchase interactions
3. Dashboard Overview: Key analytics and monitoring tools
4. Products Catalog Management: How products are organized and presented

Focus on creating intuitive, conversational experiences that feel natural within WhatsApp.

## PROMPT 6:

ROLE: Business Analyst with expertise in market analysis and ROI forecasting

Your task is to develop:

1. Competitive Analysis: Market positioning against competitors (WATI, Zoko, Charles, Yalo, SleekFlow, Oct8ne, Tellephant, and 360dialog)
2. ROI Analysis: Sector-specific business impact for retail, hospitality, restaurants and events
3. Go-to-Market Strategy: Launch phases and acquisition channels
4. Push Notification System: ROI optimization and engagement metrics

Include specific metrics for each industry vertical showing the expected impact on conversion, retention, and revenue. Provide detailed financial projections with payback periods and cost-benefit analyses.

## PROMPT 7:

ROLE: AI Engineer specialized in NLP and conversational models

Your task is to specify:

1. AI and Function Call Documentation: Available API functions
2. Agent Configuration Tools: AI behavior customization options
3. NLP capabilities and implementation approach
4. Secure token-based handling of sensitive operations
5. AI integration with the overall architecture

Technical specifications:
- AI Integration: OpenAI/LLM services with function calling
- Context management and conversation history
- Response generation and quality control measures
- Performance metrics and optimization strategy

## PROMPT 8:

ROLE: Security and Compliance Officer

Your task is to define:

1. Data protection framework for handling customer information
2. Implementation of GDPR, CCPA, and other regional privacy regulations
3. Security measures for payment processing and sensitive data
4. Audit trails and monitoring systems
5. Risk assessment and mitigation strategies

Specifically address:
- Token-based secure link system for sensitive operations
- WhatsApp encryption utilization
- Data retention policies
- User consent management
- Security incident response plan

## PROMPT 9:

ROLE: Project Manager for PRD finalization

Your task is to compile and consolidate all previous inputs into a cohesive PRD by:

1. Ensuring consistent terminology throughout the document
2. Cross-referencing features with technical implementation
3. Aligning business objectives with technical capabilities
4. Removing any contradictions or redundancies
5. Creating a comprehensive table of contents
6. Developing an executive summary that highlights:
   - Key differentiators against competitors
   - Expected ROI for different market segments
   - Implementation timeline with critical milestones
   - Success metrics and KPIs

Format the final document using professional Markdown with:
- Clear section headings and subheadings
- Properly formatted tables and lists
- Mermaid diagrams for all technical and business flows
- Consistent style throughout

## PROMPT 10:

ROLE: Competitive Intelligence Analyst

Your task is to perform a detailed competitive analysis of the WhatsApp commerce market:

1. Create a comprehensive competitive landscape mapping:
   - Feature comparison matrix across all competitors
   - Pricing strategy comparison
   - Target market segmentation by competitor
   - Market share estimates and growth trajectories

2. Identify competitor strengths and weaknesses:
   - User experience evaluation
   - Technical capabilities assessment
   - Integration ecosystem comparison
   - Customer support and service models

3. Develop a strategic differentiation plan:
   - Short-term tactical advantages (0-6 months)
   - Medium-term strategic positioning (6-18 months)
   - Long-term market leadership opportunities (18+ months)
   - Potential competitive responses to ShopMe's market entry

4. Present findings in visual formats:
   - Competitor positioning map
   - Feature comparison tables with visual scoring
   - Pricing/value matrix
   - Opportunity gap analysis diagram

Focus specifically on WATI, Zoko, Charles, Yalo, SleekFlow, Oct8ne, Tellephant, and 360dialog, with additional analysis of emerging players and potential market entrants.

## PROMPT 11:

ROLE: Subscription and Pricing Strategist

Your task is to develop a comprehensive subscription model for ShopMe:

1. Design tiered subscription plans:
   - Basic Plan: Feature set, limitations, and pricing strategy
   - Professional Plan: Enhanced capabilities and ROI justification
   - Enterprise Plan: Customization options and white-label possibilities
   
2. Define pricing psychology:
   - Value-based pricing rationale
   - Competitive benchmarking justification
   - Price elasticity analysis by segment
   - Optimal price points with supporting data

3. Create upgrade paths and incentives:
   - Feature gates that drive upgrades
   - Usage-based triggers for plan recommendations
   - Bundle options and add-on strategy
   - Loyalty and long-term commitment discounts

4. Establish success metrics:
   - Conversion rate targets by plan
   - Churn reduction strategies
   - Average revenue per user (ARPU) targets
   - Lifetime value projections by segment

Include detailed ROI calculators for each tier to help prospects evaluate the business case for adopting ShopMe at different levels.

## PROMPT 12:

ROLE: Push Notification System Architect

Your task is to design a comprehensive push notification system for ShopMe:

1. Technical architecture:
   - Notification delivery infrastructure
   - Scheduling and queueing mechanism
   - Fallback systems and redundancy
   - Performance optimization for high volume

2. Notification types and use cases:
   - Order status updates
   - Abandoned cart recovery
   - Personalized offers based on browsing behavior
   - Re-engagement campaigns for inactive users
   - Inventory alerts and price drop notifications

3. Personalization and optimization framework:
   - Segmentation capabilities
   - A/B testing infrastructure
   - Send-time optimization
   - Content personalization rules
   - Frequency capping and anti-spam measures

4. Analytics and reporting:
   - Delivery and open rate tracking
   - Conversion attribution
   - Engagement metrics
   - ROI calculation per notification type

Include examples of notification templates and best practices for different industries (retail, hospitality, restaurants, events) with specific recommendations for each context.

## PROMPT 13:

ROLE: AI Agent Configuration Specialist

Your task is to design the agent configuration system for ShopMe's conversational AI:

1. Configuration interface design:
   - Parameter customization options
   - Template management system
   - Testing and simulation environment
   - Version control and rollback capabilities

2. Customizable AI behavior parameters:
   - Language model selection options
   - Temperature and creativity settings
   - Response length and style controls
   - Industry-specific knowledge base integration
   - Sentiment and tone adjustment

3. Business rules and workflow integration:
   - Conversation flow designer
   - Decision tree implementation
   - Human handoff triggers and conditions
   - Custom function call configuration
   - Integration with product catalog and inventory

4. Performance monitoring and optimization:
   - Accuracy measurement framework
   - Continuous learning implementation
   - Feedback loop processing
   - Automated improvement suggestions

 