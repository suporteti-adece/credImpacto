'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Questionario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Questionario.hasMany(models.Pergunta, { foreignKey: 'questionario_id', as: 'ass_questionario_pergunta' });
      Questionario.hasMany(models.Respostas_Questionario, { foreignKey: 'questionario_id', as: 'ass_questionario_respostas' })
    }
  }
  Questionario.init({
    nome: DataTypes.STRING(200),
    descricao: DataTypes.STRING(500),
    ativo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Questionario',
    tableName: 'Questionarios'
  });
  return Questionario;
};