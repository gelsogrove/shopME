export class WorkspaceName {
  private constructor(private readonly value: string) {}

  public static create(name: string): WorkspaceName {
    const trimmedName = name.trim()

    if (!trimmedName) {
      throw new Error("Workspace name cannot be empty")
    }

    if (trimmedName.length > 100) {
      throw new Error("Workspace name cannot be longer than 100 characters")
    }

    return new WorkspaceName(trimmedName)
  }

  public getValue(): string {
    return this.value
  }

  public equals(other: WorkspaceName): boolean {
    return this.value === other.value
  }
}
