'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pergunta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Pergunta.belongsTo(models.Questionario, { foreignKey: 'questionario_id', as: 'ass_pergunta_questionario' });
      Pergunta.hasMany(models.Alternativa, { foreignKey: 'pergunta_id', as: 'ass_pergunta_alternativa' })
      Pergunta.hasMany(models.Respostas_Itens, { foreignKey: 'pergunta_id', as: 'ass_pergunta_respostas_itens' })
    }
  }
  Pergunta.init({
    descricao: DataTypes.STRING(500),
    ordem: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pergunta',
    tableName: 'Perguntas'
  });
  return Pergunta;
};