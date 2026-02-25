const { Contact } = require('../models');
const catchAsync = require('../utils/catchAsync');

exports.submitContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.create({
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    subject: String(req.body.subject || '').trim(),
    message: String(req.body.message || '').trim(),
  });
  res.status(201).json({ message: 'Contact form submitted successfully' });
});

exports.getAllContacts = catchAsync(async (req, res, next) => {
  const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
  res.json(contacts);
});
