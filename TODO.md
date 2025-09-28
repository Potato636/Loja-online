# TODO: Melhorias no Mod MTA Vinculado à Loja

## 1. Atualizar mta-activation.lua
- [x] Mapear produtos da loja (AK-47 Premium, Lamborghini Facção, etc.) às ações MTA corretas
- [x] Usar nomes de produtos em vez de IDs hardcoded
- [x] Adicionar mais mapeamentos para produtos futuros

## 2. Habilitar script cliente
- [x] Descomentar client.lua no meta.xml
- [x] Melhorar notificações no cliente
- [x] Adicionar eventos para notificações de ativação/expiração

## 3. Adicionar mais produtos MTA na seed
- [x] Adicionar produtos como skins, casas, armas adicionais
- [x] Garantir que os nomes correspondam aos mapeamentos MTA

## 4. Melhorar tratamento de expiração
- [x] Implementar lógica de expiração para assinaturas
- [x] Adicionar eventos de expiração no servidor
- [x] Notificar jogadores quando ativações expirarem

## 5. Configurar acesso admin
- [x] Criar usuário admin com serial específico e senha
- [x] Adicionar middleware isAdmin para proteger rotas
- [x] Proteger página admin no frontend
- [x] Executar seed para criar usuário admin

## 6. Configuração de perfil
- [x] Criar página de perfil para usuários logados
- [x] Permitir atualização de email e senha
- [x] Adicionar rota PUT /api/profile no backend
- [x] Implementar updateUser no storage
- [x] Adicionar link de perfil no header
- [x] Validar formulário com Zod

## 7. Backend Integration MTA
- [x] Remover endpoint de registro manual
- [x] Adicionar registro automático via MTA mod
- [x] Adicionar endpoint de sync de stats MTA
- [x] Atualizar login para incluir stats MTA
- [x] Mudar autenticação para usar username ao invés de serial

## 8. Testes e validação
- [x] Testar fluxo completo: compra -> ativação -> notificação
- [x] Verificar mapeamentos corretos
- [x] Testar expiração de ativações
- [x] Testar registro automático via MTA
- [x] Testar sync de stats
