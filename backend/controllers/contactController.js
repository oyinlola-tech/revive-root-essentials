const { Contact } = require('../models');
const catchAsync = require('../utils/catchAsync');

exports.submitContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.create(req.body);
  res.status(201).json({ message: 'Contact form submitted successfully' });
});

exports.getAllContacts = catchAsync(async (req, res, next) => {
  const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
  res.json(contacts);
});