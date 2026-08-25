import jwt from "jsonwebtoken";

export const authMiddleware=async(req,res,next)=>{
    try {

        const token=req.cookies.authToken;
        if(!token){
             return res.status(401).json({
        message: "UnAuthorized login,Please Login First",
      });
        }
        const decode=jwt.verify(token,process.env.JWT_SECRET)

        req.user=decode
        next()
    } catch (error) {
        
          return res.status(401).json({
        message: "Invalid or Token Expire",
          })
    }
}