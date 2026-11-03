'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Respostas_Questionario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Respostas_Questionario.belongsTo(models.Questionario, { foreignKey: 'questionario_id', as: 'ass_respostas_questionario' });
      Respostas_Questionario.hasMany(models.Respostas_Itens, { foreignKey: 'resposta_questionario_id', as: 'ass_respostas_questionario_itens' })
    }
  }
  Respostas_Questionario.init({
    data_resposta: DataTypes.DATEONLY,
    pontuacao_total: DataTypes.NUMERIC(10,2)
  }, {
    sequelize,
    modelName: 'Respostas_Questionario',
    tableName: 'Respostas_Questionarios'
  });
  return Respostas_Questionario;
};