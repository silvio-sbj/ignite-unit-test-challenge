import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { DoTransferenceError } from "./DoTransferenceError";
import { DoTransferenceUseCase } from "./DoTransferenceUseCase";

let doTransferenceUseCase: DoTransferenceUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;

describe("DoTransferenceUseCase", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    doTransferenceUseCase = new DoTransferenceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("should be able to do a transference between two users", async () => {
    const user1 = await usersRepository.create({
      name: "Jon Snow",
      email: "jon.snow@huap.fi",
      password: "123",
    });

    const user2 = await usersRepository.create({
      name: "Daenerys Targaryen",
      email: "daenerys.targaryen@zehi.tv",
      password: "123",
    });

    await statementsRepository.create({
      amount: 25,
      description: "Funds",
      type: OperationType.DEPOSIT,
      user_id: user1.id as string,
    });

    await doTransferenceUseCase.execute({
      amount: 25,
      description: "Test",
      sender_id: user1.id as string,
      receiver_id: user2.id as string,
    });

    const { balance } = await statementsRepository.getUserBalance({
      user_id: user2.id as string,
      with_statement: false,
    });

    expect(balance).toBe(25);
  });

  it("should not be able to do a transference with insufficient funds", async () => {
    const user1 = await usersRepository.create({
      name: "Arya Stark",
      email: "arya.stark@dafofis.mh",
      password: "123",
    });

    const user2 = await usersRepository.create({
      name: "Sansa Stark",
      email: "sansa.stark@dag.ly",
      password: "123",
    });

    await statementsRepository.create({
      amount: 10,
      description: "Funds",
      type: OperationType.DEPOSIT,
      user_id: user1.id as string,
    });

    await expect(
      doTransferenceUseCase.execute({
        amount: 15,
        description: "Test",
        sender_id: user1.id as string,
        receiver_id: user2.id as string,
      })
    ).rejects.toBeInstanceOf(DoTransferenceError.InsufficientFunds);
  });

  it("should not be able to do a transference to the same user", async () => {
    const user1 = await usersRepository.create({
      name: "Tyrion Lannister",
      email: "tyrion.lannister@vub.az",
      password: "123",
    });

    await statementsRepository.create({
      amount: 10,
      description: "Funds",
      type: OperationType.DEPOSIT,
      user_id: user1.id as string,
    });

    await expect(
      doTransferenceUseCase.execute({
        amount: 10,
        description: "Test",
        sender_id: user1.id as string,
        receiver_id: user1.id as string,
      })
    ).rejects.toBeInstanceOf(DoTransferenceError.SenderEqualsToReceiver);
  });
});
