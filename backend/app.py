from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return "<h1>Welcome to My Flask App</h1><p>This is a simple Flask server.</p>"

if __name__ == '__main__':
    app.run(debug=True)