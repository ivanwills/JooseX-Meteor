
/**
 * The JooseX.Meteor class currently doesn't have an object methods or
 * attributes but it does have class method helpers
 */
var meteor = Class(
    "JooseX.Meteor",
    {
    }
);
/**
 * @param : object - the class to be made EJSONabl should extend the
 *                   JooseX.Meteor.EJSON Role.
 *
 * Adds a Class to the EJSON processor.
 */
Meteor.addEJSON = function(object) {
    var constructor = object.constructor;
    EJSON.addType(object.meta.name, function (value) {
        return new object(value);
    });
};

/**
 * Role for adding a generic clone method to a Class
 */
var role = Role(
    "JooseX.Meteor.Clonable",
    {
        methods : {
            clone: function () {
                return _.clone(this);
            },
        }
    }
);
JooseX.Meteor.Cloneable = role;

/**
 * Role to add the methods needed by the EJSON object to encode/decode
 * an object.
 */
Role(
    "JooseX.Meteor.EJSON",
    {
        does : JooseX.Meteor.Cloneable,
        after : {
            initialize : function () {
                // setup EJSON for this object
                if ( !EJSON._isCustomType(this) ) {
                    var constructor = this.constructor
                    EJSON.addType(this.meta.name, function (value) {
                        return new constructor(value);
                    });
                }
            }
        },
        methods : {
            BUILD : function (data) {
                // convert EJSON objects
                if ( data && data.$type && data.$value ) {
                    return data.$value;
                }

                return data;
            },
            equals: function (other) {
                if (!(other instanceof this.constructor))
                    return false;

                var self    = this;
                var matches = true;
                this.meta.getAttributes().eachAll(function (attribute, name, isOwn) {
                    matches = matches && self[ attribute.slot ] == other[ attribute.slot ];
                });

                return matches;
            },
            typeName: function () {
                return this.meta.name;
            },
            toJSONValue: function () {
                var self = this;
                var json = {};
                this.meta.getAttributes().eachAll(function (attribute, name, isOwn) {
                    var value;
                    if ( self[ attribute.slot ] instanceof Array ) {
                        value = [];
                        for ( var i in self[ attribute.slot ] )
                            value[i] = EJSON.toJSONValue( self[ attribute.slot ][i] );
                    }
                    else if ( self[ attribute.slot ] instanceof Object ) {
                        value = {};
                        for ( var i in self[ attribute.slot ] )
                            value[i] = EJSON.toJSONValue( self[ attribute.slot ][i] );
                    }
                    else {
                        value = _.clone( self[ attribute.slot ] );
                    }
                    json[ name ] = value;
                });

                return json;
            }
        }
    }
);

/**
 * Role to make a Joose attribute a Meteor responsive data source.
 */
Role(
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
                    self.ensureDeps().depend();

                    return original.call(this);
                }
            },
            getSetter : function (value) {
                var original = this.SUPER();
                var self     = this;

                return function () {
                    self.ensureDeps(key).changed();

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

