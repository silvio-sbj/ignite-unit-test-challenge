import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;
describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO users (id, name, email, password, created_at)
             VALUES('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate an user with incorrect email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user_incorrect@finapi.com.br",
      password: "admin",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate an user with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "psw-incorrect",
    });

    expect(response.status).toBe(401);
  });
});
