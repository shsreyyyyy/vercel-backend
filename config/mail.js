import  "dotenv/config";
import { createTransport } from "nodemailer";

export const transporter=createTransport({
    host:"smtp.gmail.com",
    port:465,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASSWORD
    }
    
}
)  
