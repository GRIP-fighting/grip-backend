import { User } from "../model/User"; // 모델 스키마 가져오기

let auth = async (req: any, res: any, next: any) => {
    let token = req.cookies.x_auth;

    const user = await User.findOne({ userId: 1 });
    req.user = user;
    next();

    // User.findByToken을 프로미스로 처리
    // User.findByToken(token)
    //     .then((user) => {
    //         if (!user) return res.json({ isAuth: false, error: true });
    //         req.token = token;
    //         req.user = user;
    //         next();
    //     })
    //     .catch((err) => {
    //         console.error(err);
    //         return res.status(400).json({ isAuth: false, error: true });
    //     });
};
export { auth };
