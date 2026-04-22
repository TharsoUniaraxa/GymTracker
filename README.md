# GymTracker

Aplicativo mobile de acompanhamento de treinos desenvolvido como projeto semestral da disciplina de Desenvolvimento Mobile.

Autor: Tharso

---

## Stack

- React Native + TypeScript + Expo
- React Navigation v6
- JSON Server (back-end fake)
- Expo Haptics

---

## O que foi entregue

- Login com autenticação via JSON Server
- Home com lista de fichas de treino do usuário
- Criação e exclusão de fichas
- Tela de treino ativo com registro de peso, reps e RPE
- Cálculo de Effective Volume (EV) em tempo real — métrica baseada em evidências científicas que considera o esforço percebido para avaliar o real estímulo de cada série
- 1RM estimado pela fórmula de Epley
- Vibração haptic após 5 minutos sem interação
- Tela de resumo pós-treino com métricas

---

## Como rodar

Pré-requisitos: Node.js, Expo CLI, JSON Server, Expo Go no celular.

```bash
# Instalar dependências
npm install

# Rodar o back-end
cd backend
json-server --watch db.json --port 3000 --host 0.0.0.0

# Atualizar o IP em src/api.ts com o IPv4 da sua máquina (ipconfig no Windows)

# Rodar o app
npx expo start
```

Credenciais de teste: `tharso1209@gmail.com` / `1234`
