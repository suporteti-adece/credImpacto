'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Profile.hasMany(models.Cadastro, { foreignKey: 'profile_id', as: 'ass_profile_cadastro' });
      Profile.hasMany(models.Agente, { foreignKey: 'profile_id', as: 'ass_profile_Agente' });
    }
  }
  Profile.init({
    perfil: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'Profiles'
  });
  return Profile;
};