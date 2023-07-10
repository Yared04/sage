const Joi = require("@hapi/joi");
//register validation

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(2).required(),
    email: Joi.string().min(3).required().email(),
    password: Joi.string().min(2).required(),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(3).required().email(),
    password: Joi.string().min(2).required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
