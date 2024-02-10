import AppError from "@src/config/app-error";
import { User } from "@src/domain/user/user";

class UserService {
    async createUser(userData: any): Promise<any> {
        const user = new User(userData);
        await user.save();
        if (!user) {
            throw new AppError(404, "사용자를 찾을 수 없습니다.");
        }
        return user;
    }
}

export default new UserService();
