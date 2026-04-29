import { UserModel } from '../models/user.model';

export class UserRepository {
  async findByEmail(_email: string): Promise<UserModel | null> {
    return null;
  }
}
