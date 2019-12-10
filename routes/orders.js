const express = require('express');
const { PermissionMiddlewareCreator } = require('forest-express-mongoose');
const models = require('../models');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('orders');

const Liana = require('forest-express-mongoose');

// This file contains the logic of every route in Forest Admin for the collection orders:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v5/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v5/reference-guide/actions/create-and-manage-smart-actions

// Create a Order
router.post('/orders', permissionMiddlewareCreator.create(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v5/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Order
router.put('/orders/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v5/reference-guide/routes/default-routes#update-a-record
  next();
});

// Delete a Order
router.delete('/orders/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v5/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Orders
router.get('/orders', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v5/reference-guide/routes/default-routes#get-a-list-of-records
  next();
});

// Get a number of Orders
router.get('/orders/count', permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v5/reference-guide/routes/default-routes#get-a-number-of-records
  next();
});

// Get a Order
router.get('/orders/:recordId', permissionMiddlewareCreator.details(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v5/reference-guide/routes/default-routes#get-a-record
  next();
});

// Export a list of Orders
router.get('/orders.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v5/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

function getOrder(orderId) {
  return models.orders.findOne({ _id: orderId });
}

function getItem(itemId) {
  return models.items.findOne({ _id: itemId });
}

async function addOrderItem(req, res) {
  let order = await getOrder(req.body.data.attributes.ids[0])
  let item = await getItem(req.body.data.attributes.values.item);
  let newItemQuantity = req.body.data.attributes.values.quantity;
  order.itemQtyBySku[item.sku] = newItemQuantity;
  const equalItemId = (element) => element == item.id;
  if (!order.items.some(equalItemId)) {
    order.items.push(item.id)
  } else {
    return res.status(400).send({ error: 'Item already exists for this order!' });
  }
  try {
    await models.orders.findOneAndUpdate(
      { _id: req.body.data.attributes.ids[0] },
      { $set: { 'items' : order.items, 'itemQtyBySku': order.itemQtyBySku } }
    );
  } catch (e) {
    return res.status(400).send({ error: e });
  } 
  return res.send({ 
    success: 'Updated order!',
    refresh: { relationships: ['order_items'] }
  });
}

const orderItemsSerializer = new JSONAPISerializer('order_items', {
  attributes: ['description', 'picture', 'sku', 'quantity'],
  id: '_id'
});

function getItems(itemsIds) {
  return models.items.aggregate([
    { "$match": { "_id": {"$in": itemsIds} } }
  ]);
}

function addQuantity(order, items) {
  return items.map(item => {
    item.quantity = order.itemQtyBySku[item.sku];
    return item;
  })
}

async function getOrdersItems(req, res) {
  let order = await getOrder(req.params.recordId);
  let items = await getItems(order.items);
  let itemWithQuantity = addQuantity(order, items);
  let orderItems = orderItemsSerializer.serialize(itemWithQuantity);
  return res.send(orderItems);
}

router.post('/actions/add-item-to-order', Liana.ensureAuthenticated, (req, res)=> {
  addOrderItem(req, res);
});

router.get('/orders/:recordId/relationships/order_items',
permissionMiddlewareCreator.details(), (req, res, next) => {
  getOrdersItems(req, res);
})

module.exports = router;
