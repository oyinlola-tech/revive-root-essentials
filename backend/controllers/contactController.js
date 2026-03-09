const { Contact } = require('../models');
const catchAsync = require('../utils/catchAsync');
const Logger = require('../utils/Logger');
const notificationService = require('../services/notificationService');

const logger = new Logger('ContactController');

exports.submitContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.create({
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    subject: String(req.body.subject || '').trim(),
    message: String(req.body.message || '').trim(),
  });

  notificationService.sendAdminContactAlert(contact).catch((error) => {
    logger.error('Failed to send admin contact alert', error, {
      contactId: contact.id,
      subject: contact.subject,
    });
  });

  res.status(201).json({ message: 'Contact form submitted successfully' });
});

exports.getAllContacts = catchAsync(async (req, res, next) => {
  const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
  res.json(contacts);
});
