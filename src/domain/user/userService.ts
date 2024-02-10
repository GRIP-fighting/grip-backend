import AppError from "@src/config/app-error";
import { User } from "@src/domain/user/user";
import { uploadImage, getUrl } from "@src/config/uploadImage";

class UserService {
    async createUser(userData: any): Promise<any> {
        const user = new User(userData);
        await user.save();
        if (!user) {
            throw new AppError(404, "사용자를 찾을 수 없습니다.");
        }
        return user;
    }

    async authenticateUser(email: string, password: string) {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new AppError(404, "이메일에 해당하는 유저가 없습니다.");
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError(400, "비밀번호가 틀렸습니다.");
        }
        const tokenUser = await user.generateToken();
        tokenUser.profileImagePath = await getUrl(tokenUser.profileImagePath);
        return tokenUser;
    }

    async logoutUser(userId: number) {
        const result = await User.findOneAndUpdate(
            { userId: userId },
            { token: "" },
            { new: true }
        );
        if (!result) {
            throw new AppError(404, "로그아웃하는 동안 문제가 발생했습니다.");
        }
        return result;
    }

    async deleteUser(userId: number) {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            throw new AppError(404, "User not found.");
        }
        return deletedUser;
    }

    async getUsersWithUpdatedProfileImages() {
        const users = await User.find({}).select("-password -token -__v");
        const updatedUsers = await Promise.all(
            users.map(async (user) => {
                user.profileImagePath = await getUrl(user.profileImagePath);
                return user;
            })
        );
        return updatedUsers;
    }

    async updateUserProfileImage(user: any, imagePath: string) {
        user.profileImagePath = imagePath;
        await user.save();
        if (!user) throw new AppError(404, "Error saving user profile image");
        return user;
    }

    async getUserProfileImageUrl(userId: string) {
        const user = await User.findOne({ _id: userId }); // MongoDB에서는 _id 필드를 사용
        if (!user) {
            throw new Error("사용자를 찾을 수 없습니다.");
        }
        const imageUrl = await getUrl(user.profileImagePath);
        return imageUrl;
    }

    async getUserDetails(userId: string) {
        const user = await User.findOne({ _id: userId });
        if (!user) {
            throw new Error("사용자를 찾을 수 없습니다.");
        }
        const imageUrl = await getUrl(user.profileImagePath);
        const likedMaps = await Map.find({
            _id: { $in: user.likedMapId || [] }, // MongoDB에서는 _id 필드를 사용
        });
        const likedSolutions = await Solution.find({
            _id: { $in: user.likedSolutionId || [] },
        });
        const maps = await Map.find({ _id: { $in: user.mapId || [] } });
        const solutions = await Solution.find({
            _id: { $in: user.solutionId || [] },
        });
        return {
            user,
            imageUrl,
            likedMaps,
            likedSolutions,
            maps,
            solutions,
        };
    }
}

export default new UserService();
