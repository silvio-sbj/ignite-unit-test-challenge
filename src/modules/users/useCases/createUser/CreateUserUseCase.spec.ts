import { hash } from "bcryptjs";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create User", () => {
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able a new user", async () => {
    const passwordHash = await hash("psw", 8);

    const user = await createUserUseCase.execute({
      email: "jonh@finapi.com",
      name: "John Snow",
      password: passwordHash,
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able a new user with same email", async () => {
    expect(async () => {
      const passwordHash = await hash("psw", 8);

      const user = {
        email: "jonh@finapi.com",
        name: "John Snow",
        password: passwordHash,
      };

      await createUserUseCase.execute({
        email: user.email,
        name: user.name,
        password: user.password,
      });

      await createUserUseCase.execute({
        email: user.email,
        name: user.name,
        password: user.password,
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
