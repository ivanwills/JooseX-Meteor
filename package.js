Package.describe({
    summary: "JooseX-Meteor Roles"
});

Package.on_use(function(api) {
    api.use('joose', ['client', 'server']);

    api.add_files('lib/JooseX/Meteor.js', ['server', 'client']);
});

