import express from "express";
import db, { manifest, quests, regroupImageDataset } from "./database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { secret } from "./config";
import { assertIsError } from "./utils";

const router = express.Router();

router.post("/user/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existed = await db<UserRecord>("users")
      .select("id")
      .where({ username });

    if (existed && existed.length) throw new Error(`${username} existed!`);

    var hashedPassword = bcrypt.hashSync(password, 8);
    const user = await db<UserRecord>("users").insert({
      username,
      password: hashedPassword,
    });
    var token = jwt.sign({ id: user[0] }, secret, {
      expiresIn: 86400, // expires in 24 hours
    });
    res.status(200).send({ auth: true, token: token });
  } catch (e) {
    assertIsError(e);
    console.error(e);
    res.status(400).send({ auth: false, error: e.message });
  }
});

router.post("/user/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db<UserRecord>("users")
      .select("password", "id")
      .where({ username });

    if (!user || !user.length) throw new Error(`${username} not existed!`);

    if (!bcrypt.compareSync(password, user[0].password))
      throw new Error("password not match");

    var token = jwt.sign({ id: user[0].id }, secret, {
      expiresIn: 86400, // expires in 24 hours
    });
    res.status(200).send({ auth: true, token: token });
  } catch (e) {
    assertIsError(e);
    console.error(e);
    res.status(400).send({ auth: false, error: e.message });
  }
});

router.get("/user/me", async (req, res) => {
  try {
    const { token } = req;
    if (!token) throw new Error("no token provide");
    const detoken = jwt.verify(token, secret) as any;
    // const { username, password } = req.body;
    const user = await db<UserRecord>("users")
      .select("id", "username")
      .where({ id: detoken.id });

    if (!user || !user.length) throw new Error(`token is f**ked up!`);

    res.status(200).send({ auth: true, user: user[0] });
  } catch (e) {
    assertIsError(e);
    console.error(e);
    res.status(400).send({ auth: false, error: e.message });
  }
});

router.get("/manifest", async (_req, res) => {
  res.status(200).json(manifest);
});

router.get("/quest/all", async (req, res) => {
  try {
    const questRecords = await db<QuestRecord>("quests").select("*");

    res.status(200).json(questRecords);
  } catch (e) {
    assertIsError(e);
    res.status(400).send({ error: e.message });
  }
});

router.post("/quest/list", async (req, res) => {
  try {
    if (!req.token) throw new Error("token invalid");
    const detoken = jwt.verify(req.token, secret) as any;

    let quests = req.body.quests as QuestAnswerItem[];
    for (let { qid, uuid, answer } of quests) {
      const tmp = manifest.find((item) => item.data.id === uuid);
      if (!tmp) continue;
      const questRecords = await db<QuestRecord>("quests")
        .select("id")
        .where({ uuid, uid: detoken.id, qid });
      if (questRecords.length > 0) continue;
      await db<QuestRecord>("quests").insert({
        uuid,
        qid,
        uid: detoken.id,
        group: tmp.data.group,
        answer: answer ? "1" : "0",
      });
    }
    res.status(200).send({ stat: 0, message: "done!" });
  } catch (e) {
    assertIsError(e);
    res.status(400).send({ error: e.message });
  }
});

router.get("/quest/next/:group/:cnt", async (req, res) => {
  try {
    let { cnt, group } = req.params;
    try {
      parseInt(cnt);
    } catch {
      throw new Error(`cnt ${cnt} failed to  parse int`);
    }
    if (!regroupImageDataset[group])
      throw new Error(`group ${group} not existed`);
    const imgs = regroupImageDataset[group];
    const nextQuests: QuestItem[] = [];

    for (const quest of quests.sort(() => (Math.random() > 0.5 ? -1 : 1))) {
      for (const img of imgs.sort(() => (Math.random() > 0.5 ? -1 : 1))) {
        const questRecords = await db<QuestRecord>("quests")
          .select("answer", "qid")
          .where({ uuid: img.id });

        const rec = questRecords.find((item) => item.qid === quest.id);
        if (rec && rec.answer) continue;
        if (nextQuests.length >= parseInt(cnt)) continue;
        nextQuests.push({
          qid: quest.id,
          uuid: img.id,
          quest: quest.question,
          image: img.image,
        });
      }
    }

    res.status(200).send(nextQuests.sort(() => (Math.random() > 0.5 ? -1 : 1)));
  } catch (e) {
    assertIsError(e);
    res.status(400).send({ auth: false, error: e.message });
  }
});

router.get("/dataset/group", async (req, res) => {
  try {
    if (!req.token) throw new Error("token invalid");
    const group: QuestGroupProcessItem[] = [];

    Object.keys(regroupImageDataset).forEach((gp) => {
      group.push({
        name: gp,
        cnt: regroupImageDataset[gp].length * quests.length,
        rest: regroupImageDataset[gp].length * quests.length,
      });
    });

    for (const gp of group) {
      const row = await db<QuestRecord>("quests")
        .select("group", "answer")
        .where("group", gp.name);

      gp.rest -= row.length;
    }

    res.status(200).send(group);
  } catch (e) {
    assertIsError(e);
    res.status(400).send({ error: e.message });
  }
});

export default router;
