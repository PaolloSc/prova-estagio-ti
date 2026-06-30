"""Teste offline da lógica de cruzamento (não acessa a rede)."""

from usuario_mais_sobrecarregado import usuario_mais_sobrecarregado

usuarios = [
    {"id": 1, "name": "Ana"},
    {"id": 2, "name": "Bruno"},
    {"id": 3, "name": "Carla"},
]
tarefas = [
    {"userId": 1, "completed": False},
    {"userId": 1, "completed": True},
    {"userId": 2, "completed": False},
    {"userId": 2, "completed": False},
    {"userId": 2, "completed": False},  # Bruno tem 3 pendentes (o maior)
    {"userId": 3, "completed": True},
]

nome, qtd = usuario_mais_sobrecarregado(usuarios, tarefas)
assert nome == "Bruno", nome
assert qtd == 3, qtd

# Caso sem pendências
nome2, qtd2 = usuario_mais_sobrecarregado(usuarios, [{"userId": 1, "completed": True}])
assert nome2 is None and qtd2 == 0

print("OK: logica validada.")
