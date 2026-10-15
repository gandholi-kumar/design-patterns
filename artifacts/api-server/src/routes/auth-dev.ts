import express, { Router } from "express";
import crypto from "node:crypto";
import { db, eq, and } from "@workspace/db";
import { usersTable, accountsTable, sessionsTable } from "@workspace/db/schema";
import { logger } from "../lib/logger";

const router = Router();
router.use(express.json());

router.post("/dev-google-login", async (req, res) => {
  try {
    const email = (req.body.email || "gandholi.kumar@gmail.com").trim().toLowerCase();
    const name = (req.body.name || "Gandholi Kumar").trim();
    const persona = req.body.persona || "architect";

    logger.info({ email, name, persona }, "Processing Dev Google Login");

    // 1. Find or create user
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      const userId = `usr_goog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const [createdUser] = await db
        .insert(usersTable)
        .values({
          id: userId,
          name,
          email,
          emailVerified: true,
          image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          role: "member",
          persona,
        })
        .returning();
      user = createdUser;
    }

    // 2. Link account
    const [existingAccount] = await db
      .select()
      .from(accountsTable)
      .where(
        and(
          eq(accountsTable.userId, user.id),
          eq(accountsTable.providerId, "google")
        )
      )
      .limit(1);

    if (!existingAccount) {
      await db.insert(accountsTable).values({
        id: `acc_goog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: user.id,
        accountId: `google_${email}`,
        providerId: "google",
        accessToken: "dev-mock-google-access-token",
      });
    }

    // 3. Create active session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 days

    await db.insert(sessionsTable).values({
      id: sessionId,
      userId: user.id,
      token: sessionToken,
      expiresAt,
      ipAddress: req.ip,
      userAgent: (req.headers["user-agent"] as string) || "Mozilla/5.0",
    });

    // 4. Set Better Auth signed session cookie (Better Auth requires HMAC-SHA256 signature)
    const secret = process.env.BETTER_AUTH_SECRET || "gof_masterclass_dev_secret_key_32_chars_long_2026";
    const hmac = crypto.createHmac("sha256", secret).update(sessionToken).digest("base64");
    const signedSessionToken = `${sessionToken}.${hmac}`;

    res.cookie("better-auth.session_token", signedSessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
      secure: false,
    });

    return res.status(200).json({
      success: true,
      user,
      token: sessionToken,
    });
  } catch (err: unknown) {
    logger.error({ err }, "Error in Dev Google Login");
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Internal Server Error",
    });
  }
});

export default router;
