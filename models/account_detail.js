module.exports = function (orm, db) {
  var AccountInfo = db.define('account_detail', {
    fullname: { type: 'text', required: true,  big:  true },
    email: { type: 'text', required: true, unique: true, big:  true },
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
      email: [
        orm.enforce.patterns.email("The email address is not valid"),
        orm.enforce.ranges.length(undefined, 256, "cannot be longer than 256 letters")
      ],
    },
    methods: {}
  });
  // This is read 'AccountInfo belongs to Account'.
  // Because ORM2 only has hasOne for both has and belong.
  AccountInfo.hasOne("account", db.models.account, {reverse: 'account_detail'});
};
