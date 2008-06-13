function defaultButton(options) {
  return new Ext.Toolbar.Button(options);
}

function defaultAddButton(options) {
  Ext.apply(this, options, {
    model: Ext.ux.MVC.model.Base,
    iconCls: 'add',
    text: 'Add',
    disabled: false,
    handler: function() {alert("If this message appears contact the programmers!");}
  });
  
  Ext.applyIf(this, {
    tooltip: 'Shows new ' + this.model.human_singular_name + ' form (shortcut key: a)'
  });
  
  return defaultButton(this);
}

function defaultEditButton(options) {
  Ext.apply(this, options, {
    model: Ext.ux.MVC.model.Base,
    iconCls: 'edit',
    text: 'Edit',
    disabled: true,
    handler: function() {alert("If this message appears contact the programmers!");}
  });
  
  Ext.applyIf(this, {
    tooltip: 'Edits all selected ' + this.model.human_plural_name + ' (shortcut key: e)'
  });
  
  return defaultButton(this);
}

function defaultDeleteButton(options) {
  Ext.apply(this, options, {
    model: Ext.ux.MVC.model.Base,
    iconCls: 'delete',
    text: 'Delete',
    disabled: true,
    handler: function() {alert("If this message appears contact the programmers!");}
  });
  
  Ext.applyIf(this, {
    tooltip: 'Deletes all selected ' + this.model.human_plural_name + ' (shortcut key: Delete)'
  });
  
  return defaultButton(this);
}