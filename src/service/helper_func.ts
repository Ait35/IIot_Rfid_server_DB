import jwt from 'jsonwebtoken';

export const genToken = (university_id : string)  => {
    const token = jwt.sign(
        { university_id },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' } // หมดอายุใน 1 วัน
    );
    return token;
};

export const verifyToken = (token : string) => {
    try{
        jwt.verify(token as string, process.env.JWT_SECRET!);
        return true;
    }catch (error) {
        console.log('Token expired or invalid in token');
        return false;
    }
};