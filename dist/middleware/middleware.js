import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const middleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        //@ts-ignore
        req.userId = decodedToken.userId;
        next();
    }
    catch (e) {
        console.log(e);
        res.send("something went wrong");
    }
};
//# sourceMappingURL=middleware.js.map