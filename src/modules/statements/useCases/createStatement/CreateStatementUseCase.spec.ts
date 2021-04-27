import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able deposit for an user account", async () => {
    //1 Create user --
    const user = await createUserUseCase.execute({
      email: "jonh@finapi.com",
      name: "John Snow",
      password: "psw",
    });

    //2 Deposit --
    const result = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "deposit" as OperationType,
      amount: 1000,
      description: "Credit" as string,
    });

    expect(result).toHaveProperty("id");
    expect(result.amount).toBe(1000);
  });

  it("should be able withdraw for an user account", async () => {
    //1 Create user --
    const user = await createUserUseCase.execute({
      email: "jonh@finapi.com",
      name: "John Snow",
      password: "psw",
    });

    //2 Deposit --
    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "deposit" as OperationType,
      amount: 1000,
      description: "Credit",
    });

    //3 Withdraw --
    const result = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "Debit",
    });

    expect(result).toHaveProperty("id");
    expect(result.amount).toBe(100);
  });

  it("should not be able any statement operation of an non-existent user", async () => {
    expect(async () => {
      //1 Withdraw --
      const result = await createStatementUseCase.execute({
        user_id: "user_id does not exist",
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Debit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to get withdraw for insufficient funds of an user account", async () => {
    expect(async () => {
      //1 Create user --
      const user = await createUserUseCase.execute({
        email: "jonh@finapi.com",
        name: "John Snow",
        password: "psw",
      });

      //2 Withdraw --
      const result = await createStatementUseCase.execute({
        user_id: user.id as string,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Debit" as string,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
