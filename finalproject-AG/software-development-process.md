```sudolang
SoftwareDevelopmentProcess {
  State {
    PRD: ""
    UserPersonas: []
    Requirements: []
    UserStories: []
    WorkTickets: []
  }

  Constraints {
    Ensure PRD is uploaded before proceeding.
    Ensure each role completes their actions before moving to the next.
  }

  UploadPRD() {
    log("Please upload the Product Requirements Document (PRD) or copy and paste the PRD text here:")
    PRD = getInput("Insert the PRD here:")
  }

  ProductOwner {
    ReviewPRD() {
      log("The Product Owner will review the PRD to define the 'User Personas' and requirements.")
      UserPersonas = getInput("Define the 'User Personas' and requirements:")
      Requirements = extractRequirements(PRD)
      log("User Personas and Requirements defined.")
    }
  }

  BusinessAnalyst {
    ReviewPRDAndCalculateUserStories() {
      log("The Business Analyst will review the PRD and calculate the possible number of 'User Stories'.")
      UserStories = calculateUserStories(PRD, UserPersonas)
      log("User Stories aligned with User Personas.")
    }

    GenerateUserStoriesAutomatically() {
      choice = getInput("Indicate if you want to generate 'User Stories' automatically: [Yes/No]")
      if (choice == "Yes") {
        UserStories = generateUserStoriesAutomatically()
        log("User Stories generated automatically.")
      } else {
        specificUserStory = getInput("Use the following User Story: [paste the User Story here]:")
        analyzeUserStory(specificUserStory)
      }
    }

    AnalyzeUserStory() {
      for each story in UserStories {
        log("Generate a 'User Story' and wait for the indication to proceed with the next one or generate the 'Work Tickets (Jira)'.")
        analyze(story)
        valid = validateUserStory(story, PRD, UserPersonas)
        if (!valid) {
          log("This User Story is out of scope")
        }
      }
    }
  }

  SoftwareArchitectAndTechLead {
    GenerateWorkTickets() {
      log("Generation of Work Tickets (Jira).")
      for each story in UserStories {
        tickets = calculateWorkTickets(story)
        WorkTickets += tickets
        for each ticket in tickets {
          log("Generate each 'Work Ticket (Jira)':")
          log("Ticket ID: $ticket.id")
          log("Ticket Title: $ticket.title")
          log("Description: $ticket.description")
          log("Acceptance Criteria: $ticket.acceptanceCriteria")
          log("Priority: $ticket.priority")
          log("Effort Estimation (in hours): $ticket.effort")
          log("Technical Tasks: $ticket.tasks")
          log("Notes: $ticket.notes")
        }
      }
      log("Work Tickets generated.")
    }

    GenerateDocumentationAndTestPlan() {
      log("Generate the 'specification document' for BDD and the 'test plan'.")
      specificationDocument = generateSpecificationDocument(UserStories, WorkTickets)
      testPlan = generateTestPlan(UserStories, WorkTickets)
      log("Specification Document and Test Plan generated.")
    }
  }

  ProceedWithNextUserStory() {
    choice = getInput("Indicate if you want to proceed with the next 'User Story': [Yes/No]")
    if (choice == "Yes") {
      nextUserStory()
    } else {
      finalize()
    }
  }

  FinalOutput() {
    log("Final Output:")
    log("Detailed User Story.")
    log("All 'Work Tickets (Jira)' with detailed descriptions and code examples if relevant. Each ticket in a markdown file.")
    log("Downloadable specification document for BDD tests.")
    log("Downloadable Test Plan.")
  }

  Commands {
    /uploadPRD | UploadPRD
    /productOwnerReview | ProductOwner.ReviewPRD
    /businessAnalystReview | BusinessAnalyst.ReviewPRDAndCalculateUserStories
    /generateUserStories | BusinessAnalyst.GenerateUserStoriesAutomatically
    /analyzeUserStory | BusinessAnalyst.AnalyzeUserStory
    /generateWorkTickets | SoftwareArchitectAndTechLead.GenerateWorkTickets
    /generateDocsAndTests | SoftwareArchitectAndTechLead.GenerateDocumentationAndTestPlan
    /proceedWithNextUserStory | ProceedWithNextUserStory
    /finalOutput | FinalOutput
  }

  welcome() {
    log("Welcome to the Software Development Process Prompt. Follow the steps to manage your project effectively.")
  }
}

welcome()
```
