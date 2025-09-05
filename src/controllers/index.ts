import checkAuth from "./checkAuth";
import listAllS3 from "./s3/listAllS3";
import listAllDropbox from "./dropbox/listAllDropbox";
import getFileS3 from "./s3/getFileS3";
import getFileDropbox from "./dropbox/getFileDropbox";
import uploadFileS3 from "./s3/uploadFileS3";
import uploadFileDropbox from "./dropbox/uploadFileDropbox";
import deleteFileS3 from "./s3/deleteFileS3";
import deleteFileDropbox from "./dropbox/deleteFileDropbox";
import uploadLogo from "./uploadLogo";
import signupPost from "./signupPost";
import signinPost from "./signinPost";
import listAllPostgres from "./postgres/listAllPostgres";
import uploadFilePostgres from "./postgres/uploadFilePostgres";
import getFilePostgres from "./postgres/getFilePostgres";
import deleteFilePostgres from "./postgres/deleteFilePostgres";
import listAllFirebase from "./firebase/listAllFirebase";
import uploadFileFirebase from "./firebase/uploadFileFirebase";
import getFileFirebase from "./firebase/getFileFirebase";
import deleteFileFirebase from "./firebase/deleteFileFirebase";
import listAllMongo from "./mongo/listAllMongo";
import uploadFileMongo from "./mongo/uploadFileMongo";
import getFileMongo from "./mongo/getFileMongo";
import deleteFileMongo from "./mongo/deleteFileMongo";

export {
    checkAuth,
    listAllS3,
    listAllDropbox,
    getFileS3,
    getFileDropbox,
    uploadFileS3,
    uploadFileDropbox,
    deleteFileS3,
    deleteFileDropbox,
    uploadLogo,
    signupPost,
    signinPost,
    listAllPostgres,
    uploadFilePostgres,
    getFilePostgres,
    deleteFilePostgres,
    listAllFirebase,
    uploadFileFirebase,
    getFileFirebase,
    deleteFileFirebase,
    listAllMongo,
    uploadFileMongo,
    getFileMongo,
    deleteFileMongo
}