module.exports = function (orm, db) {
  var Account = db.define('account', {
    name: { type: 'text', required: true, unique: true, big:  true },
    password: { type: 'text', required: true},
    createdAt: { type: 'date', required: true, time: true},
    updatedAt: { type: 'date', required: true, time: true}
  },
  {
    hooks: {
      beforeValidation: function (next) {
        if (!this.createdAt) this.createdAt = new Date();
        this.updatedAt = new Date();
        next();
      }
    },
    validations: {
      password: [
        orm.enforce.ranges.length(8, undefined, "must be atleast 8 letter long"),
        orm.enforce.ranges.length(undefined, 256, "cannot be longer than 256 letters")
      ],
    },
    methods: {}
  });
};
