export class ValidationError extends Error {
  constructor(readonly fieldErrors: Record<string, string[] | undefined>) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export class InvalidJsonError extends Error {
  constructor() {
    super("Request body must be valid JSON");
    this.name = "InvalidJsonError";
  }
}