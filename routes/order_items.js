const express = require('express');
const router = express.Router();

const Liana = require('forest-express-mongoose');
const models = require('../models');

// this is a quick and dirty hack to obtain the orderId from the referer url - a proper way to go about it would be to include a regex
function getOrderIdFromUrl(referer){
  let splitReferer = referer.split('/');
  return splitReferer.includes('summary')? splitReferer[splitReferer.length-2] : splitReferer[splitReferer.length-3];

}

function getOrder(orderId){
  return models.orders.findOne({_id: `${orderId}`})
}

function getItems(itemIds){
  return models.items.find({_id: {$in: itemIds}})
}

async function updateItemsQuantity(req){
  // STEP 1: get the current order using the current url
  let orderId = getOrderIdFromUrl(req.headers.referer)
  let order = await getOrder(orderId);

  // STEP 2: get the items selected
  let itemIds = req.body.data.attributes.ids;
  let items = await getItems(itemIds);

  // STEP 3: iterate on the items array to update the value of items selected
  let newItemQuantity = req.body.data.attributes.values.Quantity;
  for (const item of items) {
    order.itemQtyBySku[item.sku] = newItemQuantity;
  }

  // STEP 4: update the order with the new itemQtyBySu
  return models.orders.findOneAndUpdate(
    { _id: `${orderId}` },
    { $set: { 'itemQtyBySku' : order.itemQtyBySku } }
  )
}

router.post('/actions/change-item-quantity', Liana.ensureAuthenticated, (req, res) => {
  updateItemsQuantity(req)
  res.send({ success: 'Updated order!'})
});

module.exports = router;