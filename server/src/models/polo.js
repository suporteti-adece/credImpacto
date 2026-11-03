'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Polo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Polo.hasMany(models.Cidades, { foreignKey: 'polo_id', as: 'ass_polo_cidade' })
      Polo.hasMany(models.Bairro, { foreignKey: 'polo_id', as: 'ass_polo_bairro' })
      Polo.hasMany(models.Agente, { foreignKey: 'polo_id', as: 'ass_polo_agente' })
    }
  }
  Polo.init({
    nome_polo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Polo',
    tableName: 'Polos'
  });
  return Polo;
};