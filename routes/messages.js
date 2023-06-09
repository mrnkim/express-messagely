"use strict";

const Router = require("express").Router;
const router = new Router();

const {
  ensureLoggedIn,
  ensureCorrectToandFromUser,
  ensureCorrectRecipient
} = require("../middleware/auth");

const Message = require("../models/message");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureCorrectToandFromUser, async function (req, res, next) {
  const message = await Message.get(req.params.id);
  return res.json({ message });
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
  const { to_username, body } = req.body;
  const from_username = res.locals.user.username;

  const message = await Message.create({ from_username, to_username, body });

  return res.json({ message });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureCorrectRecipient, async function (req, res, next) {
  await Message.markRead(req.params.id);
  const message = await Message.get(req.params.id);
  return res.json({ message });
});

module.exports = router;
