'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cadastro extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Cadastro.belongsTo(models.Cidades, { foreignKey: 'cidade', as: 'ass_cadastro_cidade' })
      Cadastro.belongsTo(models.Profile, { foreignKey: 'profile_id', as: 'ass_cadastro_profile' });
      Cadastro.hasMany(models.Anexo, { foreignKey: 'cadastro_id', as: 'ass_cadastro_anexo' });
      
    }
  }
  Cadastro.init({
    tipo_proponente: DataTypes.STRING,
    nome_responsavel: DataTypes.STRING,
    cpf: DataTypes.STRING,
    telefone: DataTypes.STRING,
    email: DataTypes.STRING,
    cnpj: DataTypes.STRING,
    user_active: DataTypes.BOOLEAN,
    password: DataTypes.STRING,
    user_pin: DataTypes.STRING(6),
    nome_empreendimento: DataTypes.STRING,
    cep: DataTypes.STRING,
    bairro: DataTypes.STRING,
    rua: DataTypes.STRING,
    numero: DataTypes.STRING,
    complemento: DataTypes.STRING,
    linha_credito: DataTypes.STRING,
    iniciativa_impacto: DataTypes.STRING,
    cadastro_cadimpacto: DataTypes.STRING,
    // status_atual: DataTypes.STRING,
    // area_atuacao: DataTypes.STRING,
    resumo_negocio: DataTypes.STRING(1500),
    aceite_termos: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Cadastro',
    tableName: 'Cadastros',
  });
  return Cadastro;
};