import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to authenticate an user", async () => {
    const user = await createUserUseCase.execute({
      email: "jonh@finapi.com",
      name: "John Snow",
      password: "psw",
    });

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: "psw",
    });

    expect(result).toHaveProperty("token");
  });

  it("Should not be able to authenticate an user with incorrect password", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "jonh@finapi.com",
        name: "John Snow",
        password: "psw",
      });

      const result = await authenticateUserUseCase.execute({
        email: user.email,
        password: "psw-incorrect",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
