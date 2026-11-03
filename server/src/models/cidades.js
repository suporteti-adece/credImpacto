'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cidades extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Cidades.belongsTo(models.Regiao, { foreignKey: 'regiao_id', as: 'ass_municipio_regiao' });
      Cidades.hasMany(models.Cadastro, { foreignKey: 'cidade', as: 'ass_cidades_cadastro' });
      Cidades.hasMany(models.Agente, { foreignKey: 'cidade', as: 'ass_cidades_agente' });
      Cidades.belongsTo(models.Polo, { foreignKey: 'polo_id', as: 'ass_cidades_polo' });
      Cidades.hasMany(models.Bairro, { foreignKey: 'cidade', as: 'ass_cidades_bairro' });
    }
  }
  Cidades.init({
    nome_municipio: DataTypes.STRING,
    cod_ibge: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Cidades',
    tableName: 'Cidades'
  });
  return Cidades;
};