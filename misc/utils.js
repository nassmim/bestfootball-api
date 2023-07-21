"use strict";
const crypto = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const key = fs.readFileSync(__dirname + '/key', 'utf8');

module.exports = {
	generateToken(payload, expires = false)	{
		return jwt.sign(payload, process.env.JWT_SIGNING_KEY);
	},
	validateToken(token)	{
		try {
			return jwt.verify(token, process.env.JWT_SIGNING_KEY);
		} catch(e) {
			return false;
		}
	},
	hashPassword: function(password)	{
	    let salt = crypto.randomBytes(256).toString('base64');
	    let iterations = 42000;
	    let hash = crypto.pbkdf2Sync(password, salt, iterations, 512, 'sha512');

	    return {
	        salt: salt,
	        hash: hash.toString('hex'),
	        iterations: iterations
	    };
	},
	hasData: function(requireds, data, keys)	{
		let tmp = data;
		if (keys)	{
			for (let i in keys)	{
				tmp = tmp[keys[i]];
			}
		}
		for (let i in requireds)	{
			if (typeof requireds[i] == 'object')	{
				if (!keys)	{
					keys = [];
				}
				keys.push(i);
				let dataCheck = hasData(requireds[i], data, keys)
				if (!dataCheck.isGood)	{
					return {"isGood": false, "err": dataCheck.err};
				}
			}
			else	{
				if (typeof tmp[i] != requireds[i])	{
					return {"isGood": false, "err": (keys ? keys.join(' - ') + ' - ' : '') + i};
				}
			}
		}
		return {"isGood": true};
	},
	sendMail: function(to, subject, text, html)	{
	    let transporter = nodemailer.createTransport({
	        host: config.mailer.host,
	        port: config.mailer.port,
	        secure: false,
	        auth: {
	            user: config.mailer.user,
	            pass: config.mailer.pass
	        }
	    });

	    transporter.sendMail({
	        from: '"' + config.mailer.fromName + '" ' + config.mailer.user,
	        to: to,
	        subject: subject,
	        text: text,
	        html: html
	    }, (error, info) => {
	        if (error) {
	            return console.log(error);
	        }
	        console.log('Message sent: %s', info.messageId);
	    });
	}
}
