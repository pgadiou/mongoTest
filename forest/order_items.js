const { collection } = require('forest-express-mongoose');

collection('order_items', {
  fields: [{
      field: 'description',
      type: 'String',
    }, {
      field: 'picture',
      type: 'String',
    }, {
      field: 'sku',
      type: 'Number',
    },{
      field: 'quantity',
      type: 'Number',
  }],
  actions: [{
    name: 'Change item quantity',
    type: 'bulk',
    fields: [{
      field: 'Quantity',
      type: "Number"
    }],
  }]
});