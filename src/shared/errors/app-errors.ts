export class ValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string[] | undefined>) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}