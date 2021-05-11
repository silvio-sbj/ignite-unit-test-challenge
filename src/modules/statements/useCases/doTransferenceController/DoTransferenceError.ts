import { AppError } from "../../../../shared/errors/AppError";

export namespace DoTransferenceError {
  export class ReceiverNotFound extends AppError {
    constructor() {
      super("User receiver not found", 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds");
    }
  }

  export class SenderEqualsToReceiver extends AppError {
    constructor() {
      super("Operation invalid");
    }
  }
}
