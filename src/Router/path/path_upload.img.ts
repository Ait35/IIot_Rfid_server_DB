import { Router } from 'express';
import { upload_img_control } from '../../Controller/Img.control/upload.control.js';
import {upload}  from '../../Infra/uploadImg.Multer.js';

const path_upload_img = Router();

path_upload_img.post('/iiot/pose/upload_img', upload.single('img'), upload_img_control);

export default path_upload_img;