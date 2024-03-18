const { logInfo, logError } = require('../../utils/log.util');
const { stringify } = require('../../utils/json.util');
const { filenameFilter, fields, email } = require('../../utils/regex.util');
const {
    getFilterQuery,
    checkDuplicateExisting,
    checkMultipleDuplicateExisting,
} = require('../../utils/logic.check.util');
const { getSelectFields, getSelectFKFields, validObjectId, toObjectId } = require('../../utils/mongoose.filter.util');

const BaseService = require('./base.service');
const UnitOfWork = require('../../repositories/unitwork');
const unitOfWork = new UnitOfWork();

class ProfileService extends BaseService {
    constructor() {
        super(unitOfWork.profiles);
        this.unitOfWork = unitOfWork;
        this.filenameWithoutPath = String(__filename).split(filenameFilter).splice(-1).pop();
        this.modelName = 'Profile';
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

    getArrayUniqueItem = async (valueArr) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            isDuplicate: false,
            arrayUniqueValues: [],
        };

        try {
            if (!Array.isArray(valueArr) || valueArr.length === 0) {
                throw new Error('Invalid value');
            }

            const isDupicateResult = valueArr.some((currVal, index) => valueArr.indexOf(currVal) !== index);

            if (isDupicateResult) {
                result.isDuplicate = true;
                result.arrayUniqueValues = [...new Set(valueArr)];
            } else {
                result.isDuplicate = false;
                result.arrayUniqueValues = valueArr;
            }
        } catch (error) {
            logError(error, fileDetails, true);
            result = {
                isDuplicate: false,
                arrayUniqueValues: [],
            };
        }
        return result;
    };

    create = async (entity, tokenParseResult) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        let result = {
            isSuccess: false,
            message: '',
        };

        try {
            if (!entity) {
                throw new Error('Invalid entity');
            }

            if (!tokenParseResult.userId) {
                throw new Error('Invalid user id, please login again');
            }

            entity.user = tokenParseResult.userId;
            entity.createdAt = Date.now();

            const createResult = await this.unitOfWork.profiles.create(entity);

            if (!createResult) {
                throw new Error('Profile create failed');
            }
            logInfo(`Create result: ${stringify(createResult)}`, fileDetails);

            result.isSuccess = true;
        } catch (error) {
            logError(error, fileDetails, true);
            result.message = error.message;
        }
        return result;
    };

    bulkCreate = async (entities, userId) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!entities) {
                throw new Error('Invalid entity');
            }

            if (!userId) {
                throw new Error('Invalid user id, please login again');
            }

            const checkBodyDuplicateItems = entities.map((entity) => entity.image);

            const checkDuplicateItemExistsResult = await this.getArrayUniqueItem(checkBodyDuplicateItems);

            if (checkDuplicateItemExistsResult.isDuplicate) {
                throw new Error('Is duplicate exists in items');
            }

            entities.forEach((entity, index) => {
                entity.user = userId;
                entity.createdAt = Date.now();
            });

            const createResult = await this.unitOfWork.profiles.insertMany(entities);

            if (!createResult) {
                throw new Error('Profile bulk create failed');
            }

            logInfo(`Create result: ${stringify(createResult)}`, fileDetails);

            return createResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    patchUpdateById = async (id, entity, tokenParseResult) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        try {
            if (!id || !entity || !validObjectId(id)) {
                throw new Error('Invalid parameters');
            }

            if (!tokenParseResult.userId) {
                throw new Error('Unauthorized, Invaild user id');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const searchResult = await this.unitOfWork.profiles.findById(id, selectFields, userFKFields);

            if (!searchResult) {
                throw new Error('Todo not found with the provided id');
            }

            let oldRecord = {};
            oldRecord = searchResult.toObject();

            if (entity.image) {
                oldRecord.image = entity.image;
            }
            oldRecord.user = tokenParseResult.userId;
            oldRecord.updatedAt = Date.now();

            const filterCondition = {
                _id: id,
            };
            const updateResult = await this.unitOfWork.profiles.findOneAndUpdate(filterCondition, oldRecord);

            if (!updateResult) {
                throw new Error('Update profile item failed');
            }
            return updateResult;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    };

    updateById = async (id, entity, tokenParseResult) => {
        const classAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classAndFuncName);
        let result = {
            isSuccess: false,
            message: '',
        };
        try {
            if (!id || !entity || !validObjectId(id)) {
                throw new Error('Invalid parameters');
            }

            if (!tokenParseResult.userId) {
                throw new Error('Unauthorized, Invaild user id');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const searchResult = await this.unitOfWork.profiles.findById(id, selectFields, userFKFields);

            if (!searchResult) {
                throw new Error('Profile not found with the provided id');
            }

            let oldRecord = {};
            oldRecord = searchResult.toObject();

            if (entity.image) {
                oldRecord.image = entity.image;
            }
            oldRecord.user = tokenParseResult.userId;
            oldRecord.updatedAt = Date.now();

            const filterCondition = {
                _id: id,
            };
            const updateResult = await this.unitOfWork.profiles.findOneAndUpdate(filterCondition, oldRecord);

            if (!updateResult) {
                throw new Error('Update profile item failed');
            }
            result.isSuccess = true;
        } catch (err) {
            // logError(error, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    deleteById = async (id) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let result = {
            isSuccess: false,
            message: '',
        };
        try {
            if (!id || !validObjectId(id)) {
                throw new Error('Invalid id');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const searchResult = await this.unitOfWork.profiles.findById(id, selectFields, userFKFields);

            if (!searchResult) {
                throw new Error(`Profile with id ${id} not found`);
            }
            const deleteResult = await this.unitOfWork.profiles.deleteOne({ _id: id });

            if (!deleteResult) {
                throw new Error('Delete profile failed');
            }
            logInfo(`Remove result: ${deleteResult}`, fileDetails);
            result.isSuccess = true;
        } catch (err) {
            // logError(error, fileDetails, true);
            result.message = err.message;
        }
        return result;
    };

    deleteAll = async () => {
        // const classNameAndFuncName = this.getFunctionCallerName();
        // const fileDetails = this.getFileDetails(classNameAndFuncName);
        try {
            const deleteResult = await this.unitOfWork.profiles.deleteMany({});
            if (!deleteResult) {
                throw new Error('Profile deletion failed');
            }
            return deleteResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    findOne = async (queryParams, tokenParseResult) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        let searchResult = {};

        try {
            if (!tokenParseResult || !tokenParseResult.userId) {
                throw new Error('Unauthorized!');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            let tempSearchResult = {};

            if (!queryParams || Object.keys(queryParams).length === 0) {
                if (tokenParseResult.highestPermission && tokenParseResult.highestPermission === 'admin') {
                    tempSearchResult = await this.unitOfWork.profiles.findOne({}, selectFields, userFKFields);
                } else {
                    tempSearchResult = await this.unitOfWork.profiles.findOne(
                        {
                            user: toObjectId(tokenParseResult.userId),
                        },
                        selectFields,
                        userFKFields
                    );
                }
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);
                logInfo(`filterQueryResult: ${stringify(filterQueryResult)}`, fileDetails);

                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                if (tokenParseResult.highestPermission && tokenParseResult.highestPermission === 'admin') {
                    tempSearchResult = await this.unitOfWork.profiles.findOne(
                        filterQueryResult.query,
                        selectFields,
                        userFKFields
                    );
                } else {
                    const limitFilterQueryResult = {
                        $and: [
                            filterQueryResult.query,
                            {
                                user: toObjectId(tokenParseResult.userId),
                            },
                        ],
                    };
                    logInfo(`limitFilterQueryResult: ${stringify(limitFilterQueryResult)}`, fileDetails);
                    tempSearchResult = await this.unitOfWork.profiles.findOne(
                        limitFilterQueryResult,
                        selectFields,
                        userFKFields
                    );
                }
            }
            if (!tempSearchResult) {
                throw new Error('Not found any record');
            }
            searchResult = tempSearchResult.toObject();
            searchResult['user'] = tempSearchResult['user']['_id'];
            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    findById = async (id) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            if (!id || !validObjectId(id)) {
                throw new Error('Invalid id');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            const tempSearchResult = await this.unitOfWork.profiles.findById(id, selectFields, userFKFields);

            if (!tempSearchResult) {
                throw new Error(`Profile with id ${id} not found`);
            }

            const searchResult = tempSearchResult.toObject();

            searchResult['user'] = tempSearchResult['user']?.id || null;

            return searchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    findAll = async (queryParams, tokenParseResult) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        // let searchResult = [];
        let tempSearchResult = [];

        try {
            if (!tokenParseResult || !tokenParseResult.userId) {
                throw new Error('Unauthorized!');
            }

            const selectFields = getSelectFields(this.modelName);

            const FKFields = getSelectFKFields(this.modelName);

            const userFKFields = FKFields['user'];

            tempSearchResult = await this.unitOfWork.profiles.find({}, selectFields, userFKFields);

            if (!queryParams || Object.keys(queryParams).length === 0) {
                if (tokenParseResult.highestPermission && tokenParseResult.highestPermission === 'admin') {
                    tempSearchResult = await this.unitOfWork.profiles.find({}, selectFields, userFKFields);
                } else {
                    (tempSearchResult = await this.unitOfWork.profiles.find({
                        user: toObjectId(tokenParseResult.userId),
                    })),
                        selectFields,
                        userFKFields;
                    {
                    }
                }
                ///TODO: 使用 mongoose 的搜尋結果返回的資料是不可變的，故需要將其從 mongoose 的資料型態轉換成 object 才能夠讓其屬性被更動
                // searchResult = tempSearchResult.map((item) => item.toObject());
                // searchResult.forEach((item, index) => {
                //     searchResult[index]['user'] = item['user']?.username;
                // });
            } else {
                const filterQueryResult = await getFilterQuery(queryParams, this.modelName);
                if (!filterQueryResult || !filterQueryResult.query || filterQueryResult.error) {
                    throw new Error(filterQueryResult.error);
                }
                logInfo(`filterQueryResult: ${stringify(filterQueryResult)}`, fileDetails);
                if (tokenParseResult.highestPermission && tokenParseResult.highestPermission === 'admin') {
                    tempSearchResult = await this.unitOfWork.profiles.find(
                        filterQueryResult.query,
                        selectFields,
                        userFKFields
                    );
                } else {
                    const limitFilterQueryResult = {
                        $and: [
                            filterQueryResult.query,
                            {
                                user: toObjectId(tokenParseResult.userId),
                            },
                        ],
                    };
                    logInfo(`limitFilterQueryResult: ${stringify(limitFilterQueryResult)}`, fileDetails);
                    tempSearchResult = await this.unitOfWork.profiles.find(
                        limitFilterQueryResult,
                        selectFields,
                        userFKFields
                    );
                }
                ///TODO: 使用 mongoose 的搜尋結果返回的資料是不可變的，故需要將其從 mongoose 的資料型態轉換成 object 才能夠讓其屬性被更動
                // searchResult = tempSearchResult.map((item) => item.toObject());
                // searchResult.forEach((item, index) => {
                // searchResult[index]['user'] = item['user']['_id'];
                // });
            }
            return tempSearchResult;
        } catch (error) {
            // logError(error, fileDetails, true);
            throw error;
        }
    };

    // updateProfileAndPhoto = async (clientRequest) => {
    //     const classNameAndFuncName = this.getFunctionCallerName();
    //     const fileDetails = this.getFileDetails(classNameAndFuncName);
    //     const result = {
    //         isModifiedSuccess: false,
    //         message: '',
    //     };
    //     try {
    //         if (!clientRequest) {
    //             throw new Error('Invalid entity.');
    //         }
    //         if (!clientRequest.tokenParseResult || !clientRequest.tokenParseResult.userId) {
    //             throw new Error('Unauthorized!');
    //         }
    //         if (!clientRequest.body && !clientRequest.file) {
    //             throw new Error('Invalid request body and file.');
    //         }

    //         const userSelectFields = getSelectFields('User');
    //         const userFKFields = getSelectFKFields('User');
    //         const userRoleFKFields = userFKFields['role'];
    //         const userProfileFKFields = userFKFields['profile'];
    //         const oldUserRecord = await this.unitOfWork.users.findOne(
    //             { _id: toObjectId(clientRequest.tokenParseResult.userId) },
    //             userSelectFields,
    //             userRoleFKFields,
    //             userProfileFKFields
    //         );

    //         if (!oldUserRecord) {
    //             throw new Error('Not found user');
    //         }

    //         if (clientRequest.body.bio || clientRequest.body.displayName || clientRequest.body.email) {
    //             let isModified = false;

    //             if (clientRequest.body.bio && clientRequest.body.bio !== oldUserRecord.bio) {
    //                 oldUserRecord.bio = clientRequest.body.bio;
    //                 isModified = true;
    //             }
    //             if (clientRequest.body.displayName && clientRequest.body.displayName !== oldUserRecord.displayName) {
    //                 oldUserRecord.displayName = clientRequest.body.displayName;
    //                 isModified = true;
    //             }
    //             if (clientRequest.body.email && clientRequest.body.email !== oldUserRecord.email) {
    //                 oldUserRecord.email = clientRequest.body.email;
    //                 isModified = true;
    //             }
    //             if (isModified) {
    //                 oldUserRecord.updatedAt = Date.now();
    //                 await oldUserRecord.save();
    //                 result.isModifiedSuccess = true;
    //             }
    //         }

    //         // const profileSelectFields = getSelectFields(this.modelName);
    //         // const profileFKFields = getSelectFKFields(this.modelName);
    //         // const profileUserFKFields = profileFKFields['user'];
    //         const photoFileName = clientRequest.file ? clientRequest.file.filename : null;
    //         // const photoFileName = clientRequest.file ? clientRequest.file.path : null;

    //         if (clientRequest.file && photoFileName) {
    //             const profileCount = await this.unitOfWork.profiles.countDocuments();

    //             logInfo(`profileCount: ${profileCount}`, fileDetails, true);

    //             if (profileCount > 0) {
    //                 const profileResetMainPhotoEntity = {
    //                     isMainPhoto: false,
    //                 };
    //                 const profileMainPhotoFilterCondition = {
    //                     $and: [
    //                         {
    //                             user: toObjectId(clientRequest.tokenParseResult.userId),
    //                         },
    //                         {
    //                             $or: [
    //                                 {
    //                                     isMainPhoto: true,
    //                                 },
    //                                 {
    //                                     photoFileName: { $ne: photoFileName },
    //                                 },
    //                             ],
    //                         },
    //                     ],
    //                 };
    //                 const updateResult = await this.unitOfWork.profiles.updateMany(
    //                     profileMainPhotoFilterCondition,
    //                     profileResetMainPhotoEntity
    //                 );
    //                 if (!updateResult) {
    //                     throw new Error(
    //                         `Reset the user ${clientRequest.tokenParseResult.userId} profile main photo state failed.`
    //                     );
    //                 }
    //                 logInfo(
    //                     `Reset the user ${clientRequest.tokenParseResult.userId} profile main photo state successfully!`,
    //                     fileDetails,
    //                     true
    //                 );
    //             }

    //             const entity = {
    //                 user: toObjectId(clientRequest.tokenParseResult.userId),
    //                 photoFileName: photoFileName,
    //                 isMainPhoto: true,
    //             };
    //             await this.unitOfWork.profiles.create(entity);

    //             result.isModifiedSuccess = true;
    //         }
    //     } catch (error) {
    //         logError(error, fileDetails, true);
    //         result.message = error.message;
    //     }
    //     return result;
    // };

    getProfile = async (clientRequest) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            if (!clientRequest) {
                throw new Error('Invalid client request.');
            }
            if (!clientRequest.tokenParseResult || !clientRequest.tokenParseResult.userId) {
                throw new Error('Unauthorized!');
            }

            // const profileSelectFields = {
            //     _id: 0,
            //     photoFileName: 1,
            // };
            // const profileFKFields = getSelectFKFields(this.modelName);
            // const profileUserFKFields = profileFKFields['user'];
            // const profileExpression = {
            //     user: clientRequest.tokenParseResult.userId,
            // };
            // const tempSearchResult = await this.unitOfWork.profiles.findOne(
            //     profileExpression,
            //     profileSelectFields,
            //     profileUserFKFields
            // );

            // if (!tempSearchResult) {
            //     throw new Error(`Not found the user ${clientRequest.tokenParseResult.userId} about profile`);
            // }

            const userSelectFields = {
                _id: 1,
                bio: 1,
                username: 1,
                displayName: 1,
                email: 1,
                roles: 0,
                profile: 1,
            };
            const userFKFields = getSelectFKFields('User');
            const userRoleFKFields = userFKFields['role'];
            const userProfileFKFields = userFKFields['profile'];

            const userProfileMainUser = await this.unitOfWork.users.findOne(
                {
                    _id: toObjectId(clientRequest.tokenParseResult.userId),
                },
                userSelectFields,
                userRoleFKFields,
                userProfileFKFields
            );
            let searchResult = userProfileMainUser.toObject();

            if (!userProfileMainUser.profile) {
                searchResult['photoFileName'] = null;
            } else {
                delete searchResult['profile'];
                searchResult['photoFileName'] = userProfileMainUser.profile['photoFileName'];
            }
            return searchResult;
        } catch (error) {
            logError(error, fileDetails, true);
            throw error;
        }
    };

    setProfile = async (clientRequest) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        const result = {
            isModifiedSuccess: false,
            message: '',
        };
        try {
            if (!clientRequest) {
                throw new Error('Invalid client request.');
            }
            if (!clientRequest.tokenParseResult || !clientRequest.tokenParseResult.userId) {
                throw new Error('Unauthorized!');
            }
            if (!clientRequest.body) {
                throw new Error('Invalid request body and file.');
            }

            const userSelectFields = getSelectFields('User');
            const userFKFields = getSelectFKFields('User');
            const userRoleFKFields = userFKFields['role'];
            const userProfileFKFields = userFKFields['profile'];

            const oldUserRecord = await this.unitOfWork.users.findOne(
                { _id: toObjectId(clientRequest.tokenParseResult.userId) },
                userSelectFields,
                userRoleFKFields,
                userProfileFKFields
            );

            if (!oldUserRecord) {
                throw new Error('Not found user');
            }

            if (clientRequest.body.bio || clientRequest.body.displayName || clientRequest.body.email) {
                let isModified = false;

                const checkAllDuplicate = await this.unitOfWork.users.findOne(
                    {
                        $and: [
                            { bio: clientRequest.body.bio },
                            { displayName: clientRequest.body.displayName },
                            { email: clientRequest.body.email },
                        ],
                    },
                    userSelectFields,
                    userRoleFKFields,
                    userProfileFKFields
                );

                if (checkAllDuplicate) {
                    throw new Error('Update failed, the values of the input field content are all empty');
                }

                if (clientRequest.body.bio && clientRequest.body.bio !== oldUserRecord.bio) {
                    oldUserRecord.bio = clientRequest.body.bio;
                    isModified = true;
                }
                if (clientRequest.body.displayName && clientRequest.body.displayName !== oldUserRecord.displayName) {
                    oldUserRecord.displayName = clientRequest.body.displayName;
                    isModified = true;
                }
                if (clientRequest.body.email && clientRequest.body.email !== oldUserRecord.email) {
                    oldUserRecord.email = clientRequest.body.email;
                    isModified = true;
                }
                if (isModified) {
                    oldUserRecord.updatedAt = Date.now();
                    await oldUserRecord.save();
                    result.isModifiedSuccess = true;
                }
            }
            result.isModifiedSuccess = true;
        } catch (error) {
            logError(error, fileDetails, true);
            result.message = error.message;
        }
        return result;
    };

    uploadPhoto = async (clientRequest) => {
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);
        const result = {
            isModifiedSuccess: false,
            message: '',
            ///TODO: For debug
            // createOrUpdateUserProfileMainProfile: null,
            // createOrUpdateUserProfileMainUser: null,
        };
        try {
            if (!clientRequest) {
                throw new Error('Invalid client request.');
            }
            if (!clientRequest.tokenParseResult || !clientRequest.tokenParseResult.userId) {
                throw new Error('Unauthorized!');
            }
            if (!clientRequest.file) {
                throw new Error('Invalid request file.');
            }

            let firstCreatedUserProfileId = null;
            const userSelectFields = getSelectFields('User');
            const userFKFields = getSelectFKFields('User');
            const userRoleFKFields = userFKFields['role'];
            const userProfileFKFields = userFKFields['profile'];
            const oldUserRecord = await this.unitOfWork.users.findOne(
                { _id: toObjectId(clientRequest.tokenParseResult.userId) },
                userSelectFields,
                userRoleFKFields,
                userProfileFKFields
            );

            if (!oldUserRecord) {
                throw new Error('Not found user');
            }

            const profileSelectFields = getSelectFields(this.modelName);
            const profileFKFields = getSelectFKFields(this.modelName);
            const profileUserFKFields = profileFKFields['user'];
            const photoFileName = clientRequest.file ? clientRequest.file.filename : null;
            // const photoFileName = clientRequest.file ? clientRequest.file.path : null;

            if (clientRequest.file && photoFileName) {
                const oldUserProfile = await this.unitOfWork.profiles.findOne(
                    {
                        user: toObjectId(clientRequest.tokenParseResult.userId),
                    },
                    profileSelectFields,
                    profileUserFKFields
                );
                if (!oldUserProfile) {
                    const profileEntity = {
                        user: toObjectId(clientRequest.tokenParseResult.userId),
                        photoFileName: photoFileName,
                    };
                    const createResult = await this.unitOfWork.profiles.create(profileEntity);
                    firstCreatedUserProfileId = createResult._id;
                } else {
                    oldUserProfile.photoFileName = photoFileName;
                    oldUserProfile.updatedAt = Date.now();
                    await oldUserProfile.save();
                }
                result.isModifiedSuccess = true;
            }

            // const createOrUpdateUserProfileMainProfile = await this.unitOfWork.profiles.find(
            //     {
            //         user: toObjectId(clientRequest.tokenParseResult.userId),
            //     },
            //     profileSelectFields,
            //     profileUserFKFields
            // );
            // const createOrUpdateUserProfileMainUser = await this.unitOfWork.users.find(
            //     {
            //         _id: toObjectId(clientRequest.tokenParseResult.userId),
            //     },
            //     userSelectFields,
            //     userRoleFKFields,
            //     userProfileFKFields
            // );

            if (firstCreatedUserProfileId) {
                logInfo(`firstCreatedUserProfileId: ${firstCreatedUserProfileId}`, fileDetails, true);
                oldUserRecord.profile = firstCreatedUserProfileId;
                await oldUserRecord.save();
            }
            ///TODO: For debug
            // result.createOrUpdateUserProfileMainProfile = createOrUpdateUserProfileMainProfile;
            // result.createOrUpdateUserProfileMainUser = createOrUpdateUserProfileMainUser;
        } catch (error) {
            logError(error, fileDetails, true);
            result.message = error.message;
        }
        return result;
    };
}

module.exports = ProfileService;
