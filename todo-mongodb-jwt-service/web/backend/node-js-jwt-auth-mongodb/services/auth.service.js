var bcrypt = require('bcryptjs');
const { logInfo, logError } = require('../utils/log.util');
const { stringify } = require('../utils/json.util');
const { filenameFilter } = require('../utils/regex.util');

const { jwtSign } = require('../utils/jwt.util');
const UnitOfWork = require('../repositories/unitwork');
const User = require('../models/mongodb/user.model');
const unitOfWork = new UnitOfWork();


class AuthService {
    constructor() {
        this.unitOfWork = unitOfWork;
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

    findUserById = async (id) => {
        if (!id) {
            throw new Error('User id cannot be empty.');
        }
        return await this.unitOfWork.users.findById(id);
    };

    findUserRolesById = async (userId) => {
        if (!userId) {
            throw new Error('User id cannot be empty.');
        }

        const user = await this.findUserById(userId);

        if (!user) {
            throw new Error('User not found.');
        }

        return await this.unitOfWork.roles.find({
            _id: { $in: user.roles },
        });
    };

    generateJwtToken = (validateUser, roleName) => {
        if (!validateUser) {
            throw new Error('User cannot be empty');
        }

        if (!roleName) {
            throw new Error('Role name cannot be empty');
        }

        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        let tokenExpirationTime = -1;

        switch (roleName) {
            case 'admin':
                tokenExpirationTime = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_TIME_FOR_ADMIN, 10);
                break;
            case 'moderator':
                tokenExpirationTime = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_TIME_FOR_MODERATOR, 10);
                break;
            case 'user':
                tokenExpirationTime = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_TIME_FOR_USER, 10);
                break;
            default:
                throw new Error('Role name is invalid');
        }

        if (tokenExpirationTime === -1) {
            throw new Error('Token expiration time is invalid');
        }

        const payload = {
            id: validateUser.id,
        };

        logInfo(
            `payload: ${stringify(payload)}, roleName: ${roleName}, tokenExpirationTime: ${tokenExpirationTime}`,
            fileDetails,
            true
        );

        return jwtSign(payload, tokenExpirationTime);
    };

    signup = async (user) => {
        let userCreated = null;
        let result = null;
        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        try {
            if (!user) {
                throw new Error('User cannot be empty');
            }

            logInfo(`user: ${stringify(user)}`, fileDetails, true);

            const roles = await this.unitOfWork.roles.find({ name: { $in: user.roles } });

            if (!roles) {
                throw new Error('Roles cannot be found');
            }

            if (roles.length !== user.roles.length) {
                throw new Error('Roles one or more cannot be found');
            }

            logInfo(`roles: ${stringify(roles)}`, fileDetails, true);
            
            const registerUser = new User({
                username: user.username,
                email: user.email,
                password: bcrypt.hashSync(user.password, 8),
            });

            userCreated = await this.unitOfWork.users.create(registerUser);

            if (!userCreated) {
                throw new Error('User cannot be created');
            }

            if (user.roles && user.roles.length > 0) {
                result = await this.unitOfWork.users.addRoles(
                    userCreated._id,
                    roles.map((role) => role._id)
                );

                if (!result) {
                    throw new Error('Roles cannot be added');
                }
                logInfo(`result: ${stringify(result)}`, fileDetails, true);
            } else {
                const role = await this.unitOfWork.roles.findOne({ name: 'user' });
                result = await this.unitOfWork.users.addRole(userCreated._id, role._id);
            }
        } catch (err) {
            logError(err, fileDetails, true);
            throw err;
        }
        return result;
    };

    signin = async (user) => {
        if (!user) {
            throw new Error('User cannot be empty');
        }

        const classNameAndFuncName = this.getFunctionCallerName();
        const fileDetails = this.getFileDetails(classNameAndFuncName);

        logInfo(`sigin username: ${user.username}`, fileDetails, true);

        const validateUser = await this.unitOfWork.users.findOne({ username: user.username });

        if (!validateUser) {
            throw new Error('User Not Found');
        }

        logInfo(`validateUser: ${stringify(validateUser)}`, fileDetails, true);

        const matchPassword = bcrypt.compareSync(user.password, validateUser.password);

        if (!matchPassword) {
            throw new Error('Invalid Password');
        }

        const authorities = await this.unitOfWork.roles.find({ _id: { $in: validateUser.roles } });

        logInfo(`authorities: ${stringify(authorities)}`, fileDetails, true);

        const token = this.generateJwtToken(validateUser, authorities[0].name);

        logInfo(`token: ${token}`, fileDetails, true);

        const result = {
            id: validateUser._id,
            username: validateUser.username,
            email: validateUser.email,
            roles: authorities.map((role) => 'ROLE_' + role.name.toUpperCase()),
            accessToken: token,
        };
        return result;
    };
}

module.exports = AuthService;
