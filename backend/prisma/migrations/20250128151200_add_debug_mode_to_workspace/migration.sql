-- AddDebugModeToWorkspace
ALTER TABLE "workspaces" ADD COLUMN "debugMode" BOOLEAN NOT NULL DEFAULT true;