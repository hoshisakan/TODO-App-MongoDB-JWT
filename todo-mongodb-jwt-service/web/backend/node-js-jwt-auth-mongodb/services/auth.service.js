const UnitOfWork = require('../repositories/unitwork');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const { printErrorDetails, log } = require('../utils/debug.util');
const config = require('../config/auth.config');
const User = require('../models/user.model');
const DebugHelper = require('../utils/debug.util');

class AuthService {
    constructor() {
        const unitOfWork = new UnitOfWork();
        this.unitOfWork = unitOfWork;
        this.tokenExpirationTime = process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME;
    }

    signup = async (user) => {
        let userCreated = null;
        let result = null;

        try {
            if (!user) {
                throw new Error('User cannot be empty');
            }

            const registerUser = new User({
                username: user.username,
                email: user.email,
                password: bcrypt.hashSync(user.password, 8),
            });

            userCreated = await this.unitOfWork.users.create(registerUser);

            if (!userCreated) {
                throw new Error('User cannot be created');
            }

            if (user.roles) {
                const roles = await this.unitOfWork.roles.find({ name: { $in: user.roles } });

                if (!roles) {
                    throw new Error('Roles cannot be found');
                }

                if (roles.length !== user.roles.length) {
                    throw new Error('Roles one or more cannot be found');
                }

                result = await this.unitOfWork.users.addRoles(
                    userCreated._id,
                    roles.map((role) => role._id)
                );

                if (!result) {
                    throw new Error('Roles cannot be added');
                }

                // DebugHelper.log(result, true);
            } else {
                const role = await this.unitOfWork.roles.findOne({ name: 'user' });
                result = await this.unitOfWork.users.addRole(userCreated._id, role._id);
            }
        } catch (error) {
            printErrorDetails(error, true);
        }
        return result;
    };

    signin = async (user) => {
        log(`sigin username: ${user.username}, password: ${user.password}`, true);

        const validateUser = await this.unitOfWork.users.findOne({ username: user.username });

        if (!validateUser) {
            throw new Error('User Not Found');
        }

        log(validateUser, false);

        const matchPassword = bcrypt.compareSync(user.password, validateUser.password);

        if (!matchPassword) {
            throw new Error('Invalid Password');
        }

        const authorities = await this.unitOfWork.roles.find({ _id: { $in: validateUser.roles } });

        log(authorities, true);

        const token = jwt.sign({ id: validateUser.id }, config.secret, {
            expiresIn: this.tokenExpirationTime,
        });

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
