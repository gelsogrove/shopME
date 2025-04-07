export class WorkspaceName {
  constructor(private readonly value: string) {
    this.validate()
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error("Workspace name cannot be empty")
    }

    if (this.value.length > 100) {
      throw new Error("Workspace name cannot be longer than 100 characters")
    }

    // Potremmo aggiungere altre regole di validazione qui
    // Per esempio, caratteri permessi, formato, etc.
  }

  getValue(): string {
    return this.value
  }

  equals(other: WorkspaceName): boolean {
    return this.value === other.value
  }

  static create(name: string): WorkspaceName {
    return new WorkspaceName(name.trim())
  }
}
