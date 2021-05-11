import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import { User } from "../../../users/entities/User";
import { Statement } from "../../entities/Statement";
import { DoTransferenceError } from "./DoTransferenceError";

let connection: Connection;

const user1 = {
  id: "",
  name: "Jon Snow",
  email: "jon.snow@huap.fi",
  password: "123",
};

const user2 = {
  id: "",
  name: "Daenerys Targaryen",
  email: "daenerys.targaryen@zehi.tv",
  password: "123",
};

interface IResponseToken {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface IBalanceResult {
  statement: Statement[];
  balance: number;
}

let responseToken: IResponseToken;

describe("DoTransferenceController", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(user1);
    await request(app).post("/api/v1/users").send(user2);

    const response = await request(app).post("/api/v1/sessions").send({
      email: user1.email,
      password: user1.password,
    });

    responseToken = response.body;

    const { token } = responseToken;

    const resultProfile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = resultProfile.body as User;

    user1.id = id as string;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to do a transference between two users", async () => {
    const { token: token1 } = responseToken;
    const amount = 25;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount,
        description: "Funds",
      })
      .set({
        Authorization: `Bearer ${token1}`,
      });

    const resultToken = await request(app).post("/api/v1/sessions").send({
      email: user2.email,
      password: user2.password,
    });

    const { token: token2 } = resultToken.body as IResponseToken;

    const resultProfile = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token2}`,
      });

    const { id } = resultProfile.body as User;
    user2.id = id as string;

    await request(app)
      .post(`/api/v1/statements/transfers/${user2.id}`)
      .send({
        amount,
        description: "Test",
      })
      .set({
        Authorization: `Bearer ${token1}`,
      });

    const statementResult = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token2}`,
      });

    const { balance, statement } = statementResult.body as IBalanceResult;
    expect(balance).toBe(amount);
    expect(statement).toHaveLength(1);
  });

  it("should not be able to do a transference with insufficient funds", async () => {
    const { token } = responseToken;
    const amount = 5000;

    const result = await request(app)
      .post(`/api/v1/statements/transfers/${user2.id}`)
      .send({
        amount,
        description: "Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const error = new DoTransferenceError.InsufficientFunds();

    expect(result.status).toEqual(error.statusCode);
    expect(result.body).toHaveProperty("message");
    expect(result.body.message).toEqual(error.message);
  });

  it("should not be able to do a transference to the same user", async () => {
    const { token } = responseToken;
    const amount = 25;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount,
        description: "Funds",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const result = await request(app)
      .post(`/api/v1/statements/transfers/${user1.id}`)
      .send({
        amount,
        description: "Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const error = new DoTransferenceError.SenderEqualsToReceiver();

    expect(result.status).toEqual(error.statusCode);
    expect(result.body).toHaveProperty("message");
    expect(result.body.message).toEqual(error.message);
  });
});
