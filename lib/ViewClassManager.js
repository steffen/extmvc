/**
 * @class ExtMVC.lib.ViewClassManager
 * @extends ExtMVC.lib.ClassManager
 * Customised class manager for views. Views differ from most other classes as they are namespaced
 * by view package, so they take namespace and name when registering.
 * VCM will attempt to recursively define view classes that extend others, so if a view's xtype hasn't
 * been registered with Ext.ComponentMgr yet, VCM will attempt to find that xtype by seeing if any of 
 * the other registered views have declared that xtype via the 'registerXType' property. If one is found,
 * VCM will either return its constructor if it is already defined, otherwise it will try to define it first,
 * again recursing up the inheritance stack if necessary. Example:
<pre>
  vcm.register('somePackage', 'someView', {
    xtype: 'anotherview' //this doesn't exist yet
  });
  
  //anotherview extends the 'myxtype' type, which hasn't been defined yet
  vcm.register('somePackage', 'someOtherView', {
    xtype: 'myxtype',
    registerXType: 'anotherview'
  });
  
  //myview extends panel, and is registered with the 'myxtype' xtype
  vcm.register('somepackage', 'myview', {
    xtype: 'panel',
    registerXType: 'myxtype'
  });
  
  When vcm.getConstructor('somepackage', 'someview') is called, it looks to see if 'anotherview' has
  been registered with Ext.ComponentMgr first. If it has, it just calls Ext.extend with the config included
  when registering 'someview', extending the constructor of 'anotherview', and returns the result.
  
  If 'anotherview' hasn't yet been registered with Ext.ComponentMgr, it is automatically defined first with
  this.define. In this case, the parent class of 'anotherview' ('myxtype') hasn't been defined yet either,
  so again the inheritance chain is automatically traversed, 'myview' is defined and registered to 'myxtype',
  and the resulting extended class constructor returned so that 'anotherview' can in turn be extended.
</pre>
 */
ExtMVC.lib.ViewClassManager = Ext.extend(ExtMVC.lib.ClassManager, {
  autoDefine: false,
  
  define: function define(name) {
    var overrides = this.getRegistered(name);
    var klass;
    
    console.log('defining ' + name);
    
    if (Ext.ComponentMgr.isRegistered(overrides.xtype)) {
      var constructor = this.getConstructorForXType(overrides.xtype);
      delete overrides.xtype;
      
      //extend the class, register it if required
      klass = Ext.extend(constructor, overrides);
      
      var newXType = overrides.registerXType;
      if (newXType) {
        Ext.reg(newXType, klass);
        this.xtypeLookup[newXType] = klass;
      }
      
    } else {
      for (var className in this.registeredClasses) {
        var value = this.registeredClasses[className];
        
        //extend the parent object and register the constructor
        if (value.registerXType == overrides.xtype) {
          klass = this.getConstructor(className.split('-')[0], className.split('-')[1]);
        }
      }
    }
    
    console.log(klass);
    
    this.constructors[name] = klass;
    
    this.fireEvent('class-defined', name, klass);
    
    return klass;
  },
  
  /**
   * Register works slightly differently for views because we use a namespace too,
   * so convert it here first
   */
  register: function register(namespace, name, config) {
    var viewName = this.buildName(namespace, name);
    
    ExtMVC.lib.ViewClassManager.superclass.register.call(this, viewName, config);
  },
  
  // getRegistered: function(namespace, name) {
  //   var viewName = this.buildName(namespace, name);
  //   
  //   return ExtMVC.lib.ViewClassManager.superclass.getRegistered.call(this, viewName);
  // },
  
  getConstructor: function getConstructor(namespace, name) {
    var viewName = this.buildName(namespace, name);
    
    console.log('getting ' + viewName);
    
    return ExtMVC.lib.ViewClassManager.superclass.getConstructor.call(this, viewName);
  },
  
  xtypeLookup: {
    box           : Ext.BoxComponent,
    button        : Ext.Button,
    buttongroup   : Ext.ButtonGroup,
    colorpalette  : Ext.ColorPalette,
    component     : Ext.Component,
    container     : Ext.Container,
    cycle         : Ext.CycleButton,
    dataview      : Ext.DataView,
    datepicker    : Ext.DatePicker,
    editor        : Ext.Editor,
    editorgrid    : Ext.grid.EditorGridPanel,
    flash         : Ext.FlashComponent,
    grid          : Ext.grid.GridPanel,
    listview      : Ext.ListView,
    panel         : Ext.Panel,
    progress      : Ext.ProgressBar,
    propertygrid  : Ext.grid.PropertyGrid,
    slider        : Ext.Slider,
    spacer        : Ext.Spacer,
    splitbutton   : Ext.SplitButton,
    tabpanel      : Ext.TabPanel,
    treepanel     : Ext.tree.TreePanel,
    viewport      : Ext.ViewPort,
    'window'      : Ext.Window,
    
    paging        : Ext.PagingToolbar,
    toolbar       : Ext.Toolbar,
    tbbutton      : Ext.Toolbar.Button,
    tbfill        : Ext.Toolbar.Fill,
    tbitem        : Ext.Toolbar.Item,
    tbseparator   : Ext.Toolbar.Separator,
    tbspacer      : Ext.Toolbar.Spacer,
    tbsplit       : Ext.Toolbar.SplitButton,
    tbtext        : Ext.Toolbar.TextItem,

    menu          : Ext.menu.Menu,
    colormenu     : Ext.menu.ColorMenu,
    datemenu      : Ext.menu.DateMenu,
    menubaseitem  : Ext.menu.BaseItem,
    menucheckitem : Ext.menu.CheckItem,
    menuitem      : Ext.menu.Item,
    menuseparator : Ext.menu.Separator,
    menutextitem  : Ext.menu.TextItem,
    
    form          : Ext.FormPanel,
    checkbox      : Ext.form.Checkbox,
    checkboxgroup : Ext.form.CheckboxGroup,
    combo         : Ext.form.ComboBox,
    datefield     : Ext.form.DateField,
    displayfield  : Ext.form.DisplayField,
    field         : Ext.form.Field,
    fieldset      : Ext.form.FieldSet,
    hidden        : Ext.form.Hidden,
    htmleditor    : Ext.form.HtmlEditor,
    label         : Ext.form.Label,
    numberfield   : Ext.form.NumberField,
    radio         : Ext.form.Radio,
    radiogroup    : Ext.form.RadioGroup,
    textarea      : Ext.form.TextArea,
    textfield     : Ext.form.TextField,
    timefield     : Ext.form.TimeField,
    trigger       : Ext.form.TriggerField,

    chart         : Ext.chart.Chart,
    barchart      : Ext.chart.BarChart,
    cartesianchart: Ext.chart.CartesianChart,
    columnchart   : Ext.chart.ColumnChart,
    linechart     : Ext.chart.LineChart,
    piechart      : Ext.chart.PieChart,

    arraystore    : Ext.data.ArrayStore,
    directstore   : Ext.data.DirectStore,
    groupingstore : Ext.data.GroupingStore,
    jsonstore     : Ext.data.JsonStore,
    simplestore   : Ext.data.SimpleStore,
    store         : Ext.data.Store,
    xmlstore      : Ext.data.XmlStore
  },

  /**
   * Finds the constructor for a registered xtype.
   * FIXME: This uses a horrible hack and really shouldn't be here at all - the reason being that Ext.ComponentMgr
   * hides its registered types locally, 
   * @param {String} xtype The xtype to retrieve a constructor for
   * @return {Function} The constructor for the xtype requested
   */
  getConstructorForXType: function getConstructorForXType(xtype) {
    // //recursive function declared locally as it shouldn't be needed and therefore shouldn't be in the api...
    // var r = function(obj) {
    //   var constructor;
    //   
    //   for (var key in obj) {
    //     var value = obj[key];
    //     
    //     if (value != undefined && key != 'prototype' && key != 'createInterceptor' && key != 'createCallback' && key != 'createDelegate' && key != "defer" && key != 'createSequence') {
    //       if (value.xtype != undefined) {
    //         constructor = value;
    //       } else if (Ext.isObject(value) || Ext.isFunction(value)) {
    //         console.log(value);
    //         constructor = r(value);
    //       }
    //     }
    //   }
    //   
    //   return constructor;
    // };
    // 
    // var a = r(Ext);
    // 
    // return a;
    
    return this.xtypeLookup[xtype];
  },
  
  /**
   * Because views are named by namespace and name, we need to turn these 2 names into 1
   * to be able to register them, which is what this function does
   * @param {String} namespace The view namespace
   * @param {String} name The view name
   * @return {String} The composited view name (defaults to "{namespace}-{name}")
   */
  buildName: function buildName(namespace, name) {
    return String.format("{0}-{1}", namespace, name);
  }
});

ExtMVC.registerClassManager('view', new ExtMVC.lib.ViewClassManager());