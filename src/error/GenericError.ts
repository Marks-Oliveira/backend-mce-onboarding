import { BaseError } from "./base/BaseError";

export class GenericError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  };
};
