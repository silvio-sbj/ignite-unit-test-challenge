import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

let connection: Connection;
describe("Get Statement Operation Controller", () => {
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

  it("should be able show a statement detail", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    let { token } = responseToken.body;

    const statement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Credit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id: statement_id } = statement.body;

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(statement_id);
  });

  it("should not be able to show a non-existent statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    let { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should not be able to show a statement from a unauthorized user", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${uuidV4()}`)
      .send()
      .set({
        Authorization: "",
      });

    expect(response.status).toBe(401);
  });
});
