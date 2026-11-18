"""RAG: los textos del hotel, convertidos en vectores y guardados en una base de datos vectorial (Redis)."""
import numpy as np
import redis
from fastembed import TextEmbedding
from redis.commands.search.field import TextField, VectorField
from redis.commands.search.index_definition import IndexDefinition, IndexType
from redis.commands.search.query import Query

DOCUMENTOS = [
    "El check-in es a partir de las 15:00 y el check-out hasta las 12:00.",
    "El wifi es gratis en todo el hotel. La contraseña está en la tarjeta de tu habitación.",
    "Se admiten mascotas de hasta 10 kg con un suplemento de 20 € por noche.",
    "El desayuno se sirve de 7:00 a 10:30 en el restaurante de la planta baja.",
    "El parking cuesta 15 € al día y se reserva en recepción.",
    "La piscina abre de 9:00 a 20:00 de mayo a octubre.",
]

r = redis.Redis()
modelo = TextEmbedding("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")  # 384 números por texto


def vector(texto: str) -> bytes:
    return np.array(next(iter(modelo.embed([texto]))), dtype=np.float32).tobytes()


def indexar():
    """Se hace una vez: cada documento pasa a vector y se guarda con su texto."""
    try:
        r.ft("idx:hotel").dropindex(delete_documents=True)
    except redis.ResponseError:
        pass
    r.ft("idx:hotel").create_index(
        [TextField("texto"), VectorField("vector", "HNSW", {"TYPE": "FLOAT32", "DIM": 384, "DISTANCE_METRIC": "COSINE"})],
        definition=IndexDefinition(prefix=["doc:"], index_type=IndexType.HASH),
    )
    for i, texto in enumerate(DOCUMENTOS):
        r.hset(f"doc:{i}", mapping={"texto": texto, "vector": vector(texto)})


def buscar_trozos(pregunta: str, k: int = 2) -> list[tuple[str, float]]:
    """La pregunta también pasa a vector; Redis devuelve los k textos más cercanos."""
    q = Query(f"*=>[KNN {k} @vector $v AS distancia]").sort_by("distancia").return_fields("texto", "distancia").dialect(2)
    res = r.ft("idx:hotel").search(q, query_params={"v": vector(pregunta)})
    return [(d.texto, round(float(d.distancia), 3)) for d in res.docs]


if __name__ == "__main__":
    indexar()
    for p in ["¿A qué hora es el check-in?", "¿A qué hora puedo entrar a la habitación?", "¿Puedo ir con mi perro?"]:
        print(p, "→", buscar_trozos(p))
