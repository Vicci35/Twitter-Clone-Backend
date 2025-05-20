import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("GET /profile/:id", () => {
  it("ska returnera en användarprofil", async () => {
    const newUser = new User({
      email: "profiltest@test.com",
      password: "hashedpassword",
      name: "Profil Testare",
      nickname: "profilen"
    });

    await newUser.save();

    const res = await request(app).get(`/api/profile/${newUser._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("profiltest@test.com");
    expect(res.body.name).toBe("Profil Testare");
    expect(res.body).not.toHaveProperty("password");
  });

  it("ska returnera 404 om användaren inte finns", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/profile/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});