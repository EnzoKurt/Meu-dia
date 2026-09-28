# Meu Dia

Aplicativo pessoal de planejamento diário e objetivos de médio/longo prazo.

## O que já está pronto

- Tarefas com data, horário, prioridade e lembrete.
- Concluir, editar e excluir tarefas.
- Notificação local na hora da tarefa.
- Objetivos com data-alvo, progresso e lembrete recorrente.
- Frequência de objetivo: diária, semanal ou mensal.
- Concluir e excluir objetivos.
- Dados salvos somente no aparelho com AsyncStorage.
- Tela de configurações com pedido de permissão para notificações.
- Botão para testar uma notificação em 10 segundos.
- Interface pensada primeiro para celular.

## Rodando no celular

1. Instale Node.js LTS.
2. Na pasta do projeto execute:

```bash
npm install
npx expo start
```

3. Abra o projeto no Expo Go ou faça um build de desenvolvimento/release.
4. No primeiro acesso, permita as notificações.

Para garantir as versões compatíveis com o SDK instalado, também é possível executar:

```bash
npx expo install @react-native-community/datetimepicker expo-notifications @react-native-async-storage/async-storage
```

## Notificações

As tarefas usam notificações locais, então não existe servidor nem conta para funcionar. Os objetivos usam lembretes recorrentes. Em Android, a permissão de notificações precisa estar liberada pelo sistema.

Para um APK instalado normalmente no seu Android, o fluxo recomendado é gerar um build com EAS ou build local depois de testar.

## Observação

O projeto foi montado com Expo SDK 57 e React Native 0.86. O `package.json` já está preparado para isso.
