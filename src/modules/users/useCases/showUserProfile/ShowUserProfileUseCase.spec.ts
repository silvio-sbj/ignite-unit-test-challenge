import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able return user profile", async () => {
    const user = await createUserUseCase.execute({
      email: "jonh@finapi.com",
      name: "John Snow",
      password: "psw",
    });

    const result = await showUserProfileUseCase.execute(user.id as string);

    expect(result).toHaveProperty("id");
  });

  it("should not be able to return the profile of a non-existent user", async () => {
    expect(async () => {
      const result = await showUserProfileUseCase.execute(
        "user_id does not exist"
      );
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
