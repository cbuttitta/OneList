import { ListRepository } from "../repositories/listRepository.js";
import { ListItemRepository } from "../repositories/listItemRepository.js";

const listRepo = new ListRepository();
const itemRepo = new ListItemRepository();

async function ownsList(userId, listId) {
  const list = await listRepo.findById(listId);
  return list && list.user_id === userId;
}

export async function getAll(req, res) {
  if (!(await ownsList(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const items = await itemRepo.findAllByList(req.params.id);
  res.json(items);
}

export async function create(req, res) {
  if (!(await ownsList(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const { title, description, status, image_data, buy_link, price, priority, quantity } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });
  const item = await itemRepo.create({ listId: req.params.id, title, description, status, image_data, buy_link, price, priority, quantity });
  res.status(201).json(item);
}

export async function update(req, res) {
  if (!(await ownsList(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const item = await itemRepo.update(req.params.itemId, req.params.id, req.body);
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
}

export async function editItem(req, res) {
  if (!(await ownsList(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const { title, description, image_data, buy_link, price, priority, quantity } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });
  const item = await itemRepo.edit(req.params.itemId, req.params.id, { title, description, image_data, buy_link, price, priority, quantity });
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
}

export async function reorder(req, res) {
  if (!(await ownsList(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const { direction } = req.body;
  if (!["up", "down"].includes(direction)) {
    return res.status(400).json({ message: "direction must be up or down" });
  }
  const items = await itemRepo.reorder(req.params.itemId, req.params.id, direction);
  if (!items) return res.status(400).json({ message: "Cannot move item in that direction" });
  res.json(items);
}

export async function remove(req, res) {
  if (!(await ownsList(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const deleted = await itemRepo.delete(req.params.itemId, req.params.id);
  if (!deleted) return res.status(404).json({ message: "Item not found" });
  res.status(204).end();
}
