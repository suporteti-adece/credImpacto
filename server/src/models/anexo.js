'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Anexo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Anexo.belongsTo(models.Cadastro, { foreignKey: 'cadastro_id', as: 'ass_anexo_cadastro' })
    }
  }
  Anexo.init({
    tipo_anexo: DataTypes.STRING,
    mimetype: DataTypes.STRING,
    filename: DataTypes.STRING,
    path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Anexo',
    tableName: 'Anexos'
  });
  return Anexo;
};