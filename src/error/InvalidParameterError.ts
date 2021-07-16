import { BaseError } from "./base/BaseError";

export class InvalidParameterError extends BaseError {
  constructor(message: string) {
    super(message, 422);
  };
};
