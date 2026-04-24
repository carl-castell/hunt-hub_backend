import { Router } from 'express';
import multer from 'multer';
import { verifyCsrfTokenMultipart } from '../middlewares/csrf';
import { getRsvp, postRespond, postUploadLicense, postUploadCertificate, postUploadDetails } from '../controllers/rsvp';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10_000_000 } });

const rsvpRouter = Router();

rsvpRouter.get('/:publicId', getRsvp);
rsvpRouter.post('/:publicId/respond', postRespond);
rsvpRouter.post(
  '/:publicId/upload/license',
  upload.fields([{ name: 'licenseFiles', maxCount: 4 }]),
  verifyCsrfTokenMultipart,
  postUploadLicense,
);
rsvpRouter.post(
  '/:publicId/upload/certificate',
  upload.fields([{ name: 'certFiles', maxCount: 2 }]),
  verifyCsrfTokenMultipart,
  postUploadCertificate,
);
rsvpRouter.post('/:publicId/upload/details', postUploadDetails);

export default rsvpRouter;
