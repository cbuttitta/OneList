import { UserRepository } from "../repositories/userRepository.js";

export class UserService {
  constructor() { this.userRepo = new UserRepository(); }
  getUserByEmail(email) { return this.userRepo.findByEmail(email); }
}