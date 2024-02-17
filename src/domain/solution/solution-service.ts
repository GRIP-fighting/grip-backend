import AppError from "@src/config/app-error";
import { User } from "@src/domain/user/user";
import { Map } from "@src/domain/map/map";
import { Solution } from "@src/domain/solution/solution";

interface CreateMapInput {
    name: string;
    email: string;
    password: string;
}

// interface Solution {
//     liked: Number;
//     Solution: Number[];
//     // 사용자 정의 타입에 필요한 추가 속성들...
// }

class SolutionService {
    async likeSolution(user: any, solutionId: String) {
        const solution = await Solution.findOne({ solutionId: solutionId });

        if (!user || !solution)
            throw new AppError(404, "맵이나 솔루션을 찾을 수 없습니다");

        if (!solution.likedUserList.includes(user.userId)) {
            solution.liked = solution.liked + 1;
            solution.likedUserList.push(user.userId);
        } else {
            solution.liked = solution.liked - 1;
            let index = solution.likedUserList.indexOf(user.userId);
            if (index !== -1) {
                solution.likedUserList.splice(index, 1);
            }
        }
        await Solution.updateOne(
            { solutionId: solutionId },
            {
                $set: {
                    liked: solution.liked,
                    likedUserList: solution.likedUserList,
                },
            }
        );
    }
    async deleteSolution(user: any, solutionId: String) {
        const solution: any = await Solution.findOne({
            solutionId: solutionId,
        });

        if (!solution) throw new AppError(404, "솔루션을 찾을 수 없습니다");

        if (solution.userId != user.userId)
            throw new AppError(404, "권한이 없습니다");

        await Solution.findByIdAndDelete(solution._id);

        user.solutionList = user.solutionList.filter(
            (mySolutionId: any) => mySolutionId !== solutionId
        );
        await User.updateOne(
            { userId: user?.userId },
            { $set: { solutionList: user.solutionList } }
        );

        const map: any = await Map.findOne({ mapId: solution.mapId });
        map.solutionList = user.solutionList.filter(
            (mySolutionId: any) => mySolutionId !== solutionId
        );
        await Map.updateOne(
            { mapId: map.mapId },
            { $set: { solutionList: map.solutionList } }
        );
    }
}

export default new SolutionService();
