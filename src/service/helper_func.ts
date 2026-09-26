import jwt from 'jsonwebtoken';

export interface ITokenPayload {
    user_id: string; //ให้ สัญญาวาเป็นรูปแบบ ojb นี้แน่นอน
}

const Service = {
    genToken (user_id : string){
        const token = jwt.sign(
            { user_id }, // ยัด ีuser id ไว้
            process.env.JWT_SECRET!,
            { expiresIn: '1d' } // หมดอายุใน 1 วัน
        );
        return token;
    },

    verifyToken (token: string){
        try {
            // jwt.verify จะคืนค่า Object Payload ที่เรายัดไว้ตอนแรกออกมา
            const decoded = jwt.verify(token, process.env.JWT_SECRET!)  as ITokenPayload; //ให้ สัญญาวาเป็นรูปแบบ ojb นี้แน่นอน
    
            return decoded; 
        } catch (error) {
            console.log('Token expired or invalid');
            return null; // ถ้าพัง คืนค่า null 
        }
    }
}

export default Service;