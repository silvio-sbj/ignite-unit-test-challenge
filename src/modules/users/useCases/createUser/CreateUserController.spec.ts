import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;
describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User Supertest",
      email: "user@finapi.com.br",
      password: "Password Supertest",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able create a new user with same email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Supertest",
      email: "user@finapi.com.br",
      password: "Password Supertest",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "User Supertest",
      email: "user@finapi.com.br",
      password: "Password Supertest",
    });

    expect(response.status).toBe(400);
  });
});
