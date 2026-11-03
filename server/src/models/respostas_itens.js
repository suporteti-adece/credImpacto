'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Respostas_Itens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Respostas_Itens.belongsTo(models.Pergunta, { foreignKey: 'pergunta_id', as: 'ass_respostas_itens_pergunta' });
      Respostas_Itens.belongsTo(models.Respostas_Questionario, { foreignKey: 'resposta_questionario_id', as: 'ass_respostas_itens_questionario' });
      Respostas_Itens.belongsTo(models.Alternativa, { foreignKey: 'alternativa_id', as: 'ass_respostas_itens_alternativa' });
    }
  }
  Respostas_Itens.init({
    peso: DataTypes.NUMERIC(10,2)
  }, {
    sequelize,
    modelName: 'Respostas_Itens',
    tableName: 'Respostas_Itens'
  });
  return Respostas_Itens;
};