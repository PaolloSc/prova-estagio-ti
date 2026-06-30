"""
Questão 3 — Lógica de Programação e Integração (API)

Descobre qual usuário possui a MAIOR quantidade de tarefas pendentes
(completed: false), cruzando os dados de dois endpoints da API pública
JSONPlaceholder.

Uso:
    python usuario_mais_sobrecarregado.py

Requisito: Python 3.8+. Usa apenas a biblioteca padrão (urllib), sem
dependências externas, para rodar em qualquer máquina sem instalar nada.
"""

import json
import urllib.request
from collections import Counter

USERS_URL = "https://jsonplaceholder.typicode.com/users"
TODOS_URL = "https://jsonplaceholder.typicode.com/todos"


def buscar_json(url):
    """Faz a requisição HTTP GET e devolve o JSON já convertido em objeto Python."""
    with urllib.request.urlopen(url, timeout=15) as resposta:
        return json.loads(resposta.read().decode("utf-8"))


def usuario_mais_sobrecarregado(usuarios, tarefas):
    """
    Retorna (nome, qtd_pendentes) do usuário com mais tarefas pendentes.

    Estratégia:
      1. Conta as tarefas pendentes por userId (completed == False).
      2. Mapeia id -> nome para traduzir o userId no nome legível.
      3. Escolhe o userId com a maior contagem.
    """
    # 1. Conta apenas as tarefas pendentes, agrupando por userId.
    pendentes_por_usuario = Counter(
        t["userId"] for t in tarefas if t["completed"] is False
    )

    if not pendentes_por_usuario:
        return None, 0

    # 2. Dicionário id -> nome.
    nome_por_id = {u["id"]: u["name"] for u in usuarios}

    # 3. userId com a maior quantidade de pendências.
    user_id, qtd = pendentes_por_usuario.most_common(1)[0]
    return nome_por_id.get(user_id, f"Usuário {user_id}"), qtd


def main():
    usuarios = buscar_json(USERS_URL)
    tarefas = buscar_json(TODOS_URL)

    nome, qtd = usuario_mais_sobrecarregado(usuarios, tarefas)

    if nome is None:
        print("Nenhuma tarefa pendente encontrada.")
        return

    print("Usuário mais sobrecarregado:")
    print(f"  Nome: {nome}")
    print(f"  Tarefas pendentes: {qtd}")


if __name__ == "__main__":
    main()
