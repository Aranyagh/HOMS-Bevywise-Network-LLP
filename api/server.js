import fastify from "fastify";
import os from "os";
import fastifyJwt from "@fastify/jwt";
import { PrismaClient } from "@prisma/client";
import cors from "@fastify/cors";

const prisma = new PrismaClient();

const server = fastify({ logger: true });
const CURRENT_API_PREFIX = "/api/v1";

server.register(cors, {
    origin: [],
});

server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
});

server.get("/health", async (request, reply) => {
    let dbStatus = "unknown";
    let dbDetails = {};

    try {
        // Trying a simple query to check the database health
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = "ok";

        // A simple non-sensitive query to retrieve some database details.
        const result = await prisma.$queryRaw`SELECT version();`;
        dbDetails.version = result[0].version;
    } catch (error) {
        console.error("Database Health Check Error:", error);
        dbStatus = "unhealthy";
    }

    return {
        status: "ok",
        timestamp: new Date().toISOString(),
        serverDetails: {
            serverTime: new Date().toISOString(),
            serverName: os.hostname(),
            serverPlatform: os.platform(),
            serverUptime: os.uptime(),
            serverCpuUsage: os.loadavg(),
        },
        database: {
            status: dbStatus,
            details: dbDetails,
        },
    };
});

server.keepAliveTimeout = 600000;
const start = async () => {
    try {
        await server.listen({ port: 3000, host: "0.0.0.0" });
        server.log.info(`server listening on ${server.server.address().port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
