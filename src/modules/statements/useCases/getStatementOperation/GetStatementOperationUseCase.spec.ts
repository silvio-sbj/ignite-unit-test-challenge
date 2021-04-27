import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able get statement operation", async () => {
    //1 Create user --
    const user = await createUserUseCase.execute({
      email: "jonh@finapi.com",
      name: "John Snow",
      password: "psw",
    });

    //2 Deposit --
    const statementOp = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "deposit" as OperationType,
      amount: 1000,
      description: "Credit" as string,
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statementOp.id as string,
    });

    expect(result).toHaveProperty("id");
    expect(result.amount).toBe(1000);
  });

  it("should not be able get statement operation of an non-existent user", async () => {
    expect(async () => {
      //1 Create user --
      const user = await createUserUseCase.execute({
        email: "jonh@finapi.com",
        name: "John Snow",
        password: "psw",
      });

      //2 Deposit --
      const statement = await createStatementUseCase.execute({
        user_id: user.id as string,
        type: "deposit" as OperationType,
        amount: 1000,
        description: "Credit",
      });

      const result = await getStatementOperationUseCase.execute({
        user_id: "user_id does not exist",
        statement_id: statement.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement operation do not stored", async () => {
    expect(async () => {
      //1 Create user --
      const user = await createUserUseCase.execute({
        email: "jonh@finapi.com",
        name: "John Snow",
        password: "psw",
      });

      const result = await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "statement_id does not exist",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
