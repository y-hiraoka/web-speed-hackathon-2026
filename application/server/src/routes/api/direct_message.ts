import { Router } from "express";
import httpErrors from "http-errors";
import { literal, Op } from "sequelize";

import { eventhub } from "@web-speed-hackathon-2026/server/src/eventhub";
import {
  DirectMessage,
  DirectMessageConversation,
  User,
} from "@web-speed-hackathon-2026/server/src/models";

export const directMessageRouter = Router();

directMessageRouter.get("/dm", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  // Load conversations (with initiator/member but without messages)
  // Filter to only those with at least one message via subquery
  const conversations = await DirectMessageConversation.findAll({
    where: {
      [Op.and]: [
        { [Op.or]: [{ initiatorId: req.session.userId }, { memberId: req.session.userId }] },
        literal(
          `(SELECT COUNT(*) FROM DirectMessages WHERE DirectMessages.conversationId = DirectMessageConversation.id) > 0`,
        ),
      ],
    },
  });

  if (conversations.length === 0) {
    return res.status(200).type("application/json").send([]);
  }

  const conversationIds = conversations.map((c) => c.id);

  // Fetch the latest message per conversation
  const latestMessages = await DirectMessage.findAll({
    where: {
      id: {
        [Op.in]: literal(
          `(SELECT dm.id FROM DirectMessages dm INNER JOIN (SELECT conversationId, MAX(createdAt) as maxCreatedAt FROM DirectMessages WHERE conversationId IN (${conversationIds.map((id) => `'${id}'`).join(",")}) GROUP BY conversationId) latest ON dm.conversationId = latest.conversationId AND dm.createdAt = latest.maxCreatedAt)`,
        ),
      },
    },
    include: [{ association: "sender", include: [{ association: "profileImage" }] }],
  });

  // Fetch one unread message per conversation from the peer (to signal unread status)
  const unreadMessages = await DirectMessage.findAll({
    where: {
      id: {
        [Op.in]: literal(
          `(SELECT MIN(dm2.id) FROM DirectMessages dm2 WHERE dm2.conversationId IN (${conversationIds.map((id) => `'${id}'`).join(",")}) AND dm2.senderId != '${req.session.userId}' AND dm2.isRead = 0 GROUP BY dm2.conversationId)`,
        ),
      },
    },
    include: [{ association: "sender", include: [{ association: "profileImage" }] }],
  });

  // Build maps
  const latestMessageMap = new Map<string, (typeof latestMessages)[number]>();
  for (const msg of latestMessages) {
    latestMessageMap.set(msg.conversationId, msg);
  }
  const unreadMap = new Map<string, (typeof unreadMessages)[number]>();
  for (const msg of unreadMessages) {
    unreadMap.set(msg.conversationId, msg);
  }

  // Assemble the response
  const result = conversations
    .map((c) => {
      const latestMsg = latestMessageMap.get(c.id);
      if (!latestMsg) return null;

      const messages: object[] = [];
      const unreadMsg = unreadMap.get(c.id);
      // Add unread message first (if different from latest) so client can detect unread
      if (unreadMsg && unreadMsg.id !== latestMsg.id) {
        messages.push(unreadMsg.toJSON());
      }
      messages.push(latestMsg.toJSON());

      return {
        ...c.toJSON(),
        messages,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const aTime = new Date(a.messages[a.messages.length - 1].createdAt).getTime();
      const bTime = new Date(b.messages[b.messages.length - 1].createdAt).getTime();
      return bTime - aTime;
    });

  return res.status(200).type("application/json").send(result);
});

directMessageRouter.post("/dm", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  const peer = await User.findByPk(req.body?.peerId);
  if (peer === null) {
    throw new httpErrors.NotFound();
  }

  const [conversation] = await DirectMessageConversation.scope("withMessages").findOrCreate({
    where: {
      [Op.or]: [
        { initiatorId: req.session.userId, memberId: peer.id },
        { initiatorId: peer.id, memberId: req.session.userId },
      ],
    },
    defaults: {
      initiatorId: req.session.userId,
      memberId: peer.id,
    },
  });
  await conversation.reload({
    include: [
      { association: "initiator", include: [{ association: "profileImage" }] },
      { association: "member", include: [{ association: "profileImage" }] },
      {
        association: "messages",
        include: [{ association: "sender", include: [{ association: "profileImage" }] }],
        required: false,
      },
    ],
  });

  return res.status(200).type("application/json").send(conversation);
});

directMessageRouter.ws("/dm/unread", async (req, _res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  const handler = (payload: unknown) => {
    req.ws.send(JSON.stringify({ type: "dm:unread", payload }));
  };

  eventhub.on(`dm:unread/${req.session.userId}`, handler);

  // Heartbeat: ping every 30s, terminate if no pong within 10s
  let isAlive = true;
  req.ws.on("pong", () => {
    isAlive = true;
  });
  const pingInterval = setInterval(() => {
    if (!isAlive) {
      req.ws.terminate();
      return;
    }
    isAlive = false;
    req.ws.ping();
  }, 30_000);

  const cleanup = () => {
    clearInterval(pingInterval);
    eventhub.off(`dm:unread/${req.session.userId}`, handler);
  };
  req.ws.on("close", cleanup);
  req.ws.on("error", cleanup);

  const unreadCount = await DirectMessage.count({
    distinct: true,
    where: {
      senderId: { [Op.ne]: req.session.userId },
      isRead: false,
    },
    include: [
      {
        association: "conversation",
        where: {
          [Op.or]: [{ initiatorId: req.session.userId }, { memberId: req.session.userId }],
        },
        required: true,
      },
    ],
  });

  eventhub.emit(`dm:unread/${req.session.userId}`, { unreadCount });
});

directMessageRouter.get("/dm/:conversationId", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  const conversation = await DirectMessageConversation.scope("withMessages").findOne({
    where: {
      id: req.params.conversationId,
      [Op.or]: [{ initiatorId: req.session.userId }, { memberId: req.session.userId }],
    },
  });
  if (conversation === null) {
    throw new httpErrors.NotFound();
  }

  return res.status(200).type("application/json").send(conversation);
});

directMessageRouter.ws("/dm/:conversationId", async (req, _res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  const conversation = await DirectMessageConversation.unscoped().findOne({
    where: {
      id: req.params.conversationId,
      [Op.or]: [{ initiatorId: req.session.userId }, { memberId: req.session.userId }],
    },
  });
  if (conversation == null) {
    throw new httpErrors.NotFound();
  }

  const peerId =
    conversation.initiatorId !== req.session.userId
      ? conversation.initiatorId
      : conversation.memberId;

  const handleMessageUpdated = (payload: unknown) => {
    req.ws.send(JSON.stringify({ type: "dm:conversation:message", payload }));
  };
  eventhub.on(`dm:conversation/${conversation.id}:message`, handleMessageUpdated);

  const handleTyping = (payload: unknown) => {
    req.ws.send(JSON.stringify({ type: "dm:conversation:typing", payload }));
  };
  eventhub.on(`dm:conversation/${conversation.id}:typing/${peerId}`, handleTyping);

  // Heartbeat: ping every 30s, terminate if no pong within 10s
  let isAlive = true;
  req.ws.on("pong", () => {
    isAlive = true;
  });
  const pingInterval = setInterval(() => {
    if (!isAlive) {
      req.ws.terminate();
      return;
    }
    isAlive = false;
    req.ws.ping();
  }, 30_000);

  const cleanup = () => {
    clearInterval(pingInterval);
    eventhub.off(`dm:conversation/${conversation.id}:message`, handleMessageUpdated);
    eventhub.off(`dm:conversation/${conversation.id}:typing/${peerId}`, handleTyping);
  };
  req.ws.on("close", cleanup);
  req.ws.on("error", cleanup);
});

directMessageRouter.post("/dm/:conversationId/messages", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  const body: unknown = req.body?.body;
  if (typeof body !== "string" || body.trim().length === 0) {
    throw new httpErrors.BadRequest();
  }

  const conversation = await DirectMessageConversation.unscoped().findOne({
    where: {
      id: req.params.conversationId,
      [Op.or]: [{ initiatorId: req.session.userId }, { memberId: req.session.userId }],
    },
  });
  if (conversation === null) {
    throw new httpErrors.NotFound();
  }

  const message = await DirectMessage.create({
    body: body.trim(),
    conversationId: conversation.id,
    senderId: req.session.userId,
  });
  await message.reload({
    include: [{ association: "sender", include: [{ association: "profileImage" }] }],
  });

  return res.status(201).type("application/json").send(message);
});

directMessageRouter.post("/dm/:conversationId/read", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  const conversation = await DirectMessageConversation.unscoped().findOne({
    where: {
      id: req.params.conversationId,
      [Op.or]: [{ initiatorId: req.session.userId }, { memberId: req.session.userId }],
    },
  });
  if (conversation === null) {
    throw new httpErrors.NotFound();
  }

  const peerId =
    conversation.initiatorId !== req.session.userId
      ? conversation.initiatorId
      : conversation.memberId;

  const [affectedCount] = await DirectMessage.update(
    { isRead: true },
    {
      where: { conversationId: conversation.id, senderId: peerId, isRead: false },
    },
  );

  if (affectedCount > 0) {
    // Notify once after bulk update instead of per-row via individualHooks
    const unreadCount = await DirectMessage.count({
      where: {
        senderId: { [Op.ne]: req.session.userId },
        isRead: false,
      },
      include: [
        {
          association: "conversation",
          attributes: [],
          where: {
            [Op.or]: [{ initiatorId: req.session.userId }, { memberId: req.session.userId }],
          },
          required: true,
        },
      ],
    });

    eventhub.emit(`dm:unread/${req.session.userId}`, { unreadCount });
  }

  return res.status(200).type("application/json").send({});
});

directMessageRouter.post("/dm/:conversationId/typing", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  const conversation = await DirectMessageConversation.unscoped().findByPk(
    req.params.conversationId,
  );
  if (conversation === null) {
    throw new httpErrors.NotFound();
  }

  eventhub.emit(`dm:conversation/${conversation.id}:typing/${req.session.userId}`, {});

  return res.status(200).type("application/json").send({});
});
