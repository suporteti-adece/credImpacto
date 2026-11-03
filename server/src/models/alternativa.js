'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alternativa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Alternativa.belongsTo(models.Pergunta, { foreignKey: 'pergunta_id', as: 'ass_alternativa_pergunta' });
      Alternativa.hasMany(models.Respostas_Itens, { foreignKey: 'alternativa_id', as: 'ass_alternativa_respostas_itens' })
    }
  }
  Alternativa.init({
    descricao: DataTypes.STRING(500),
    peso: DataTypes.NUMERIC(10,2)
  }, {
    sequelize,
    modelName: 'Alternativa',
    tableName: 'Alternativas',
  });
  return Alternativa;
};