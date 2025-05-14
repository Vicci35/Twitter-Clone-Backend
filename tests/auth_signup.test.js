import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
    await User.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
}); 

describe("POST /signup", () => {
    it("skapa en ny användare med korrekt data", async () => {
        const userData = {
            email: "test123@test.com",
            password: "password123",
            name: "Test User",
            nickname: "testare"
        };

         const res = await request(app)
            .post("/api/signup")
            .set("Content-type", "application/json")
            .send(userData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("userID");

        const user = await User.findOne({email: "test123@test.com"});
        expect(user).not.toBeNull();
        expect(user.nickname).toBe("testare");
        expect(user.name).toBe("Test User")
    });

    it("ska returnera fel vid ogiltig data", async () => {
        const res = await request(app)
        .post("/api/signup")
        .send({email: "ogiltig", password:"" });

        expect(res.statusCode).toBe(400);
    });
});