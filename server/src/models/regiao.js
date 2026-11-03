'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Regiao extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Regiao.hasMany(models.Cidades, { foreignKey: 'regiao_id', as: 'ass_regiao_municipio' })
    }
  }
  Regiao.init({
    nome: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Regiao',
    tableName: 'Regiaos'
  });
  return Regiao;
};