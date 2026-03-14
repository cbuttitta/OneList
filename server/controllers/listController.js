import bcrypt from "bcrypt";
import { ListRepository } from "../repositories/listRepository.js";
import { ListItemRepository } from "../repositories/listItemRepository.js";

const listRepo = new ListRepository();
const itemRepo = new ListItemRepository();

export async function getAll(req, res) {
  const lists = await listRepo.findAllByUser(req.user.id);
  res.json(lists);
}

export async function create(req, res) {
  const { name, description, is_private, passcode } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });
  const passcode_hash = passcode ? await bcrypt.hash(passcode, 12) : null;
  const list = await listRepo.create({ userId: req.user.id, name, description, is_private: !!is_private, passcode_hash });
  res.status(201).json(list);
}

export async function getOne(req, res) {
  const list = await listRepo.findById(req.params.id);
  if (!list || list.user_id !== req.user.id) {
    return res.status(404).json({ message: "Not found" });
  }
  const items = await itemRepo.findAllByList(list.id);
  res.json({ ...list, items });
}

export async function update(req, res) {
  const { name, is_private, passcode } = req.body;
  // passcode=null means remove passcode, passcode=string means set new one, passcode=undefined means don't change
  let passcode_hash;
  if (passcode === null) {
    passcode_hash = null;
  } else if (passcode) {
    passcode_hash = await bcrypt.hash(passcode, 12);
  }
  const list = await listRepo.update(req.params.id, req.user.id, { name, is_private, passcode_hash });
  if (!list) return res.status(404).json({ message: "Not found" });
  res.json(list);
}

export async function remove(req, res) {
  const deleted = await listRepo.delete(req.params.id, req.user.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.status(204).end();
}

export async function getByShareToken(req, res) {
  const list = await listRepo.findByShareToken(req.params.token);
  if (!list) return res.status(404).json({ message: "Not found" });

  if (list.is_private) {
    return res.json({ requiresPasscode: true, name: list.name });
  }

  const items = await itemRepo.findAllByList(list.id);
  res.json({ ...list, items });
}

export async function verifyPasscode(req, res) {
  const list = await listRepo.findByShareToken(req.params.token);
  if (!list) return res.status(404).json({ message: "Not found" });
  if (!list.is_private || !list.passcode_hash) {
    return res.status(400).json({ message: "List is not passcode protected" });
  }

  const match = await bcrypt.compare(req.body.passcode, list.passcode_hash);
  if (!match) return res.status(401).json({ message: "Wrong passcode" });

  const items = await itemRepo.findAllByList(list.id);
  res.json({ ...list, items });
}
