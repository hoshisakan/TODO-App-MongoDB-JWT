const UnitOfWork = require('../repositories/unitwork');
const http = require('../helpers/http.helper');
const { OK } = require('../helpers/constants.helper');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const DebugHelper = require('../utils/error.util');
const config = require('../config/auth.config');

class AuthService {
    constructor() {
        const unitOfWork = new UnitOfWork();
        this.unitOfWork = unitOfWork;
        this.tokenExpirationTime = process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME;
    }

    signup = async (user) => {
        const userCreated = await this.unitOfWork.users.create(user);

        if (!userCreated) {
            throw new Error('User cannot be created');
        }

        if (user.roles) {
            const roles = await this.unitOfWork.roles.find({ name: { $in: user.roles } });
            await this.unitOfWork.users.addRoles(
                userCreated._id,
                roles.map((role) => role._id)
            );
        } else {
            const role = await this.unitOfWork.roles.findOne({ name: 'user' });
            await this.unitOfWork.users.addRole(userCreated._id, role._id);
        }

        return userCreated;
    };

    signin = async (user) => {
        DebugHelper.log(`sigin username: ${user.username}, password: ${user.password}`, true);

        const validateUser = await this.unitOfWork.users.findOne({ username: user.username });

        if (!validateUser) {
            throw new Error('User Not Found');
        }

        DebugHelper.log(validateUser, false);

        const matchPassword = bcrypt.compareSync(user.password, validateUser.password);

        if (!matchPassword) {
            throw new Error('Invalid Password');
        }

        const authorities = await this.unitOfWork.roles.find({ _id: { $in: validateUser.roles } });

        DebugHelper.log(authorities, true);

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
