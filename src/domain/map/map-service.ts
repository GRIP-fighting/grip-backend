import AppError from "@src/config/app-error";
import { User } from "@src/domain/user/user";
import { Map } from "@src/domain/map/map";
import { uploadImage, getUrl } from "@src/config/uploadImage";

interface CreateMapInput {
    name: string;
    email: string;
    password: string;
}

class MapService {
    // async login(email: string, password: string) {
    //     const user = await User.findOne({ email: email });
    //     if (!user)
    //         throw new AppError(404, "이메일에 해당하는 유저가 없습니다.");
    //     const isMatch = await user.comparePassword(password);
    //     if (!isMatch) throw new AppError(400, "비밀번호가 틀렸습니다.");
    //     const tokenUser = await user.generateToken();
    //     tokenUser.profileImagePath = await getUrl(tokenUser.profileImagePath);
    //     return tokenUser;
    // }
    async deleteUserFromUserList(user: any, mapId: Number) {
        const map: any = await Map.findOne({ mapId: mapId });

        if (!map) throw new AppError(404, "맵을 찾을 수 없습니다");

        if (!map.userList.includes(user.userId))
            throw new AppError(404, "User not found in the map.");

        // user의 mapList에서 해당 맵 제거
        user.mapList = user.mapList.filter(
            (myMapId: Number) => myMapId !== mapId
        );
        await User.updateOne(
            { userId: user.userId },
            { $set: { mapList: user.mapList } }
        );

        // map에서 user 제거
        map.userList = map.designer.filter(
            (designerId: any) => designerId !== user.userId
        );

        // userList가 0명일때 map 제거
        if (map.userList가.length === 0) {
            await Map.findByIdAndDelete(map._id);
            return true;
        }
        await Map.updateOne(
            { mapId: map.mapId },
            { $set: { userList: user.userList } }
        );
        return false;
    }
    async updateMap(mapId: any, mapName: String, userList: any) {
        const validDesignerIds = await User.find({
            userId: { $in: userList },
        }).select("userId");

        if (validDesignerIds.length !== userList.length)
            throw new AppError(404, "잘못된 사용자가 포함되어 있습니다.");

        const map = await Map.findOne({ mapId: mapId });
        await Map.updateOne(
            { mapId: mapId },
            { $set: { mapName: mapName, userList: userList } }
        );
    }
}

export default new MapService();
