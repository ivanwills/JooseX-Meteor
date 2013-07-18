
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
meteor.addEJSON = function(object) {
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
                    json[ name ] = self[ attribute.slot ];
                });

                return json;
            }
        }
    }
);

