
/**
 * The JooseX.Meteor class currently doesn't have an object methods or
 * attributes but it does have class method helpers
 */
Class( "JooseX.Meteor", {} );

/**
 * @name : JooseX.Meteor.Clonable
 *
 * Role for adding a generic clone method to a Class
 *
 * eg:
 *  Class(
 *      "MyClass",
 *      trait : JooseX.Meteor.Clonable,
 *      has : {
 *          att1 : { is : "rw" },
 *          att2 : { is : "rw" }
 *      },
 *      methods : {
 *      }
 *  );
 *  var myobject  = new MyClass({ att1 : true, attr2 : 33 });
 *  var myobject2 = myobject.clone();
 *  myobject2.setAtt1(false);
 *
 *  if ( myobject.att1 == myobject2.att1 ) throw "Not cloned";
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
 * @param : object - the class to be made EJSONabl should extend the
 *                   JooseX.Meteor.EJSON Role.
 *
 * Adds a function to help with the installing of EJSON types
 */
Meteor.addEJSON = function(object) {
    var constructor = object.constructor;
    EJSON.addType(object.meta.name, function (value) {
        return new object(value);
    });
};

/**
 * @name : JooseX.Meteor.EJSON
 *
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
                if ( EJSON && !EJSON._isCustomType(this) ) {
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

