import express from "express";

const domainRouter = express.Router();

// import {login, register} from "../service/AuthenticationService";
// import {jwtAccess} from "../../../system/security/passport/authguard";
// import {toUserDetail} from "../../user/dto/userdto";

// domainRouter.post('/login', login);
// domainRouter.post('/register', register)
// domainRouter.get('/test', jwtAccess, (ctx: RouterContext) => {
//   ctx.body = toUserDetail(ctx.state.user);
// })

export default domainRouter;
