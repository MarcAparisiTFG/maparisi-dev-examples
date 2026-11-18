from flask import Flask

app = Flask(__name__)

@app.get("/productos")
def productos():
    return ["Zapatillas", "Camiseta", "Gorra"]
