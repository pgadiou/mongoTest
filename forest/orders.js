const { collection } = require('forest-express-mongoose');

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection('orders', {
    actions: [{
      name: 'Add item to order',
      type: 'single',
      fields: [{
        field: 'item',
        type: 'String',
        reference: 'items.id'
      },{
        field: 'quantity',
        type: 'Number'
      }]
    }],
    fields: [{
        field: 'order_items',
        type: ['String'],
        reference: 'order_items.id'
      }],
    segments: [],
});
