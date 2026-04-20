#!/bin/bash

# Script de Deploy Automático AVC Protocol
# Uso: ./deploy.sh "Mensagem do commit"

# 1. Verificar se há uma mensagem de commit
if [ -z "$1" ]; then
    echo "❌ Erro: Por favor, forneça uma mensagem de commit."
    echo "Exemplo: ./deploy.sh 'Correção nos cards de exame'"
    exit 1
fi

MESSAGE="$1"

echo "🚀 Iniciando processo de deploy..."

# 2. Adicionar todas as alterações
echo "📦 Adicionando alterações..."
git add .

# 3. Fazer o commit
echo "💾 Criando commit: '$MESSAGE'..."
git commit -m "$MESSAGE"

if [ $? -ne 0 ]; then
    echo "⚠️ Nenhum alteração para commit ou erro no git. Verifique o status."
    # Se não houver alterações, o git commit falha, mas podemos continuar se quiser apenas fazer push
    # Para segurança, vamos parar se falhar por outro motivo que não seja 'nothing to commit'
    if ! git status | grep -q "nothing to commit"; then
        exit 1
    fi
fi

# 4. Verificar se o remote 'origin' existe
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo "⚠️ Nenhum repositório remoto configurado!"
    echo "Por favor, crie um repositório no GitHub e cole a URL abaixo:"
    read -p "URL do Repositório (ex: https://github.com/usuario/repo.git): " NEW_URL
    
    if [ -z "$NEW_URL" ]; then
        echo "❌ URL inválida. Cancelando."
        exit 1
    fi
    
    git remote add origin "$NEW_URL"
    echo "✅ Remote configurado com sucesso!"
fi

# 5. Enviar para o GitHub
echo "☁️ Enviando para o GitHub..."
CURRENT_BRANCH=$(git branch --show-current)
git push -u origin "$CURRENT_BRANCH"

if [ $? -eq 0 ]; then
    echo "✅ Código enviado para o GitHub com sucesso!"
    echo "---------------------------------------------------"
    echo "🔗 Próximo passo: Deploy na Vercel"
    echo "Se a Vercel estiver conectada ao seu GitHub, o deploy começará automaticamente."
    echo "Caso contrário, rode: vercel --prod"
    echo "---------------------------------------------------"
else
    echo "❌ Erro ao enviar para o GitHub. Verifique suas credenciais ou conexão."
    exit 1
fi
