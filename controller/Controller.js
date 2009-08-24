/**
 * @class ExtMVC.controller.Controller
 * @extends Ext.util.Observable
 * <h1>Controllers in Ext MVC</h1>
 * <p>Controllers are the glue that stick applications together. They listen to events emitted by the UI as the user
 * clicks interface elements, and take actions as appropriate. The relevant action may be to create or save a model
 * instance, to render another view, to perform AJAX requests, or any other action.</p>
 * 
 * <p>Controllers should be kept skinny as far as possible - receive an event, then hand any processing off to the 
 * appropriate model. This ensures we can keep the code as DRY as possible and makes refactoring easier.</p>
 * 
 * <h2>Example Controller</h2>
 * Here is a simple example controller which renders a couple of views and listens to events:
<pre><code>
//simple controller which manages the Page model within our application
MyApp.controllers.PagesController = Ext.extend(ExtMVC.controller.Controller, {
  name: 'pages',

  //renders the 'Index' template and sets up listeners
  index: function() {
    this.render('Index', {
      listeners: {
        scope   : this,
        'edit'  : this.edit,
        'delete': this.destroy
      }
    });
  },

  //renders the 'Edit' template (let's say it's a FormPanel), and loads the instance
  edit: function(instance) {
    this.render('Edit', {
      listeners: {
        scope  : this,
        save   : this.update,
        cancel : function() {
          alert("You cancelled the update!");
        }
      }
    }).loadRecord(instance);
  },

  //when the 'delete' event is fired by our 'Index' template (see the index action), this method is called.
  //In this fictional example, we assume that the templates 'delete' event was called with the single argument
  //of the Page instance the user wishes to destroy
  destroy: function(instance) {
    instance.destroy({
      success: function() {
        alert("The Page was deleted");
        //at this point we might render another page for the user to look at
      },
      failure: function() {
        alert('Curses! The Page could not be deleted');
      }
    });
  },

  //when the 'save' event is fired by our 'Edit' template, this method is called.
  //Again, we assume that our template fired the event with the Page instance, and also an object with updates
  update: function(instance, updates) {
    //this applies the updates to the model instance and saves
    instance.update(updates, {
      success: function(updatedInstance) {
        alert('Success! It saved');
        //at this point we might render another page for the user to look at
      },
      failure: function(updatedInstance) {
        alert('Darn it. Did not save');

        //here we're firing the controller's update-failed event, which the view can pick up on
        //The view can simply listen to our Pages controller and add errors from this instance to the form
        //using form.markInvalid(instance.errors.forForm())
        this.fireEvent('update-failed', instance);
      };
    });
  },

   //Sets up events emitted by this controller. Controllers are expected to fire events, so this method is called
   //automatically when a controller is instantiated. Don't forget to call super here
  initEvents: function() {
    this.addEvents(
      //this event will be fired when the controller can't update a Page instance
      'update-failed'
    );

    MyApp.controllers.PagesController.superclass.initEvents.apply(this, arguments);
  }
})
</code></pre>
 * Note that many of the methods above are provided by the {@link ExtMVC.controller.CrudController CrudController}
 * 
 * <h2>Rendering Views</h2>
 * Each controller can automatically render view classes inside its views package. In the Pages controller above the
 * views package is MyApp.views.pages - the application itself is called MyApp, and the 'pages' segment comes from the
 * controller's 'name' property
 * <br />
 * <br />
 * In the example above, the line: <pre><code>this.render('Edit', {})</code></pre> will automatically find the
 * MyApp.views.pages.Edit class, with the second argument to this.render being a config argument passed to the view's constructor.
 * 
 * <br />
 * <h4>Rendering strategies</h4>
 * Not all applications will render views in the same way
 */
// ExtMVC.controller.Controller = Ext.extend(Ext.util.Observable,
ExtMVC.registerController('controller', {

  // onExtended: function() {
  //   if (this.name != null) {
  //     this.viewsPackage = Ext.ns(String.format("{0}.views.{1}", ExtMVC.name, this.name));
  //     
  //     ExtMVC.registerController(this.name, this.constructor);
  //   }
  // },
  
  constructor: function(config) {
    Ext.util.Observable.prototype.constructor.apply(this, arguments);
    
    Ext.apply(this, config || {});
    
    this.initEvents();
    this.initListeners();
  },
  
  /**
   * Sets up events emitted by this controller. This defaults to an empty function and is
   * called automatically when the controller is constructed so can simply be overridden
   */
  initEvents: function() {},
  
  /**
   * Sets up events this controller listens to, and the actions the controller should take
   * when each event is received.  This defaults to an empty function and is called when
   * the controller is constructed so can simply be overridden
   */
  initListeners: function() {},
  
  /**
   * Shows the user a notification message. Usually used to inform user of a successful save, deletion, etc
   * This is an empty function which you must implement yourself
   * @param {String} notice The string notice to display
   */
  showNotice: function(notice) {},
  
  /**
   * Returns the view class registered for the given view name, or null
   * @param {String} viewName The name registered for this view with this controller
   * @return {Function/null} The view class (or null if not present)
   */
  getViewClass: function getViewClass(viewName) {
    return ExtMVC.getView(this.name, viewName);
  },
  
  /**
   * @property addTo
   * @type Ext.Container
   * The container to add views to using the 'add' renderMethod.  Usually set to an Ext.TabPanel instance or similar
   */
  addTo: null,
  
  /**
   * Renders a given view name in the way set up by the controller.  For this to work you must have passed a 
   * 'name' property when creating the controller, which is automatically used to find the view namespace for
   * this controller.  For example, in an application called MyApp, and a controller with a name of 'users',
   * the view namespace would be MyApp.views.users, and render('Index') would search for a class called
   * MyApp.views.users.Index and instantiate it with the passed config.
   * An error is thrown if the view could not be found.
   * @param {String} viewName The name of the view class within the view namespace used by this controller
   * @param {Object} config Configuration options passed through to the view class' constructor
   * @return {Ext.Component} The view object that was just created
   */
  render: function render(viewName, config) {
    //config for the view constructor
    config = config || {};
    
    //we also use this constructor object to define whether or not the view should be added to the default
    //container or not
    Ext.applyIf(config, { 
      autoAdd: true,
      addTo  : ExtMVC.app.addToTarget
    });

    var viewC = this.getViewClass(viewName);
    
    if (typeof viewC == "function") {
      var view = new viewC(config);
      
      //add to the Application's main container unless specifically told not do
      if (config.autoAdd === true) {
        // config.addTo.removeAll();
        // config.addTo.doLayout();
        
        config.addTo.add(view);
        config.addTo.doLayout();
        config.addTo.activate(view);
      }
      // if (this.addTo) this.renderViaAddTo(view);
      
      return view;
    } else {
      throw new Error(String.format("View '{0}' not found", viewName));
    }
  }
  
  // /**
  //  * Adds the given component to this application's main container.  This is usually a TabPanel
  //  * or similar, and must be assigned to the controllers addTo property.  By default,
  //  * this method removes any other items from the container first, then adds the new component
  //  * and calls doLayout
  //  * @param {Ext.Component} component The component to add to the controller's container
  //  */
  // renderViaAddTo: function renderViaAddTo(component) {
  //   if (this.addTo != undefined) {
  //     this.addTo.removeAll();
  //     this.addTo.doLayout();        
  //     
  //     this.addTo.add(component);
  //     this.addTo.doLayout();
  //   }
  // }
});