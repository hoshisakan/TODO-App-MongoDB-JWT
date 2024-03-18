const { logError, logInfo } = require('../../utils/log.util');
const http = require('../../helpers/http.helper');
const { filenameFilter } = require('../../utils/regex.util');
const filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
const { OK, BAD_REQUEST } = require('../../helpers/constants.helper');
const fs = require('fs');
///TODO: analysis multpart/form-data request
const multer = require('multer');

const ProfileService = require('../../services/v1/profile.service');
const { stringify } = require('../../utils/json.util');

const getFunctionCallerName = () => {
    const err = new Error();
    const stack = err.stack.split('\n');
    const functionName = stack[2].trim().split(' ')[1];
    return functionName;
};
const getFileDetails = (classAndFuncName) => {
    const classAndFuncNameArr = classAndFuncName.split('.');
    return `[${filenameWithoutPath}] [${classAndFuncNameArr}]`;
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const classNameAndFuncName = getFunctionCallerName();
        const fileDetails = getFileDetails(classNameAndFuncName);
        const photoPath = `${process.env.UPLOAD_PHOTO_STATIC_PATH}/${req.userId}`;
        const isPathExists = fs.existsSync(photoPath);
        if (!isPathExists) {
            console.log('storage path does exists, starting create it.');
            fs.mkdirSync(photoPath, { recursive: true });
            console.log('storage path does exists, finish create it.');
            logInfo('storage path does exists, finish create it.', fileDetails);
        }
        cb(null, photoPath);
        console.log('received upload file.');
        logInfo('received upload file.', fileDetails);
    },
    filename: function (req, file, cb) {
        const classNameAndFuncName = getFunctionCallerName();
        const fileDetails = getFileDetails(classNameAndFuncName);

        if (file) {
            const photoFullPath = `${process.env.UPLOAD_PHOTO_STATIC_PATH}/${file.originalname}`;
            const isFileExists = fs.existsSync(photoFullPath);
            if (!isFileExists) {
                cb(null, file.originalname);
                console.log('storage file to disk successully!');
                logInfo('storage file to disk successully!', fileDetails);
            } else {
                return cb(new Error(`The ${file.originalname} does exists in localStorge disk.`));
            }
        }
    },
});

const upload = multer(
    { storage: storage },
    {
        limits: {
            fileSize: 2000000,
        },
    }
).single('photo');

class ProfileController {
    constructor() {
        this.profileService = new ProfileService();
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
    }

    getFunctionCallerName = () => {
        const err = new Error();
        const stack = err.stack.split('\n');
        const functionName = stack[2].trim().split(' ')[1];
        return functionName;
    };

    getFileDetails = (classAndFuncName) => {
        const classAndFuncNameArr = classAndFuncName.split('.');
        return `[${this.filenameWithoutPath}] [${classAndFuncNameArr}]`;
    };

    bulkCreate = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.profileService.bulkCreate(req.body, req.userId);
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    // bulkUpdate = async (req, res) => {
    //     const classNameAndFuncName = this.getFunctionCallerName();
    //     const fileDetails = this.getFileDetails(classNameAndFuncName);
    //     try {
    //         const result = await this.profileService.bulkUpdate(req.body);
    //         return http.successResponse(res, OK, '', result);
    //     } catch (error) {
    //         logError(error, fileDetails, true);
    //         return http.errorResponse(res, BAD_REQUEST, error.message);
    //     }
    // };

    create = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const tokenParseResult = {
                userId: req.userId,
                highestPermission: req.highestPermission,
            };
            logInfo(`tokenParseResult: ${stringify(tokenParseResult)}`, fileDetails, true);
            const result = await this.profileService.create(req.body, tokenParseResult);
            if (result.message && result.isSuccess) {
                throw new Error(result.isSuccess);
            }
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    updateById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const tokenParseResult = {
                userId: req.userId,
                highestPermission: req.highestPermission,
            };
            logInfo(`tokenParseResult: ${stringify(tokenParseResult)}`, fileDetails, true);
            const result = await this.profileService.updateById(req.params.id, req.body, tokenParseResult);
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    patchUpdateById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const tokenParseResult = {
                userId: req.userId,
                highestPermission: req.highestPermission,
            };
            logInfo(`tokenParseResult: ${stringify(tokenParseResult)}`, fileDetails, true);
            const result = await this.profileService.patchUpdateById(req.params.id, req.body, tokenParseResult);
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    deleteById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.profileService.deleteById(req.params.id);
            if (result.message && result.isSuccess) {
                throw new Error(result.isSuccess);
            }
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    findById = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const result = await this.profileService.findById(req.params.id);
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    deleteAll = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            const result = await this.profileService.deleteAll();
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    findAll = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const tokenParseResult = {
                userId: req.userId,
                highestPermission: req.highestPermission,
            };
            logInfo(`tokenParseResult: ${stringify(tokenParseResult)}`, fileDetails, true);
            const result = await this.profileService.findAll(req.query, tokenParseResult);
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    getProfile = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const clientRequest = {
                tokenParseResult: {
                    userId: req.userId,
                    highestPermission: req.highestPermission,
                },
            };
            logInfo(`clientRequest: ${stringify(clientRequest)}`, fileDetails, true);
            const result = await this.profileService.getProfile(clientRequest);
            logInfo(`result: ${stringify(result)}`, fileDetails, true);
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    setProfile = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const clientRequest = {
                tokenParseResult: {
                    userId: req.userId,
                    highestPermission: req.highestPermission,
                },
                body: req.body,
            };
            logInfo(`clientRequest: ${stringify(clientRequest)}`, fileDetails, true);
            const result = await this.profileService.setProfile(clientRequest);
            logInfo(`result: ${stringify(result)}`, fileDetails, true);
            return http.successResponse(res, OK, '', result);
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };

    uploadPhoto = async (req, res) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            upload(req, res, async (err) => {
                if (err instanceof multer.MulterError) {
                    // A Multer error occurred when uploading.
                    logError(err, fileDetails, true);
                    return http.errorResponse(res, BAD_REQUEST, err.message);
                } else if (err) {
                    // An unknown error occurred when uploading.
                    logError(err, fileDetails, true);
                    return http.errorResponse(res, err.status || BAD_REQUEST, err.message);
                }
                const clientRequest = {
                    tokenParseResult: {
                        userId: req.userId,
                        highestPermission: req.highestPermission,
                    },
                    file: req.file,
                };
                logInfo(`clientRequest: ${stringify(clientRequest)}`, fileDetails, true);
                const result = await this.profileService.uploadPhoto(clientRequest);
                logInfo(`result: ${stringify(result)}`, fileDetails, true);
                return http.successResponse(res, OK, '', result);
            });
        } catch (error) {
            logError(error, fileDetails, true);
            return http.errorResponse(res, BAD_REQUEST, error.message);
        }
    };
}

module.exports = ProfileController;
