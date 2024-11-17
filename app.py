from flask import Flask, render_template
from controllers.flowchart_controller import flowchart_bp

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

app.register_blueprint(flowchart_bp, url_prefix='/api/flowchart')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True) 