
/**
 * Role to make a Joose attribute a Meteor responsive data source.
 *
 * eg:
 *   Class(
 *     "MyClass",
 *     has {
 *       reactive : { is 'rw', traits : [ JooseX.Meteor.Attribute.Reactive ] }
 *     }
 *   );
 *   var me = new MyClass({ reactive : true });
 *
 *   // Reactive dependencies get set
 *   var answer = me.getReactive();
 *
 *   // Dependant code will be truggered by
 *   me.getReactive("set");
 *
 * Note: the is : 'rwc' type doesn't appear to correctly use the attribute
 * setter method so dependencies are never triggered.
 */
role = Role(
    "JooseX.Meteor.Attribute.Reactive",
    {
        has : {
            dep : { is : 'rwc' }
        },
        override : {
            getGetter : function () {
                var original = this.SUPER();
                var self     = this;

                return function () {
                    if (Meteor && Meteor.isClient) self.ensureDeps().depend();

                    return original.call(this);
                }
            },
            getSetter : function () {
                var original = this.SUPER();
                var self     = this;

                return function (value) {
                    if (Meteor && Meteor.isClient) self.ensureDeps().changed();

                    return original.call(this, value);
                }
            }
        },
        methods : {
            ensureDeps : function() {
                if (!this.dep())
                    this.dep( new Deps.Dependency );

                return this.dep();
            }
        }
    }
);
JooseX.Meteor.Attribute.Reactive = role;

