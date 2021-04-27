import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able get balance from user", async () => {
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
      description: "Credit" as string,
    });

    //3 Withdraw --
    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "Debit" as string,
    });

    //4 Get Balance --
    const result = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(result.balance).toBe(900);
  });

  it("should not be able to get balance of a non-existent user", async () => {
    expect(async () => {
      const result = await getBalanceUseCase.execute({
        user_id: "user_id does not exist",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
