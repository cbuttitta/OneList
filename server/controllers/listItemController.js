import { ListRepository } from "../repositories/listRepository.js";
import { ListItemRepository } from "../repositories/listItemRepository.js";

const listRepo = new ListRepository();
const itemRepo = new ListItemRepository();

async function ownslist(userId, listId) {
  const list = await listRepo.findById(listId);
  return list && list.user_id === userId;
}

export async function getAll(req, res) {
  if (!(await ownslist(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const items = await itemRepo.findAllByList(req.params.id);
  res.json(items);
}

export async function create(req, res) {
  if (!(await ownslist(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const { title, description, status, due_date } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });
  const item = await itemRepo.create({ listId: req.params.id, title, description, status, due_date });
  res.status(201).json(item);
}

export async function update(req, res) {
  if (!(await ownslist(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const item = await itemRepo.update(req.params.itemId, req.params.id, req.body);
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
}

export async function remove(req, res) {
  if (!(await ownslist(req.user.id, req.params.id))) {
    return res.status(404).json({ message: "Not found" });
  }
  const deleted = await itemRepo.delete(req.params.itemId, req.params.id);
  if (!deleted) return res.status(404).json({ message: "Item not found" });
  res.status(204).end();
}
