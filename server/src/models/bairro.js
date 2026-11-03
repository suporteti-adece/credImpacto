'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bairro extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Bairro.belongsTo(models.Cidades, { foreignKey: 'cidade', as: 'ass_bairro_cidade' });
      Bairro.belongsTo(models.Polo, { foreignKey: 'polo_id', as: 'ass_bairro_polo' });
    }
  }
  Bairro.init({
    nome_bairro: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Bairro',
    tableName: 'Bairros'
  });
  return Bairro;
};