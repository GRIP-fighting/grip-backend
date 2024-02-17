import AppError from "@src/config/app-error";
import { User } from "@src/domain/user/user";
import { Map } from "@src/domain/map/map";
import { Solution } from "@src/domain/solution/solution";
import { uploadProfileImage, getUrl } from "@src/config/uploadImage";

interface CreateUserInput {
    name: string;
    email: string;
    password: string;
}

class UserService {
    async createUser(user: any) {
        await user.save();
        if (!user) throw new AppError(404, "사용자를 저장할 수 없습니다.");
    }

    async login(email: string, password: string) {
        const user = await User.findOne({ email: email }).select("-__v");
        if (!user)
            throw new AppError(404, "이메일에 해당하는 유저가 없습니다.");

        const isMatch = await user.comparePassword(password);
        if (!isMatch) throw new AppError(400, "비밀번호가 틀렸습니다.");

        const tokenUser = await user.generateToken();
        tokenUser.profileImagePath = await getUrl(tokenUser.profileImagePath);
        tokenUser._id = null;
        tokenUser.password = "";

        return tokenUser;
    }

    async logout(userId: Number) {
        const result = await User.findOneAndUpdate(
            { userId: userId },
            { token: "" }
        );
        if (!result)
            throw new AppError(404, "로그아웃하는 동안 문제가 발생했습니다.");
        return result;
    }

    async deleteUser(user: any, password: String) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) throw new AppError(400, "비밀번호가 틀렸습니다.");

        const deletedUser = await User.findByIdAndDelete(user._id);
        if (!deletedUser) throw new AppError(404, "User not found.");
    }

    async getUsersWithUpdatedProfileImages() {
        const users = await User.find({}).select("-password -token -__v -_id");
        const updateProfilePathUsers = await Promise.all(
            users.map(async (user) => {
                user.profileImagePath = await getUrl(user.profileImagePath);
                return user;
            })
        );
        return updateProfilePathUsers;
    }

    async getUserDetails(userId: Number) {
        const user = await User.findOne({ userId: userId });
        if (!user) throw new Error("사용자를 찾을 수 없습니다.");

        user.profileImagePath = await getUrl(user.profileImagePath);

        const mapList = await Map.find({ _id: { $in: user.mapList || [] } });
        const solutionList = await Solution.find({
            _id: { $in: user.solutionList || [] },
        });
        // user.mapList = mapList;
        // user.solutionList = solutionList;
        return {
            user,
            mapList,
            solutionList,
        };
    }

    async updateUserProfileImage(user: any) {
        const profileImagePath = `profile_${user.userId}`;
        const updatedUserData = { profileImagePath };
        await User.findOneAndUpdate({ userId: user.userId }, updatedUserData);
        return profileImagePath;
    }

    async getUserProfileImageUrl(userId: String) {
        const user = await User.findOne({ userId: userId }); // MongoDB에서는 _id 필드를 사용
        if (!user) throw new Error("사용자를 찾을 수 없습니다.");
        const imageUrl = await getUrl(user.profileImagePath);
        return imageUrl;
    }
}

export default new UserService();
