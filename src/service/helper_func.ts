import jwt from 'jsonwebtoken';

class HelperService {
    static genToken = (university_id : string)  => {
        const token = jwt.sign(
            { university_id },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' } // หมดอายุใน 1 วัน
        );
        return token;
    };

    static verifyToken = (token : string) => {
        try{
            jwt.verify(token as string, process.env.JWT_SECRET!);
            return true;
        }catch (error) {
            console.log('Token expired or invalid in token');
            return false;
        }
    };
}

export default HelperService;