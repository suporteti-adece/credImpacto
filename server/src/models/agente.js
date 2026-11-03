'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Agente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Agente.belongsTo(models.Cidades, { foreignKey: 'cidade', as: 'ass_agente_cidade' });
      Agente.belongsTo(models.Polo, { foreignKey: 'polo_id', as: 'ass_agente_polo' });
      Agente.belongsTo(models.Profile, { foreignKey: 'profile_id', as: 'ass_agente_profile' });
    }
  }
  Agente.init({
    nome: DataTypes.STRING,
    cpf: DataTypes.STRING,
    telefone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    user_active: DataTypes.BOOLEAN,
    user_pin: DataTypes.STRING,
    cep: DataTypes.STRING,
    bairro: DataTypes.STRING,
    rua: DataTypes.STRING,
    numero: DataTypes.STRING,
    complemento: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Agente',
    tableName: 'Agentes',
  });
  return Agente;
};