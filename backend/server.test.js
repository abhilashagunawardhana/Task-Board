const request = require("supertest");
const app = require("./server");

describe("Tasks API", () => {
  it("GET /api/tasks should return all tasks with 200 OK", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("title");
    expect(res.body[0]).toHaveProperty("status");
  });

  it("POST /api/tasks should create a new task and return 201 Created", async () => {
    const newTask = { title: "Test Integration CI", status: "Todo" };
    const res = await request(app)
      .post("/api/tasks")
      .send(newTask);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toEqual(newTask.title);
    expect(res.body.status).toEqual(newTask.status);
  });

  it("POST /api/tasks without a title should return 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ status: "Todo" });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error");
  });
});
