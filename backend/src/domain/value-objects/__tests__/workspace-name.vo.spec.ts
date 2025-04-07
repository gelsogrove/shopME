import { WorkspaceName } from "../workspace-name.vo"

describe("WorkspaceName", () => {
  it("should create a valid workspace name", () => {
    const name = "Test Workspace"
    const workspaceName = WorkspaceName.create(name)
    expect(workspaceName.getValue()).toBe(name)
  })

  it("should trim workspace name", () => {
    const name = "  Test Workspace  "
    const workspaceName = WorkspaceName.create(name)
    expect(workspaceName.getValue()).toBe("Test Workspace")
  })

  it("should throw error for empty name", () => {
    expect(() => WorkspaceName.create("")).toThrow(
      "Workspace name cannot be empty"
    )
    expect(() => WorkspaceName.create("   ")).toThrow(
      "Workspace name cannot be empty"
    )
  })

  it("should throw error for name longer than 100 characters", () => {
    const longName = "a".repeat(101)
    expect(() => WorkspaceName.create(longName)).toThrow(
      "Workspace name cannot be longer than 100 characters"
    )
  })

  it("should correctly compare two workspace names", () => {
    const name1 = WorkspaceName.create("Test Workspace")
    const name2 = WorkspaceName.create("Test Workspace")
    const name3 = WorkspaceName.create("Different Workspace")

    expect(name1.equals(name2)).toBe(true)
    expect(name1.equals(name3)).toBe(false)
  })
})
